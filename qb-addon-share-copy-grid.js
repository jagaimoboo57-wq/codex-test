/*
  qb-addon-share-copy-grid.js
  Purpose:
    - Restore the enhanced "出力・共有" layout (2x2 copy grid + UI polish)
      that previously existed in app_fix19_share_copy_grid.js,
      without modifying app.js (addon-only).

  How it works:
    - Injects the CSS used for share-actions / share-grid / copy-area
    - Observes re-renders and, when the Share tab is visible, restructures
      the DOM to wrap the 4 copy blocks into a .share-grid container.

  Safety:
    - No changes to localStorage.
    - Idempotent: safe to run multiple times.
*/
(function(){
  const STYLE_ID = "qb-share-copy-grid-addon-style";
  const MARK_DONE = "data-qb-share-grid-done";

  function injectCSS(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Share tab actions */
      .share-actions{
        display:flex;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
      }
      .share-hint{
        margin:0 0 12px 0;
        font-size:12px;
        line-height:1.6;
      }

      /* Share tab: 2x2 grid for copy blocks (responsive) */
      .share-grid{
        display:grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap:12px;
        margin-top:12px;
      }
      @media (max-width: 980px){
        .share-grid{ grid-template-columns: 1fr; }
      }

      .copy-area{
        display:flex;
        gap:10px;
        align-items:stretch;
      }
      .copy-area textarea{
        flex:1 1 auto;
        min-width:0;
        height:120px;
        resize:vertical;
        font-size:12px;
        line-height:1.5;
        padding:10px;
        border:1px solid var(--line, #d8dbe4);
        border-radius:10px;
        background:#fff;
      }
      .copy-area button{
        flex:0 0 auto;
        height:40px;
        align-self:flex-start;
        padding:0 12px;
        border:1px solid var(--line, #d8dbe4);
        border-radius:10px;
        background:var(--panel, #fff);
        cursor:pointer;
        font-size:12px;
        white-space:nowrap;
      }
    `;
    document.head.appendChild(style);
  }

  function findShareRoot(appRoot){
    // find a section/card that contains H3 "出力・共有"
    const candidates = appRoot.querySelectorAll("h3");
    for(const h3 of candidates){
      if((h3.textContent || "").includes("出力・共有")){
        // pick the nearest card/container
        return h3.closest(".card") || h3.parentElement;
      }
    }
    return null;
  }

  function enhanceShare(shareCard){
    if(!shareCard || shareCard.getAttribute(MARK_DONE) === "1") return;

    // 1) Make actions row have .share-actions class if possible
    // Heuristic: the first container after H3 that contains export/import controls
    const h3 = shareCard.querySelector("h3");
    if(!h3) return;

    // 2) Collect copy blocks: cards that contain H4 and a textarea + copy button
    const innerCards = Array.from(shareCard.querySelectorAll(":scope .card"));
    const copyCards = innerCards.filter(c => {
      const h4 = c.querySelector("h4");
      const ta = c.querySelector("textarea");
      const btn = c.querySelector("button");
      return !!(h4 && ta && btn);
    });

    // We expect 4 copy blocks
    if(copyCards.length < 2){
      // Maybe app.js uses different nesting (e.g. direct divs). Try broader:
      const all = Array.from(shareCard.querySelectorAll(".card"));
      const cc = all.filter(c => {
        const h4 = c.querySelector("h4");
        const ta = c.querySelector("textarea");
        const btn = c.querySelector("button");
        return !!(h4 && ta && btn);
      });
      if(cc.length >= 2) {
        // continue with cc
        copyCards.length = 0
        for (const c of cc) copyCards.push(c);
      } else {
        shareCard.setAttribute(MARK_DONE, "1");
        return;
      }
    }

    // Ensure each copy area has .copy-area
    for(const c of copyCards){
      const area = c.querySelector(".copy-area") || c.querySelector("div");
      // If the textarea+button are direct children of a div, use that
      const ta = c.querySelector("textarea");
      const btn = c.querySelector("button");
      if(ta && btn){
        // Find common parent
        const parent = (ta.parentElement === btn.parentElement) ? ta.parentElement : null;
        if(parent && !parent.classList.contains("copy-area")){
          parent.classList.add("copy-area");
        }
      }
    }

    // 3) Create grid container and move the copy cards into it
    const grid = document.createElement("div");
    grid.className = "share-grid";

    // Insert grid after hint (if exists), otherwise after actions row or H3
    let insertAfter = null;
    const hint = shareCard.querySelector(".share-hint");
    if(hint) insertAfter = hint;
    if(!insertAfter){
      // actions row heuristic: first element that contains #export-json or #import-json
      const exportBtn = shareCard.querySelector("#export-json");
      const importInput = shareCard.querySelector("#import-json");
      if(exportBtn) insertAfter = exportBtn.closest("div") || exportBtn.parentElement;
      if(!insertAfter && importInput) insertAfter = importInput.closest("div") || importInput.parentElement;
    }
    if(!insertAfter) insertAfter = h3;

    // Move copy cards into grid (only those that belong to this share card)
    for(const c of copyCards){
      grid.appendChild(c);
    }

    // Append grid
    if(insertAfter && insertAfter.parentElement){
      insertAfter.parentElement.insertBefore(grid, insertAfter.nextSibling);
    }else{
      shareCard.appendChild(grid);
    }

    // 4) Add class share-actions to the actions container if it exists
    const exportBtn = shareCard.querySelector("#export-json");
    if(exportBtn){
      const actions = exportBtn.closest("div") || exportBtn.parentElement;
      if(actions && !actions.classList.contains("share-actions")){
        actions.classList.add("share-actions");
      }
    }

    shareCard.setAttribute(MARK_DONE, "1");
  }

  function run(){
    injectCSS();
    const appRoot = document.getElementById("app");
    if(!appRoot) return;

    const tick = () => {
      const share = findShareRoot(appRoot);
      if(share) enhanceShare(share);
    };

    const mo = new MutationObserver(() => tick());
    mo.observe(appRoot, { childList:true, subtree:true });
    tick();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", run);
  }else{
    run();
  }
})();
