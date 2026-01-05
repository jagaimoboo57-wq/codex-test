/*
  qb-addon-hide-sample-json.js
  Purpose:
    Remove / hide 「JSONインポート サンプル生成」ボタン
    without modifying app.js.
*/
(function(){
  function hide(){
    const btns = document.querySelectorAll("button");
    btns.forEach(b=>{
      const t = (b.textContent||"").trim();
      if(t.includes("サンプル生成")){
        b.style.display = "none";
      }
    });
  }
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", ()=>{
      hide();
      new MutationObserver(hide).observe(document.body,{childList:true,subtree:true});
    });
  }else{
    hide();
    new MutationObserver(hide).observe(document.body,{childList:true,subtree:true});
  }
})();
