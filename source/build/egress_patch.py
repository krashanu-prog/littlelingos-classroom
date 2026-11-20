# Data use: trainer contact lists were rewritten on every admin page load because the saved copy came back
# with its fields in a different order. Compare the values, not the order, so only real changes are saved.
R('''    for(const [lid,v] of Object.entries(o))if(JSON.stringify(have[lid])!==JSON.stringify(v))await col.doc(lid).set(v);''',
  '''    for(const [lid,v] of Object.entries(o))if(stableJ(have[lid])!==stableJ(v))await col.doc(lid).set(v);''')
R('/* ================= events ================= */','''/* JSON with the keys sorted, so two copies of the same data compare equal whatever order their fields are in */
function stableJ(v){if(v===undefined)return "u";if(v===null||typeof v!=="object")return JSON.stringify(v);
  if(Array.isArray(v))return "["+v.map(stableJ).join(",")+"]";
  return "{"+Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>JSON.stringify(k)+":"+stableJ(v[k])).join(",")+"}";}
/* ================= events ================= */''')
