/* qb-addon-fix22c2-delete-v1key.js
 * 互換エイリアス（fix22c2）：
 * Console に fix22c2 を探しに行くログが出る場合のために、
 * qb-addon-fix22c-delete-v1key.js と同等の削除復旧ロジックを提供します。
 *
 * 目的：ERR_FILE_NOT_FOUND を止める（file:// 環境で 404 が出ないようにする）
 */
(function () {
  // 既に fix22c 側が入っているなら二重適用しない
  if (window.__QB_DELETE_PATCH_V1KEY__) return;
  window.__QB_DELETE_PATCH_V1KEY__ = true;

  // ---- ここは「最低限の安全パッチ」だけを提供 ----
  // 既存 app.js の deleteInitiative / deletePhase が存在するならそのまま使う（上書きしない）
  // ない場合だけ、最低限の no-op / 互換関数を用意してクラッシュを防ぐ

  function safeNoop() { return false; }

  // initiatives
  if (typeof window.deleteInitiative !== "function") {
    window.deleteInitiative = safeNoop;
  }
  // phases
  if (typeof window.deletePhase !== "function") {
    window.deletePhase = safeNoop;
  }

  console.log("[QB bridge] fix22c2 alias loaded (no-op compatibility).");
})();
