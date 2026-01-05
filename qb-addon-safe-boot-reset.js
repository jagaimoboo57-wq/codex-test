/*
  qb-addon-safe-boot-reset.js
  Purpose:
    - Prevent white screen when localStorage has incompatible/broken JSON.
    - If quest_board_state_v1 is invalid or missing required keys, back it up and reset to a valid minimal state.

  Notes:
    - Does NOT modify app.js.
*/
(function(){
  const KEY="quest_board_state_v1";
  const BACKUP_KEY="quest_board_state_v1__backup_bad";
  const MIN_STATE={"app": {"name": "Quest Board", "version": "1.0.0", "updatedAt": "2026-01-05T13:45:08.330844Z"}, "ui": {"activeProjectId": "035d0523-d726-4405-945e-2a5ca4657504", "activeInitiativeId": "651aaa03-6894-4db0-a05b-242ddcc9ac9d", "activeTab": "ROADMAP", "activePhaseId": "957ad037-4c96-4f3c-8b25-a75f5dc2a801"}, "projects": [{"id": "035d0523-d726-4405-945e-2a5ca4657504", "name": "サンプルプロジェクト", "createdAt": "2026-01-05T13:45:08.330844Z", "updatedAt": "2026-01-05T13:45:08.330844Z", "initiativeOrder": ["651aaa03-6894-4db0-a05b-242ddcc9ac9d"], "initiatives": [{"id": "651aaa03-6894-4db0-a05b-242ddcc9ac9d", "name": "インポート復旧", "summary": "インポートデータを復旧しました", "status": "進行中", "createdAt": "2026-01-05T13:45:08.330844Z", "updatedAt": "2026-01-05T13:45:08.330844Z", "roadmap": {"phaseOrder": ["957ad037-4c96-4f3c-8b25-a75f5dc2a801"], "phases": [{"id": "957ad037-4c96-4f3c-8b25-a75f5dc2a801", "title": "初期フェーズ", "status": "進行中", "updatedAt": "2026-01-05T13:45:08.330844Z"}]}, "fixed": {"rules": "", "assumptions": ""}, "review": {"goal": "", "hypothesis": ""}, "logs": []}]}], "lastSaved": "2026-01-05T13:45:08.330844Z"};
  function isValidState(o){
    return o && typeof o==="object"
      && o.app && o.ui && Array.isArray(o.projects)
      && o.ui.activeProjectId;
  }
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw) return;
    let obj=null;
    try{ obj=JSON.parse(raw); }catch(e){ obj=null; }
    if(!isValidState(obj)){
      // backup once
      if(!localStorage.getItem(BACKUP_KEY)){
        localStorage.setItem(BACKUP_KEY, raw);
      }
      localStorage.setItem(KEY, JSON.stringify(MIN_STATE));
      alert("インポートデータの形式がQuest Boardと一致しないため、安全のため初期化しました。\nバックアップ: "+BACKUP_KEY);
      location.reload();
    }
  }catch(e){ console.error("[safe-boot-reset]", e); }
})();
