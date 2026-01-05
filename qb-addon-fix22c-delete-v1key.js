/*
  Quest Board addon bridge (fix22c -> fix22c2 compatibility)
  Purpose:
   - If index.html still references qb-addon-fix22c-delete-v1key.js, this file prevents ERR_FILE_NOT_FOUND.
   - It will try to load qb-addon-fix22c2-delete-v1key.js, and also provides deletePhase/deleteInitiative fallbacks.
  Safe policy:
   - Does NOT touch app.js.
   - Works with localStorage key: quest_board_state_v1 (app.js convention).
*/
(function(){
  const KEY = "quest_board_state_v1";
  function log(...a){ try{ console.log("[QB bridge]", ...a);}catch(e){} }
  function warn(...a){ try{ console.warn("[QB bridge]", ...a);}catch(e){} }
  function err(...a){ try{ console.error("[QB bridge]", ...a);}catch(e){} }

  // 1) Try to load fix22c2 if not already present.
  const c2src = "qb-addon-fix22c2-delete-v1key.js";
  const already = Array.from(document.scripts || []).some(s => (s.getAttribute("src")||"").includes(c2src));
  if(!already){
    const s = document.createElement("script");
    s.src = c2src;
    s.async = false;
    s.onload = () => log("Loaded", c2src);
    s.onerror = () => warn("Failed to load", c2src, "→ fallback deletePhase/deleteInitiative will be used.");
    document.head.appendChild(s);
  }

  // Helpers
  function loadState(){
    try{
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ err("loadState failed", e); return null; }
  }
  function saveState(state){
    try{
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    }catch(e){ err("saveState failed", e); return false; }
  }
  function normalizeRoadmap(initiative){
    if(!initiative) return null;
    const rm = initiative.roadmap || initiative.roadMap || initiative.road_map || null;
    return rm;
  }
  function getSelectedInitiativeId(){
    // Try common globals set by app.js patterns; if not found, return null.
    return window.selectedInitiativeId || window.currentInitiativeId || window.activeInitiativeId || null;
  }

  // 2) Provide fallbacks expected by app.js
  // deletePhase(phaseId) : remove phase from selected initiative roadmap
  if(typeof window.deletePhase !== "function"){
    window.deletePhase = function(phaseId){
      try{
        const state = loadState();
        if(!state){ warn("No state found"); return; }
        const projects = Array.isArray(state.projects) ? state.projects : [];
        const iid = getSelectedInitiativeId();
        let touched = false;

        for(const p of projects){
          const inits = Array.isArray(p.initiatives) ? p.initiatives : [];
          for(const it of inits){
            if(iid && it && it.id !== iid) continue;
            const rm = normalizeRoadmap(it);
            if(!rm) continue;

            // phase list could be array, or { phases: [], phaseOrder: [] }
            if(Array.isArray(rm)){
              const before = rm.length;
              const next = rm.filter(x => x && x.id !== phaseId);
              if(next.length !== before){
                it.roadmap = next;
                touched = true;
              }
            }else if(typeof rm === "object"){
              if(Array.isArray(rm.phases)){
                const before = rm.phases.length;
                rm.phases = rm.phases.filter(x => x && x.id !== phaseId);
                if(rm.phases.length !== before) touched = true;
              }
              if(Array.isArray(rm.phaseOrder)){
                const before = rm.phaseOrder.length;
                rm.phaseOrder = rm.phaseOrder.filter(id => id !== phaseId);
                if(rm.phaseOrder.length !== before) touched = true;
              }
              // also support roadmap.items
              if(Array.isArray(rm.items)){
                const before = rm.items.length;
                rm.items = rm.items.filter(x => x && x.id !== phaseId);
                if(rm.items.length !== before) touched = true;
              }
              it.roadmap = rm;
            }
            if(iid) break;
          }
          if(iid && touched) break;
        }

        if(touched){
          saveState(state);
          location.reload();
        }else{
          warn("Phase not found or not selected:", phaseId);
        }
      }catch(e){
        err("deletePhase fallback failed", e);
      }
    }
  }

  // deleteInitiative(initiativeId) : remove initiative from whichever project holds it
  if(typeof window.deleteInitiative !== "function"){
    window.deleteInitiative = function(initiativeId){
      try{
        const state = loadState();
        if(!state){ warn("No state found"); return; }
        const projects = Array.isArray(state.projects) ? state.projects : [];
        let touched = false;

        for(const p of projects){
          const inits = Array.isArray(p.initiatives) ? p.initiatives : [];
          const before = inits.length;
          p.initiatives = inits.filter(it => it && it.id !== initiativeId);
          if(p.initiatives.length !== before){
            touched = true;
            break;
          }
        }
        if(touched){
          saveState(state);
          location.reload();
        }else{
          warn("Initiative not found:", initiativeId);
        }
      }catch(e){
        err("deleteInitiative fallback failed", e);
      }
    }
  }

  log("Bridge ready. If you still see ERR_FILE_NOT_FOUND, ensure this file exists next to index.html.");
})();
