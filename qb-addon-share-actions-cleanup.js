/*
  qb-addon-share-actions-cleanup.js
  Purpose:
    - Remove the stray "JSONインポート" (and any "サンプル生成") that appears
      between JSONエクスポート and the real JSONインポート button/label.
  Safe:
    - Does not modify app.js or localStorage.
    - Idempotent and rerender-safe.
*/
(function(){
  function isRealImportControl(el){
    // real import is usually a LABEL.file-btn containing input[type=file]
    if(!el) return false;
    const input = el.querySelector && el.querySelector('input[type="file"]');
    return !!input;
  }

  function cleanup(){
    // Focus only inside the Share tab card (出力・共有)
    const h3s = document.querySelectorAll("h3");
    let shareCard = null;
    for(const h3 of h3s){
      if((h3.textContent||"").includes("出力・共有")){
        shareCard = h3.closest(".card") || h3.parentElement;
        break;
      }
    }
    if(!shareCard) return;

    const actions = shareCard.querySelector(".share-actions") || shareCard;

    // 1) Hide any button that includes "サンプル生成"
    actions.querySelectorAll("button").forEach(btn=>{
      const t = (btn.textContent||"").trim();
      if(t.includes("サンプル生成")){
        btn.style.display = "none";
      }
    });

    // 2) Hide any non-real "JSONインポート" button (rare)
    actions.querySelectorAll("button, label, span, div, p").forEach(el=>{
      const t = (el.textContent||"").trim();
      if(t === "JSONインポート" && !isRealImportControl(el)){
        // If this element contains a real control, do nothing
        el.style.display = "none";
      }
    });

    // 3) Remove stray text nodes "JSONインポート" directly under actions container
    Array.from(actions.childNodes).forEach(n=>{
      if(n.nodeType === Node.TEXT_NODE){
        const t = (n.textContent||"").trim();
        if(t === "JSONインポート" || t.includes("サンプル生成")){
          n.textContent = "";
        }
      }
    });
  }

  function start(){
    cleanup();
    const mo = new MutationObserver(()=>cleanup());
    mo.observe(document.body, { childList:true, subtree:true });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
