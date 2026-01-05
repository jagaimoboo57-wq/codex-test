/*
  qb-preboot-sanitizer.js
  Run BEFORE app.js.
  If quest_board_state_v1 is missing ui.activeProjectId (or JSON invalid),
  back it up and clear it so app.js can boot with its default init.
*/
(function(){
  const KEY="quest_board_state_v1";
  const BACKUP="quest_board_state_v1__backup_preboot_bad";
  function isOk(o){
    return o && typeof o==="object" && o.ui && typeof o.ui.activeProjectId!=="undefined";
  }
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw) return;
    let obj=null;
    try{ obj=JSON.parse(raw); }catch(e){ obj=null; }
    if(!isOk(obj)){
      if(!localStorage.getItem(BACKUP)){
        localStorage.setItem(BACKUP, raw);
      }
      localStorage.removeItem(KEY); // let app.js re-init
    }
  }catch(e){
    // if localStorage blocked, ignore
    console.error("[preboot]", e);
  }
})();
