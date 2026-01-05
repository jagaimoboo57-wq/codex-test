/*
  qb-addon-export-singleton-v2.js
  Fix for previous v1 issue: export triggered on any click.

  Behavior:
    - Intercepts clicks ONLY when the actual clicked element is inside the export button itself.
    - Export button detection is STRICT:
        * id === "export-json" OR
        * button text EXACTLY "JSONエクスポート"
    - Additionally requires the click occurs inside the 「出力・共有」card to avoid false positives.

  Safe:
    - Does not modify app.js
*/
(function(){
  const KEY = "quest_board_state_v1";

  function findShareCard(){
    const h3s = document.querySelectorAll("h3");
    for(const h3 of h3s){
      if((h3.textContent||"").includes("出力・共有")){
        return h3.closest(".card") || h3.parentElement;
      }
    }
    return null;
  }

  function getExportButton(shareCard){
    if(!shareCard) return null;
    // Prefer id
    let btn = shareCard.querySelector("button#export-json");
    if(btn) return btn;

    // Strict text match
    const buttons = Array.from(shareCard.querySelectorAll("button"));
    btn = buttons.find(b => ((b.textContent||"").trim() === "JSONエクスポート")) || null;
    if(btn && !btn.id) btn.id = "export-json";
    return btn;
  }

  function downloadJson(text){
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quest_board_state.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportOnce(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw){
        alert("保存データが見つかりません（localStorageが空です）");
        return;
      }
      JSON.parse(raw);
      downloadJson(raw);
    }catch(e){
      console.error("[QB export-singleton-v2]", e);
      alert("JSONエクスポートに失敗しました（データ破損の可能性）");
    }
  }

  function onClickCapture(e){
    const shareCard = findShareCard();
    if(!shareCard) return;

    const exportBtn = getExportButton(shareCard);
    if(!exportBtn) return;

    const clickedBtn = e.target && e.target.closest ? e.target.closest("button") : null;
    if(!clickedBtn) return;

    // Only if user actually clicked the export button itself
    if(clickedBtn !== exportBtn) return;

    e.preventDefault();
    if(typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
    else e.stopPropagation();

    exportOnce();
  }

  function start(){
    document.addEventListener("click", onClickCapture, true);
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
