// In-memory stand-in for supabase-js used by adapter.js, for local testing.
// Mirrors schema.sql access rules so the app is exercised under the same limits.
(function(){
  const cfg = window.__FAKE__ || {};           // {store:{path:data}, people:{id:name}, users:{id:email}, session:{id,email}|null, admins:[email]}
  const store = cfg.store || {}; window.__STORE__ = store;
  const people = cfg.people || {}; window.__PEOPLE__ = people;
  const admins = (cfg.admins || []).map(x=>x.toLowerCase());
  const RULES = {config:[1,4],learners:[2,4],trainers:[2,4],notices:[2,4],fees:[4,4],private:[4,4],profiles:[2,4],'profiles/{self}':[1,1],
    progress:[2,4],'progress/{self}':[null,2],answers:[2,4],'answers/{self}':[null,2],tw:[2,4],'tw/{self}':[null,2],kp:[2,4],'kp/{self}':[null,2],
    timesheets:[4,4],'timesheets/{self}':[2,2],contacts:[4,4],'contacts/{self}':[2,null],courses:[2,3],lessons:[2,3],sessions:[2,3],library:[2,3],
    pp:[3,3],'pp/{self}':[2,2],ppi:[3,3],'ppi/{self}':[2,2],pf:[4,4],'pf/{self}':[2,null],ptm:[2,3],ptmb:[2,4],'ptmb/{self}':[null,2],ad:[4,4],
    batches:[2,4],events:[2,4],evr:[2,4],'evr/{self}':[null,2]};
  let session = cfg.session ? {user:{id:cfg.session.id,email:cfg.session.email,user_metadata:{pw_set:true}},access_token:'t'} : null;  /* returning users have set a password */
  const uid = () => session && session.user.id;
  function level(){
    if(!uid()) return 0;
    if(admins.includes(String(session.user.email).toLowerCase())) return 4;
    for(const [p,d] of Object.entries(store)) if(p.startsWith('trainers/')&&p.split('/').length===2&&d.uid===uid()&&d.active!==false) return 3;
    for(const [p,d] of Object.entries(store)) if(p.startsWith('learners/')&&p.split('/').length===2&&d.active!==false&&(d.uid===uid()||(d.parents||[]).includes(uid()))) return 2;
    return 1;
  }
  function need(path, op){
    const xs=path.split('/'); let best=null, bd=-1;
    for(const [pat,rw] of Object.entries(RULES)){ const ps=pat.split('/'); if(ps.length>xs.length) continue;
      if(!ps.every((s,i)=>s===xs[i]||(s==='{self}'&&xs[i]===uid()))) continue; const v=rw[op==='r'?0:1]; if(v==null) continue; if(ps.length>bd){bd=ps.length;best=v;} }
    return best==null?2:best;
  }
  const can=(p,op)=>level()>=need(p,op);
  window.__CAN__=can; window.__LEVEL__=level; window.__CHANGED__=(p)=>changed(p,"UPDATE");
  const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));
  const parentOf=p=>p.split('/').slice(0,-1).join('/');
  function merge(a,b){a=clone(a)||{};for(const [k,v] of Object.entries(b||{})){if(v&&typeof v==='object'&&!Array.isArray(v)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))a[k]=merge(a[k],v);else a[k]=clone(v);}return a;}
  const listeners=new Set();
  function changed(path,type){ setTimeout(()=>{for(const f of listeners) f({eventType:type,new:type==='DELETE'?{}:{path},old:{path}});},5); }
  const rls={code:'42501',message:'new row violates row-level security policy for table "docs"'};
  function query(table){
    const q={table,filters:[],single:false,rangeV:null,op:'select',payload:null};
    const api={
      select(){return api}, order(){return api},
      eq(k,v){q.filters.push(r=>r[k]===v);return api}, in(k,vs){q.filters.push(r=>vs.includes(r[k]));return api},
      range(a,b){q.rangeV=[a,b];return api}, maybeSingle(){q.single=true;return api},
      upsert(row){q.op='upsert';q.payload=row;return api}, delete(){q.op='delete';return api},
      then(res,rej){return Promise.resolve(run()).then(res,rej)}
    };
    function run(){
      if(!session) return {data:null,error:{message:'not signed in'}};
      if(table==='people'){ let rows=Object.entries(people).map(([id,name])=>({id,name})).filter(r=>r.id===uid()||level()>=2); for(const f of q.filters) rows=rows.filter(f); return {data:q.single?(rows[0]||null):rows,error:null}; }
      if(q.op==='upsert'){ const p=q.payload.path; if(!can(p,'w')) return {data:null,error:rls}; const t=store[p]?'UPDATE':'INSERT'; store[p]=clone(q.payload.data); if(p.startsWith('profiles/')&&q.payload.data.displayName) people[p.split('/')[1]]=q.payload.data.displayName; changed(p,t); return {data:null,error:null}; }
      let rows=Object.entries(store).map(([path,data])=>({path,parent:parentOf(path),data}));
      for(const f of q.filters) rows=rows.filter(f);
      if(q.op==='delete'){ for(const r of rows) if(can(r.path,'w')){ delete store[r.path]; changed(r.path,'DELETE'); } return {data:null,error:null}; }
      rows=rows.filter(r=>can(r.path,'r')).sort((a,b)=>a.path<b.path?-1:1).map(r=>({path:r.path,data:clone(r.data)}));
      if(q.rangeV) rows=rows.slice(q.rangeV[0],q.rangeV[1]+1);
      return {data:q.single?(rows[0]||null):rows,error:null};
    }
    return api;
  }
  const client={
    from:query,
    rpc:async(name,args)=>{
      if(name==='ll_level') return {data:level(),error:null};
      if(name==='ll_update'){ const p=args.p; if(!store[p]||!can(p,'w')||!can(p,'r')) return {data:null,error:{code:'P0002',message:'missing'}}; store[p]=merge(store[p],args.patch); if(p.startsWith('profiles/')&&store[p].displayName) people[p.split('/')[1]]=store[p].displayName; changed(p,'UPDATE'); return {data:null,error:null}; }
      return {data:null,error:{message:'no rpc'}};
    },
    channel:()=>{const ch={on:(_e,_f,cb)=>{listeners.add(cb);return ch},subscribe:cb=>{setTimeout(()=>cb&&cb('SUBSCRIBED'),1);return ch}};return ch;},
    storage:{from:()=>({upload:async(id)=>(window.__UPLOADS__=(window.__UPLOADS__||[]).concat(id),{data:{path:id},error:null}),remove:async()=>({error:null}),getPublicUrl:id=>({data:{publicUrl:'https://fake.supabase.co/storage/v1/object/public/assets/'+id}})})},
    auth:{
      getSession:async()=>({data:{session}}),
      onAuthStateChange:cb=>{client.__authcb=cb;return {data:{subscription:{unsubscribe(){}}}}},
      signInWithOtp:async({email})=>{window.__OTP_EMAIL__=email;return {error:null}},
      verifyOtp:async({email,token})=>{ if(token!=='123456') return {error:{message:'Token has expired or is invalid'}};
        const id=Object.entries(cfg.users||{}).find(([,e])=>e===email)?.[0]||('99999999-0000-0000-0000-'+String(Date.now()).slice(-12));
        session={user:{id,email},access_token:'t'}; if(!people[id]) people[id]=email.split('@')[0]; setTimeout(()=>client.__authcb&&client.__authcb('SIGNED_IN',session),1); return {error:null}; },
      updateUser:async(u)=>{if(session&&u&&u.password){window.__PW_SET__=true;session.user.user_metadata={...(session.user.user_metadata||{}),pw_set:true};}return {data:{user:session&&session.user},error:null}},
      getUser:async()=>({data:{user:session&&session.user},error:null}),
      mfa:{listFactors:async()=>({data:{all:[],totp:[]},error:null}),getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:'aal1',nextLevel:'aal1'},error:null})},
      signOut:async()=>{session=null;window.__SIGNED_OUT__=true;return {error:null}}
    }
  };
  window.supabase={createClient:()=>client};
})();
