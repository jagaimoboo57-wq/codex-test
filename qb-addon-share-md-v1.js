/*
  qb-addon-share-md-v1.js
  Adds a "Markdown出力" card to the 「出力・共有」タブ without modifying app.js.

  - Reads state from localStorage key: quest_board_state_v1
  - Uses state.ui.activeProjectId / activeInitiativeId
  - Injects a card with a Markdown textarea + Copy button
*/
(function(){
  const KEY = "quest_board_state_v1";
  const CARD_ID = "qb-md-export-card";

  function readState(){
    try{
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(e){
      console.warn("[QB md]", "state parse failed", e);
      return null;
    }
  }

  function getActiveInitiative(state){
    if(!state) return null;
    const pid = state?.ui?.activeProjectId;
    const iid = state?.ui?.activeInitiativeId;
    const project = (state.projects||[]).find(p => p.id === pid) || (state.projects||[])[0];
    if(!project) return null;
    const initiative =
      (project.initiatives||[]).find(i => i.id === iid) ||
      (project.initiatives||[])[0] ||
      null;
    return { project, initiative };
  }

  function esc(s){
    return String(s ?? "").replace(/[&<>"]/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[ch]));
  }

  function md(){
    const state = readState();
    const ai = getActiveInitiative(state);
    if(!ai || !ai.initiative) return "（施策が選択されていません）";

    const { project, initiative } = ai;
    const name = initiative.name || "（無題）";
    const summary = initiative.summary || "";
    const fixed = initiative.layers?.fixed || {};
    const review = initiative.layers?.review || {};
    const roadmap = initiative.roadmap || {};

    const lines = [];
    lines.push(`# 施策：${name}`);
    if(summary) lines.push(`\n${summary}\n`);

    lines.push(`## 固定レイヤー`);
    lines.push(`### 基本ルール\n${fixed.rules || "（未記入）"}`);
    lines.push(`\n### 前提条件\n${fixed.assumptions || "（未記入）"}`);

    lines.push(`\n## 検討レイヤー`);
    lines.push(`### 現在の目的（仮）\n${review.goal || "（未記入）"}`);
    lines.push(`\n### 変更点・仮説\n${review.hypothesis || "（未記入）"}`);

    // Roadmap summary
    lines.push(`\n## ロードマップ`);
    const phases = Array.isArray(roadmap.phases) ? roadmap.phases : [];
    const order = Array.isArray(roadmap.phaseOrder) ? roadmap.phaseOrder : phases.map(p=>p.id);
    if(order.length === 0){
      lines.push("（フェーズなし）");
    }else{
      for(const id of order){
        const p = phases.find(x=>x.id===id) || phases.find(x=>x.id==id) || null;
        if(!p) continue;
        const done = p.doneCount ?? 0;
        const total = p.totalCount ?? 0;
        const upd = p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "";
        lines.push(`- ${p.title || "（無題フェーズ）"}：進行中 ${done} / 完了 ${total}${upd ? `（更新 ${upd}）` : ""}`);
      }
    }

    // Footer
    lines.push(`\n---\nProject: ${project?.name || ""}\nUpdated: ${state?.app?.updatedAt ? new Date(state.app.updatedAt).toLocaleString() : ""}`);
    return lines.join("\n");
  }

  function ensureCard(root){
    // Must be on Share tab: detect h3 "出力・共有"
    const h3 = root.querySelector("h3");
    if(!h3 || !h3.textContent.includes("出力・共有")) return;

    if(root.querySelector("#"+CARD_ID)) return; // already injected

    const card = document.createElement("div");
    card.className = "card";
    card.id = CARD_ID;
    card.style.marginBottom = "12px";
    card.innerHTML = `
      <h4 style="margin-top:0;">Markdown出力（販売・共有向け）</h4>
      <div class="copy-area">
        <textarea id="qb-md-textarea" readonly></textarea>
        <button id="qb-md-copy">コピー</button>
      </div>
      <p style="margin:8px 0 0; font-size:12px; color:#666;">
        ※ app.jsは変更せず、出力・共有タブに追記しています
      </p>
    `;

    // Insert right after the title card header block (the first card)
    const firstCard = root.querySelector(".card");
    if(firstCard && firstCard.parentElement){
      firstCard.parentElement.insertBefore(card, firstCard.nextSibling);
    }else{
      root.appendChild(card);
    }

    const ta = card.querySelector("#qb-md-textarea");
    const btn = card.querySelector("#qb-md-copy");
    const refresh = () => { ta.value = md(); };

    btn.addEventListener("click", async () => {
      try{
        refresh();
        await navigator.clipboard.writeText(ta.value);
        btn.textContent = "コピー済み";
        setTimeout(()=>btn.textContent="コピー", 900);
      }catch(e){
        // Fallback
        ta.select();
        document.execCommand("copy");
        btn.textContent = "コピー済み";
        setTimeout(()=>btn.textContent="コピー", 900);
      }
    });

    refresh();
  }

  function hook(){
    const appRoot = document.getElementById("app");
    if(!appRoot) return;

    // Observe re-renders
    const mo = new MutationObserver(() => {
      // Find the Share tab area by locating the first h3 in the rendered content region.
      const main = appRoot.querySelector("main") || appRoot;
      const cards = main.querySelectorAll(".card");
      for(const c of cards){
        const h3 = c.querySelector("h3");
        if(h3 && h3.textContent.includes("出力・共有")){
          ensureCard(c.parentElement || main);
          break;
        }
      }
    });
    mo.observe(appRoot, { childList: true, subtree: true });

    // Initial
    setTimeout(()=> {
      try{
        const main = appRoot.querySelector("main") || appRoot;
        const cards = main.querySelectorAll(".card");
        for(const c of cards){
          const h3 = c.querySelector("h3");
          if(h3 && h3.textContent.includes("出力・共有")){
            ensureCard(c.parentElement || main);
            break;
          }
        }
      }catch(e){}
    }, 0);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", hook);
  }else{
    hook();
  }
})();
