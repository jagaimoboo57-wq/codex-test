/* qb-addon-import-force-localstorage-v2.js
 * Quest Board 用：正キー対応（quest_board_state_v1）
 * - app.js の STORAGE_KEY を尊重
 * - JSON を localStorage('quest_board_state_v1') に書き込み
 * - 書き込み後に reload（確実反映）
 */
(function () {
  try {
    if (window.__QB_FORCE_IMPORT_V2__) return;
    window.__QB_FORCE_IMPORT_V2__ = true;

    const STORAGE_KEY = "quest_board_state_v1";

    function mount() {
      const wrap = document.createElement("div");
      wrap.style.position = "fixed";
      wrap.style.top = "44px";
      wrap.style.right = "10px";
      wrap.style.zIndex = "999999";

      const btn = document.createElement("button");
      btn.textContent = "強制インポート(v2)";
      btn.style.border = "1px solid #ccc";
      btn.style.borderRadius = "10px";
      btn.style.padding = "6px 10px";
      btn.style.cursor = "pointer";

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.style.display = "none";

      btn.onclick = () => input.click();

      input.onchange = async () => {
        const f = input.files && input.files[0];
        if (!f) return;
        const txt = await f.text();
        try { JSON.parse(txt); } catch (e) { alert("JSONが壊れています"); return; }
        if (!confirm(`このJSONを読み込みますか？\n\nキー: ${STORAGE_KEY}\nファイル: ${f.name}`)) return;
        localStorage.setItem(STORAGE_KEY, txt);
        alert("書き込み完了。リロードします。");
        location.reload();
      };

      wrap.appendChild(btn);
      wrap.appendChild(input);
      document.body.appendChild(wrap);
    }

    document.addEventListener("DOMContentLoaded", mount);
    console.log("[QB] ForceImport v2 ready ->", STORAGE_KEY);
  } catch (e) {
    console.warn("[QB] ForceImport v2 failed:", e);
  }
})();