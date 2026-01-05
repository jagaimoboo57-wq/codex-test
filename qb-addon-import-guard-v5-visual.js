/* qb-addon-import-guard-v5-visual.js
 * ImportGuard v5 (VISUAL ONLY / SAFE NO-OP)
 * 目的：
 * - 右上に「ImportGuard v5 ACTIVE」を表示
 * - 既存の app.js のインポート処理を遮断しない（= 何もしない）
 * - 過去の誤参照（fix22c2 など）を一切行わない
 *
 * 使い方：
 * - このファイルを quest-board-v1 フォルダに置き、index.html で読み込む
 * - 既存の qb-addon-import-guard-v5-visual.js がある場合は上書き
 */
(function () {
  try {
    // 既に起動済みなら何もしない
    if (window.__QB_IMPORT_GUARD_V5_ACTIVE__) return;
    window.__QB_IMPORT_GUARD_V5_ACTIVE__ = true;

    // 視覚バッジ
    const badge = document.createElement("div");
    badge.textContent = "ImportGuard v5 ACTIVE";
    badge.setAttribute("aria-label", "ImportGuard v5 ACTIVE");
    badge.style.position = "fixed";
    badge.style.top = "10px";
    badge.style.right = "10px";
    badge.style.zIndex = "999999";
    badge.style.padding = "6px 10px";
    badge.style.borderRadius = "999px";
    badge.style.fontSize = "12px";
    badge.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Noto Sans JP', sans-serif";
    badge.style.background = "#2b2b2b";
    badge.style.color = "#fff";
    badge.style.boxShadow = "0 2px 10px rgba(0,0,0,.2)";
    badge.style.opacity = "0.92";
    document.addEventListener("DOMContentLoaded", function () {
      document.body.appendChild(badge);
    });

    // ログ（最小）
    console.log("[QB bridge] Import guard ready (v5 visual-only). If you still see ERR_FILE_NOT_FOUND, ensure this file exists next to index.html.");
  } catch (e) {
    console.warn("[QB bridge] ImportGuard v5 failed to initialize:", e);
  }
})();
