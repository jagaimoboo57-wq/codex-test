
/*
 Quest Board｜store.update 互換アドオン（fix23）
 目的:
 - app.js が store.update(fn) を呼ぶのに、store.update が無くて落ちる問題を止める
 仕様:
 - store.update(fn):
    1) 現在stateを取得
    2) fn(draft) を実行（破壊的更新OK）
    3) stateを保存
    4) 可能なら再描画、無理ならリロード
 使い方:
 - app.js の「後ろ」に読み込むこと
   <script src="app.js"></script>
   <script src="qb-addon-fix23-store-update.js"></script>
*/

(function () {
  const STATE_KEY = "quest-board-state";

  // 既に store が無い場合でも落ちないように最低限用意
  if (!window.store) window.store = {};

  // getState / setState が無い場合は補完
  if (typeof window.store.getState !== "function") {
    window.store.getState = function () {
      try { return JSON.parse(localStorage.getItem(STATE_KEY) || "{}"); }
      catch (e) { return {}; }
    };
  }
  if (typeof window.store.setState !== "function") {
    window.store.setState = function (next) {
      localStorage.setItem(STATE_KEY, JSON.stringify(next || {}));
    };
  }

  // update を追加（既にあるなら上書きしない）
  if (typeof window.store.update !== "function") {
    window.store.update = function (updater) {
      const state = window.store.getState();
      try {
        if (typeof updater === "function") {
          // 破壊的更新を許容（draftとして渡す）
          updater(state);
        }
      } catch (e) {
        console.error("[fix23] store.update updater error:", e);
      }
      window.store.setState(state);

      // 既存の再描画関数があれば呼ぶ
      try {
        if (typeof window.render === "function") return window.render();
        if (typeof window.renderApp === "function") return window.renderApp();
        if (typeof window.mount === "function") return window.mount();
      } catch (e) {
        // fallthrough
      }
      // 最後の手段：確実に反映させる
      try { location.reload(); } catch (e) {}
    };
  }
})();
