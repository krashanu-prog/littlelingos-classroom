"""Tiny stand-in for Supabase's REST API (PostgREST) on top of the local Postgres,
so the real supabase-js + adapter.js + SQL rules can be tested end to end.
Serves the site folder too. Usage: python3 minirest.py <port> <dbname> <sitedir>"""
import sys, json, base64, re, os, threading, urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import psycopg2, psycopg2.extras

PORT, DB, SITE = int(sys.argv[1]), sys.argv[2], sys.argv[3]
LOG = []

def conn():
    c = psycopg2.connect(host='127.0.0.1', dbname=DB, user='postgres', password='pw')
    c.autocommit = False
    return c

def claims_from(headers):
    auth = headers.get('Authorization', '')
    tok = auth.split(' ', 1)[1] if ' ' in auth else ''
    parts = tok.split('.')
    if len(parts) == 3:
        try:
            pl = json.loads(base64.urlsafe_b64decode(parts[1] + '==='))
            if pl.get('role') == 'authenticated': return pl
        except Exception: pass
    return None

def run(headers, sql, params=(), fetch=True):
    cl = claims_from(headers)
    c = conn(); cur = c.cursor()
    try:
        if cl:
            cur.execute("select set_config('request.jwt.claim.sub', %s, true), set_config('request.jwt.claims', %s, true)", (cl['sub'], json.dumps(cl)))
            cur.execute("set local role authenticated")
        else:
            cur.execute("set local role anon")
        cur.execute(sql, params)
        rows = cur.fetchall() if fetch and cur.description else []
        cols = [d[0] for d in cur.description] if cur.description else []
        c.commit()
        return 200, [dict(zip(cols, r)) for r in rows], cols
    except psycopg2.Error as e:
        c.rollback()
        code = e.pgcode or 'XX000'
        status = 403 if code == '42501' else 404 if code == '42883' else 400
        return status, {'code': code, 'message': (e.diag.message_primary or str(e)), 'details': None, 'hint': None}, None
    finally:
        c.close()

def parse_filters(q):
    where, params, order, limit, offset = [], [], None, None, None
    for k, vals in q.items():
        v = vals[0]
        if k == 'select': continue
        if k == 'order': order = v; continue
        if k == 'limit': limit = int(v); continue
        if k == 'offset': offset = int(v); continue
        if k == 'on_conflict': continue
        op, _, val = v.partition('.')
        if not re.match(r'^[a-z_]+$', k): raise ValueError(k)
        if op == 'eq': where.append(f'"{k}" = %s'); params.append(val)
        elif op == 'in':
            items = [x.strip('"') for x in val.strip('()').split(',') if x]
            where.append(f'"{k}"::text = any(%s)'); params.append(items)
        else: raise ValueError(op)
    return where, params, order, limit, offset

def order_sql(order):
    if not order: return ''
    col, _, d = order.partition('.')
    if not re.match(r'^[a-z_]+$', col): return ''
    return f' order by "{col}" {"desc" if d.startswith("desc") else "asc"}'

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=SITE, **k)
    def log_message(self, *a): pass
    def send_json(self, status, body, extra=None):
        b = json.dumps(body, default=str).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b)))
        self.send_header('Access-Control-Allow-Origin', '*')
        for k, v in (extra or {}).items(): self.send_header(k, v)
        self.end_headers(); self.wfile.write(b)
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in [('Access-Control-Allow-Origin', '*'), ('Access-Control-Allow-Headers', '*'), ('Access-Control-Allow-Methods', '*')]: self.send_header(k, v)
        self.end_headers()
    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        return json.loads(self.rfile.read(n) or b'null') if n else None
    def single(self, status, rows):
        if 'vnd.pgrst.object' in (self.headers.get('Accept') or ''):
            if status == 200 and len(rows) != 1:
                return self.send_json(406, {'code': 'PGRST116', 'message': 'JSON object requested, multiple (or no) rows returned', 'details': f'The result contains {len(rows)} rows', 'hint': None})
            return self.send_json(status, rows[0] if status == 200 else rows)
        return self.send_json(status, rows)
    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        if u.path == '/config.js':
            b = f'window.LL_CONFIG={{supabaseUrl:"http://127.0.0.1:{PORT}",supabaseAnonKey:"anon"}};'.encode()
            self.send_response(200); self.send_header('Content-Type', 'application/javascript'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b); return
        m = re.match(r'^/rest/v1/(docs|people|ll_changes)$', u.path)
        if m:
            t = m.group(1); q = urllib.parse.parse_qs(u.query)
            sel = q.get('select', ['*'])[0]
            cols = ','.join(f'"{c}"' for c in sel.split(',')) if sel != '*' else '*'
            where, params, order, limit, offset = parse_filters(q)
            sql = f'select {cols} from public.{t}' + (' where ' + ' and '.join(where) if where else '') + order_sql(order)
            if limit is not None: sql += f' limit {limit}'
            if offset: sql += f' offset {offset}'
            st, rows, _ = run(self.headers, sql, params)
            LOG.append(('GET', t, st))
            return self.single(st, rows)
        if u.path.startswith('/auth/v1/'):
            return self.send_json(200, {})
        if u.path.startswith('/realtime/') or u.path.startswith('/storage/'):
            return self.send_json(404, {'message': 'not in test server'})
        return super().do_GET()
    def do_POST(self):
        u = urllib.parse.urlparse(self.path); q = urllib.parse.parse_qs(u.query)
        m = re.match(r'^/rest/v1/rpc/([a-z_]+)$', u.path)
        if m:
            fn = m.group(1); args = self.body() or {}
            names = list(args.keys())
            argsql = ', '.join(f'{k} => %s' for k in names)
            vals = [json.dumps(v) if isinstance(v, (dict, list)) and k in ('patch',) else (v if not isinstance(v, list) else v) for k, v in args.items()]
            # set-returning or scalar?
            where, params, order, limit, offset = parse_filters({k: v for k, v in q.items()})
            sql = f'select * from public.{fn}({argsql})' + order_sql(order)
            if limit is not None: sql += f' limit {limit}'
            if offset: sql += f' offset {offset}'
            st, rows, cols = run(self.headers, sql, vals)
            LOG.append(('RPC', fn, st))
            if st != 200: return self.send_json(st, rows)
            if cols == [fn]:  # scalar function
                v = rows[0][fn] if rows else None
                return self.send_json(200, v)
            return self.single(200, rows)
        if u.path == '/rest/v1/docs':
            b = self.body(); items = b if isinstance(b, list) else [b]
            for it in items:
                st, rows, _ = run(self.headers, 'insert into public.docs(path, data) values (%s, %s::jsonb) on conflict (path) do update set data = excluded.data',
                                  (it['path'], json.dumps(it.get('data') or {})), fetch=False)
                LOG.append(('UPSERT', it['path'], st))
                if st != 200: return self.send_json(st, rows)
            self.send_response(201); self.send_header('Content-Length', '0'); self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers(); return
        if u.path.startswith('/auth/v1/'):
            return self.send_json(200, {})
        self.send_json(404, {'message': 'nope'})
    def do_DELETE(self):
        u = urllib.parse.urlparse(self.path); q = urllib.parse.parse_qs(u.query)
        if u.path == '/rest/v1/docs':
            where, params, *_ = parse_filters(q)
            st, rows, _ = run(self.headers, 'delete from public.docs where ' + ' and '.join(where), params, fetch=False)
            LOG.append(('DELETE', params, st))
            if st != 200: return self.send_json(st, rows)
            self.send_response(204); self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers(); return
        self.send_json(404, {'message': 'nope'})
    do_PATCH = do_POST

ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
