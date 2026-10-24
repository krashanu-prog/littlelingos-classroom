/* ================= Simpler menus: grouped pages with tabs, phone "More" ================= */
ICON.menu='<path d="M4 6h16M4 12h16M4 18h16"/>';
/* g: [key, label, icon, tabs [[view,label]...], phone(1 = on the phone bar)] ; "-" = section heading */
function navGroups(){const r=role();
  if(r==="student")return [
    ["home","My garden","leaf",[],1],["path","Path","map",[],1],["words","Words","cards",[]],["play","Play","star",[["play","Games"],["fun","Fun corner"]],1],["homework","Homework","pencil",[],1],["schedule","Classes","cal",[]],["stories","Stories","book",[]],
    ["india","Explore","map",[["india","My India"],["wall","Garden wall"]]],["me","Me","user",[["me","Me"],["notices","Messages"]]]];
  if(r==="parent")return [
    ["home","Overview","heart",[],1],["schedule","Classes","cal",[],1],["progress","Progress","leaf",[["progress","Progress"],["india","Missions"],["wall","Garden wall"]],1],["homework","Homework","pencil",[]],["messages","Messages","bell",[],1],["fees","Fees","rupee",[]],["help","Help","help",[]]];
  if(r==="teacher")return [
    ["home","Today","sunny",[],1],["learners","My learners","users",[]],["schedule","Classes","cal",[["schedule","Classes"],["attendance","Attendance"]],1],["homework","Homework","pencil",[["homework","Homework"],["review","Review"]],1],["inbox","Families","chat",[["inbox","Families"],["notices","Messages"]],1],["library","Content","cards",[["library","Library"],["courses","Courses"],["wod","Word of the Day"],["india","India packs"],["sounds","Sound pairs"],["wall","Garden wall"]]],
    ["reports","Reports","doc",[]],["hours","Me","clock",[["hours","Hours & pay"],["myspace","My space"]]]];
  if(r==="admin")return [
    ["home","Today","sunny",[],1],["-","People"],["learners","Learners","users",[],1],["parents","Parents","heart",[]],["trainers","Trainers","trainer",[]],["leads","Leads","userplus",[]],
    ["-","Teaching"],["schedule","Classes","cal",[["schedule","Classes"],["batches","Batches"],["attendance","Attendance"]],1],["library","Content","cards",[["library","Library"],["courses","Courses"],["wod","Word of the Day"],["india","India packs"],["sounds","Sound pairs"],["wall","Garden wall"],["pipvoice","Pip's voice"]]],
    ["-","Families & money"],["inbox","Families","chat",[["inbox","Families"],["notices","Notices"],["events","Events"]],1],["fees","Fees","rupee",[]],
    ["-","Insights"],["reports","Reports","doc",[["reports","Reports"],["review","Review"],["analytics","Analytics"]]],["settings","Settings","gear",[]]];
  return [];}
const navViews=g=>g[3]&&g[3].length?g[3].map(t=>t[0]):[g[0]];
function navBadges(){const m={};for(const x of navItems())if(x[0]!=="-"&&x[3])m[x[0]]=(m[x[0]]||0)+(+x[3]||0);return m;}
function curNavView(){return ({course:"courses",lesson:"courses",child:"home",settings:isParent()?"help":S.view==="settings"?"settings":"home",capsule:"me",passport:"progress",shares:"progress"}[S.view])||S.view;}
function groupOf(v){return navGroups().find(g=>g[0]!=="-"&&navViews(g).includes(v))||null;}
function navHTML(){
  if(S.status!=="ready"||!role()||role()==="pending"||lockNeeded())return "";
  const cur=curNavView(),b=navBadges(),gs=navGroups();
  const items=gs.map(g=>{if(g[0]==="-")return `<span class="navsec">${esc(g[1])}</span>`;const on=navViews(g).includes(cur);const n=navViews(g).reduce((s,v)=>s+(b[v]||0),0);
    return `<a href="#${g[0]}" data-go="${g[0]}" class="${g[4]?"":"nmore"}" ${on?'aria-current="page"':""}>${ic(g[2])}<span>${esc(g[1])}</span>${n?`<em class="nbadge" aria-label="${n} new">${n}</em>`:""}</a>`;}).join("");
  const moreOn=gs.some(g=>g[0]!=="-"&&!g[4]&&navViews(g).includes(cur)),moreN=gs.filter(g=>g[0]!=="-"&&!g[4]).reduce((s,g)=>s+navViews(g).reduce((t,v)=>t+(b[v]||0),0),0);
  return items+`<a href="#" class="navmore" data-act="navMore" ${moreOn?'aria-current="page"':""}>${ic("menu")}<span>More</span>${moreN?`<em class="nbadge" aria-label="${moreN} new">${moreN}</em>`:""}</a>`;}
A.navMore=()=>{const b=navBadges(),gs=navGroups().filter(g=>g[0]!=="-"&&!g[4]);
  openModal("More",`<div class="moregrid">${gs.map(g=>{const n=navViews(g).reduce((s,v)=>s+(b[v]||0),0);return `<button type="button" class="moretile" data-mact="go" data-id="${esc(g[0])}">${ic(g[2],26)}<b>${esc(g[1])}</b>${g[3].length?`<span>${esc(g[3].map(t=>t[1]).join(" · "))}</span>`:""}${n?`<em class="nbadge">${n}</em>`:""}</button>`;}).join("")}</div>`,
   {actions:{go:v=>{closeModal();go(v);}}});};
function hubTabs(v){const g=groupOf(v);if(!g||g[3].length<2)return "";
  return `<div class="hubtabs" role="tablist" aria-label="${esc(g[1])}">${g[3].map(([t,l])=>`<button type="button" role="tab" class="hubtab ${t===v?"on":""}" aria-selected="${t===v}" data-go="${t}">${esc(l)}</button>`).join("")}</div>`;}
for(const v of Object.keys(VIEWS)){const f=VIEWS[v];VIEWS[v]=function(){return hubTabs(v)+f.apply(this,arguments);};}
