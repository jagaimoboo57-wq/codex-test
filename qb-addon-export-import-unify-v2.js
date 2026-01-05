/*
  qb-addon-export-import-unify-v2.js
  Fix: Prevent infinite MutationObserver loops / "loading forever".
  - Re-applies only when Share card exists and not yet applied.

  Restores "export/import unify" behavior (old fix18) without modifying app.js.
*/
(function(){
  const KEY = "quest_board_state_v1";
  const STYLE_ID = "qb-export-import-unify-style";
  const DONE_ATTR = "data-qb-export-import-unify";

  function injectCSS(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .share-actions{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px; }
      .file-btn{
        display:inline-flex; align-items:center; justify-content:center; gap:8px;
        padding:6px 10px; border:1px solid var(--line, #d8dbe4); border-radius:8px;
        background:var(--panel, #fff); color:inherit; font:inherit; cursor:pointer; user-select:none;
        appearance:none; -webkit-appearance:none; text-decoration:none;
        box-shadow: 0 1px 2px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.08);
        font-weight:600;
      }
      .file-btn input[type="file"]{ display:none; }
      .share-hint{ margin:0 0 12px 0; font-size:12px; line-height:1.6; color: var(--muted, #667085); }
    `;
    document.head.appendChild(style);
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

  function exportNow(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw){ alert("保存データが見つかりません（localStorageが空です）"); return; }
      JSON.parse(raw);
      downloadJson(raw);
    }catch(e){
      console.error("[QB export]", e);
      alert("JSONエクスポートに失敗しました（データ破損の可能性）");
    }
  }

  function importNow(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try{
        const text = String(ev.target.result || "");
        const parsed = JSON.parse(text);
        localStorage.setItem(KEY, JSON.stringify(parsed));
        alert("JSONを読み込みました。再読み込みします。");
        location.reload();
      }catch(e){
        console.error("[QB import]", e);
        alert("JSONの読み込みに失敗しました（形式が不正です）");
      }
    };
    reader.readAsText(file);
  }

  function findShareCard(appRoot){
    const h3s = appRoot.querySelectorAll("h3");
    for(const h3 of h3s){
      if((h3.textContent || "").includes("出力・共有")){
        return h3.closest(".card") || h3.parentElement;
      }
    }
    return null;
  }

  function ensureUnifiedUI(shareCard){
    if(!shareCard || shareCard.getAttribute(DONE_ATTR) === "1") return;

    // Export button
    let exportBtn = shareCard.querySelector("#export-json");
    if(!exportBtn){
      const btns = Array.from(shareCard.querySelectorAll("button"));
      exportBtn = btns.find(b => (b.textContent||"").includes("エクスポート")) || null;
      if(exportBtn) exportBtn.id = "export-json";
    }
    if(exportBtn){
      exportBtn.classList.add("file-btn");
      exportBtn.textContent = "JSONエクスポート";
    }

    // Import input
    let importInput = shareCard.querySelector("#import-json");
    if(!importInput){
      importInput = shareCard.querySelector('input[type="file"]') || null;
      if(importInput) importInput.id = "import-json";
    }
    if(importInput){
      importInput.setAttribute("accept", "application/json");
      // Wrap with label.file-btn
      if(!(importInput.parentElement && importInput.parentElement.classList && importInput.parentElement.classList.contains("file-btn"))){
        const label = document.createElement("label");
        label.className = "file-btn";
        label.title = "JSONファイルを選択してインポート";
        const textNode = document.createTextNode("JSONインポート");
        importInput.parentElement.insertBefore(label, importInput);
        label.appendChild(importInput);
        label.appendChild(textNode);
      }else{
        const label = importInput.parentElement;
        if(label && label.tagName === "LABEL"){
          const keep = [importInput];
          Array.from(label.childNodes).forEach(n => { if(!keep.includes(n)) n.remove(); });
          label.appendChild(document.createTextNode("JSONインポート"));
        }
      }
    }

    // Actions row
    const actions = shareCard.querySelector(".share-actions") || (function(){
      const d = document.createElement("div");
      d.className = "share-actions";
      const h3 = shareCard.querySelector("h3");
      if(h3 && h3.parentElement) h3.parentElement.insertBefore(d, h3.nextSibling);
      else shareCard.insertBefore(d, shareCard.firstChild);
      return d;
    })();

    if(exportBtn && exportBtn.parentElement !== actions) actions.appendChild(exportBtn);
    if(importInput){
      const label = importInput.parentElement;
      if(label && label.parentElement !== actions) actions.appendChild(label);
    }

    if(!shareCard.querySelector(".share-hint")){
      const hint = document.createElement("div");
      hint.className = "share-hint";
      hint.textContent = "※ インポートは「施策を開いた状態」で行います。初回は左下から空の施策を1つ作成してから、ここでJSONを読み込んでください。";
      actions.insertAdjacentElement("afterend", hint);
    }

    // Handlers
    if(exportBtn && !exportBtn.dataset.qbExportBound){
      exportBtn.dataset.qbExportBound = "1";
      exportBtn.addEventListener("click", (e) => { e.preventDefault(); exportNow(); });
    }
    if(importInput && !importInput.dataset.qbImportBound){
      importInput.dataset.qbImportBound = "1";
      importInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if(file) importNow(file);
        e.target.value = "";
      });
    }

    shareCard.setAttribute(DONE_ATTR, "1");
  }

  function run(){
    injectCSS();
    const appRoot = document.getElementById("app");
    if(!appRoot) return;

    const tick = () => {
      const share = findShareCard(appRoot);
      if(share) ensureUnifiedUI(share);
    };

    const mo = new MutationObserver(() => tick());
    mo.observe(appRoot, { childList:true, subtree:true });
    tick();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
