/* qb-addon-import-force-localstorage-v1.js
 * 強制インポート（最終保険）
 * - file:// 環境でも確実に「選んだJSON」を localStorage('quest_board_state') に書き込み
 * - 書き込み後にリロードして app.js の通常ロードに任せる
 *
 * 使い方：
 * - index.html で app.js の後に読み込む
 * - 画面右上に「強制インポート」ボタンが出ます
 */
(function () {
  try {
    if (window.__QB_FORCE_IMPORT_V1__) return;
    window.__QB_FORCE_IMPORT_V1__ = true;

    const LS_KEY = "quest_board_state";

    function makeBtn() {
      const wrap = document.createElement("div");
      wrap.style.position = "fixed";
      wrap.style.top = "44px";
      wrap.style.right = "10px";
      wrap.style.zIndex = "999999";
      wrap.style.display = "flex";
      wrap.style.gap = "8px";
      wrap.style.alignItems = "center";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "強制インポート";
      btn.style.cursor = "pointer";
      btn.style.border = "1px solid rgba(0,0,0,.2)";
      btn.style.borderRadius = "10px";
      btn.style.padding = "6px 10px";
      btn.style.fontSize = "12px";
      btn.style.background = "#fff";
      btn.style.boxShadow = "0 2px 10px rgba(0,0,0,.12)";

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.style.display = "none";

      btn.addEventListener("click", () => input.click());

      input.addEventListener("change", async () => {
        const f = input.files && input.files[0];
        if (!f) return;
        const name = f.name || "(unknown)";
        const ok = confirm("このJSONを強制インポートしますか？\n\n" + name);
        if (!ok) { input.value = ""; return; }
        const text = await f.text();

        // 軽い妥当性チェック
        try {
          const obj = JSON.parse(text);
          if (!obj || typeof obj !== "object") throw new Error("not object");
        } catch (e) {
          alert("JSONとして読み取れませんでした。\n\n" + String(e));
          input.value = "";
          return;
        }

        // 書き込み（ここが本体）
        localStorage.setItem(LS_KEY, text);

        alert("強制インポート完了：リロードします。\n\n" + name);
        location.reload();
      });

      wrap.appendChild(btn);
      wrap.appendChild(input);
      document.body.appendChild(wrap);
    }

    document.addEventListener("DOMContentLoaded", makeBtn);

    console.log("[QB] ForceImport v1 ready. Writes to localStorage('quest_board_state') then reloads.");
  } catch (e) {
    console.warn("[QB] ForceImport v1 failed:", e);
  }
})();
