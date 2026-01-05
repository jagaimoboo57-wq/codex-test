(() => {
  const STORAGE_KEY = "quest_board_state_v1";
  const TABS = {
    ROADMAP: "roadmap",
    FIXED: "fixed",
    REVIEW: "review",
    SHARE: "share",
    LOGS: "logs",
  };


  function injectThemeCSS() {
    if (document.getElementById("qb-theme-v2")) return;
    const style = document.createElement("style");
    style.id = "qb-theme-v2";
    style.textContent = `
      :root{
        --bg:#f6f7fb;
        --panel:#ffffff;
        --line:#d8dbe4;
        --text:#101828;
        --muted:#667085;
        --primary:#c92020; /* XM風レッド */
        --primary-2:#ff6b00; /* アクセントオレンジ */
        --danger:#d92d20;
        --accent-roadmap: var(--primary);
        --accent-fixed: #2563eb;
        --accent-review: #7c3aed;
        --accent-share: #0ea5e9;
        --accent-log: #16a34a;
        --shadow: 0 1px 2px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.08);
      }
      body{ background:var(--bg); color:var(--text); }
      .topbar{
        background:linear-gradient(90deg, var(--primary) 0%, #b42318 55%, #7a271a 100%);
        color:#fff;
        border-bottom:1px solid rgba(255,255,255,.25);
      }
      .topbar .title{ font-weight:800; letter-spacing:.2px; }
      .app-shell{ gap:16px; }
      .sidebar{
        background:var(--panel);
        border:1px solid var(--line);
        box-shadow: var(--shadow);
      }
      .main{
        background:transparent;
      }
      .tabs{
        background:var(--panel);
        border:1px solid var(--line);
        box-shadow: var(--shadow);
      }
      .tab{ border:0; }
      .tab.active{
        background:#fff;
        box-shadow: inset 0 -3px 0 var(--primary);
        font-weight:700;
      }
      .card{
        background:var(--panel);
        border:1px solid var(--line);
        box-shadow: var(--shadow);
      }
      .card-line{ opacity:.95; }
      .badge{ border:1px solid var(--line); }
      button.danger, .btn-danger{ border-color: var(--danger); color: var(--danger); }
      button.primary, .btn-primary{ background: var(--primary); border-color: var(--primary); color:#fff; }
      /* フェーズ名：表示と編集時の見た目を揃える */
      .phase-title{
        display:inline-block;
        padding:6px 10px;
        border-radius:10px;
        border:1px solid transparent;
        line-height:1.2;
      }
      input.inline-edit[data-edit="phase-title"]{
        box-sizing:border-box;
        padding:6px 10px;
        border-radius:10px;
        border:1px solid var(--primary);
        outline:none;
        line-height:1.2;
      }
      input.inline-edit[data-edit="phase-title"]:focus{
        box-shadow: 0 0 0 3px rgba(201,32,32,.18);
      }
      /* 追加フォームを少し目立たせる */
      .roadmap-add{
        border:1px dashed rgba(201,32,32,.35);
        background: linear-gradient(0deg, rgba(201,32,32,.04), rgba(201,32,32,.02));
      }
    

      /* 縦並びレイアウト（固定/検討） */
      .section-stack{
        display:flex;
        flex-direction:column;
        gap:14px;
      }
      .section-stack .section-card{
        width:100%;
      }

      /* 施策一覧：削除ボタンを右端に固定 */
      .initiative-row{
        width:100%;
      }
      .initiative-name{
        flex:1;
        min-width:0;
      }
      .initiative-row .del-btn{
        margin-left:auto;
        white-space:nowrap;
      }
`;
    document.head.appendChild(style);
  }

  const SAMPLE_DATA = () => {
    const now = new Date().toISOString();
    const phaseId = crypto.randomUUID();
    const initId = crypto.randomUUID();
    const projectId = crypto.randomUUID();
    return {
      app: { name: "Quest Board", version: "1.0.0", updatedAt: now },
      ui: { activeProjectId: projectId, activeInitiativeId: initId, activeTab: TABS.ROADMAP, activePhaseId: phaseId },
      projects: [
        {
          id: projectId,
          name: "サンプルプロジェクト",
          createdAt: now,
          updatedAt: now,
          initiativeOrder: [initId],
          initiatives: [
            {
              id: initId,
              name: "オンボーディング改善",
              summary: "初回利用の離脱率を低減する施策",
              status: "進行中",
              createdAt: now,
              updatedAt: now,
              roadmap: {
                phaseOrder: [phaseId],
                phases: [
                  {
                    id: phaseId,
                    title: "MVPリリース",
                    status: "進行中",
                    createdAt: now,
                    updatedAt: now,
                    metrics: {
                      inProgressCount: 2,
                      doneCount: 1,
                      lastUpdatedAt: now,
                      allDoneBadge: false,
                    },
                    logs: {
                      logOrder: [],
                      items: [],
                    },
                  },
                ],
              },
              layers: {
                fixed: {
                  basicRules: "主要ペルソナ: 新規登録ユーザー / トーンはフレンドリー",
                  assumptions: "iOS/Androidで同じ導線を提供",
                  locked: "価格は変えない",
                  updatedAt: now,
                },
                review: {
                  goalDraft: "CVRを今月中に5%",
                  changesHypothesis: "案内チュートリアルの改修",
                  exclusions: "決済まわりは対象外",
                  freeMemo: "アンケート設計も検討",
                  updatedAt: now,
                },
              },
            },
          ],
        },
      ],
    };
  };

  const storageAdapter = {
    load() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("state parse error", e);
        return null;
      }
    },
    save(state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    export(state) {
      return JSON.stringify(state, null, 2);
    },
    import(json) {
      const parsed = JSON.parse(json);
      storageAdapter.save(parsed);
      return parsed;
    },
    generateSample() {
      const sample = SAMPLE_DATA();
      storageAdapter.save(sample);
      return sample;
    },
  };

  const store = {
    state: null,
    getState() { return this.state; },
    init() {
      const loaded = storageAdapter.load();
      if (loaded) {
        this.state = loaded;
      } else {
        this.state = SAMPLE_DATA();
        storageAdapter.save(this.state);
      }
      renderApp();
      bindEvents();
    },
    update(mutator) {
      const draft = JSON.parse(JSON.stringify(this.state));
      mutator(draft);
      draft.app.updatedAt = new Date().toISOString();
      this.state = draft;
      storageAdapter.save(this.state);
      renderApp();
    },
  };

  const el = (selector) => document.querySelector(selector);

  const getActiveProject = () => {
    const { state } = store;
    return state.projects.find((p) => p.id === state.ui.activeProjectId) || state.projects[0];
  };

  const getActiveInitiative = () => {
    const project = getActiveProject();
    if (!project) return null;
    return project.initiatives.find((i) => i.id === store.state.ui.activeInitiativeId) || project.initiatives[0];
  };

  const getPhaseById = (initiative, phaseId) => initiative?.roadmap.phases.find((p) => p.id === phaseId);

  function renderApp() {
    const project = getActiveProject();
    const initiative = getActiveInitiative();
    const activeTab = store.state.ui.activeTab;
    const isLogView = activeTab === TABS.LOGS;
    const sidebar = renderSidebar(project, initiative);
    const mainContent = isLogView ? renderLogsView(project, initiative) : renderMain(initiative);
    const header = renderHeader(project);

    el("#app").innerHTML = `
      ${header}
      <div class="container">
        <aside class="sidebar">${sidebar}</aside>
        <main class="main">${mainContent}</main>
      </div>
    `;
  }

  function renderHeader(project) {
    return `
      <div class="app-header">
        <div class="app-title">Quest Board</div>
        <div class="project-name">${project ? project.name : "プロジェクト未設定"}</div>
        <div class="muted">データはブラウザに保存されます</div>
      </div>
    `;
  }

  function renderSidebar(project, activeInitiative) {
    const list = project
      ? project.initiativeOrder
          .map((id) => project.initiatives.find((i) => i.id === id))
          .filter(Boolean)
          .map((initiative) => `
            <div class="initiative-item ${initiative.id === activeInitiative?.id ? "active" : ""}" data-initiative-id="${initiative.id}">
              <div class="flex-space initiative-row">
                <div class="initiative-name"><strong>${initiative.name}</strong></div>
                <button class="danger del-btn" data-action="delete-initiative" data-initiative-id="${initiative.id}">削除</button>
              </div>
              <div class="initiative-meta">
<span>${formatDate(initiative.updatedAt)}</span>
              </div>
            </div>
          `)
          .join("")
      : "";

    return `
      <div>
        <h3>施策一覧</h3>
        <div class="initiative-list">${list || '<div class="muted">まだ施策がありません</div>'}</div>
      </div>
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">新規施策</h4>
        </div>
        <form id="new-initiative-form">
          <div class="form-row">
            <div>
              <label>施策名</label>
              <input name="name" required />
            </div>
</div>
          <div>
            <label>概要</label>
            <textarea name="summary" placeholder="施策の概要"></textarea>
          </div>
          <div style="margin-top:10px;text-align:right;">
            <button type="submit">作成</button>
          </div>
        </form>
      </div>
    `;
  }

  function renderTabs(active) {
    return `
      <div class="tabs">
        ${renderTabButton("ロードマップ", TABS.ROADMAP, active)}
        ${renderTabButton("固定レイヤー", TABS.FIXED, active)}
        ${renderTabButton("検討レイヤー", TABS.REVIEW, active)}
        ${renderTabButton("出力・共有", TABS.SHARE, active)}
      </div>
    `;
  }

  function renderTabButton(label, tab, active) {
    return `<button class="tab ${active === tab ? "active" : ""}" data-tab="${tab}">${label}</button>`;
  }

  function renderMain(initiative) {
    if (!initiative) {
      return '<div class="card"><p>施策を選択してください</p></div>';
    }
    const tabBar = renderTabs(store.state.ui.activeTab);
    let content = "";
    switch (store.state.ui.activeTab) {
      case TABS.ROADMAP:
        content = renderRoadmap(initiative);
        break;
      case TABS.FIXED:
        content = renderFixedLayer(initiative);
        break;
      case TABS.REVIEW:
        content = renderReviewLayer(initiative);
        break;
      case TABS.SHARE:
        content = renderShare(initiative);
        break;
      default:
        content = renderRoadmap(initiative);
    }
    return `${tabBar}${content}`;
  }

  function renderRoadmap(initiative) {
    const phases = initiative.roadmap.phaseOrder
      .map((id) => initiative.roadmap.phases.find((p) => p.id === id))
      .filter(Boolean);
    const cards = phases
      .map((phase) => {
        const metrics = phase.metrics;
        return `
          <div class="card">
            <div class="card-header">
              <div>
                <h4 class="card-title phase-title" data-phase-id="${phase.id}" title="ダブルクリックで編集">${phase.title}</h4>
                <div class="muted">更新: ${formatDate(metrics.lastUpdatedAt || phase.updatedAt)}</div>
              </div>
              <div class="flex-row" style="flex:1;">
                <span class="badge gray">進行中 ${metrics.inProgressCount}</span>
                <span class="badge gray">完了 ${metrics.doneCount}</span>
                ${metrics.allDoneBadge ? '<span class="badge gold">★ 全完了</span>' : ""}
              </div>
              <div class="phase-actions">
                                <button data-action="open-logs" data-phase-id="${phase.id}">ログ</button>
                <button data-action="delete-phase" data-phase-id="${phase.id}" class="danger">削除</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="flex-space" style="margin-bottom:12px;">
        <h3 style="margin:0;">ロードマップ</h3>
      </div>

      <form class="card roadmap-add" data-roadmap-add data-initiative-id="${initiative.id}" style="padding:12px; margin-bottom:12px;">
        <div class="card-line" style="background:${"var(--accent-roadmap)"}"></div>
        <div class="flex-space" style="gap:10px; align-items:flex-end;">
          <div style="flex:1; min-width:220px;">
            <label class="muted" style="display:block; margin-bottom:6px;">フェーズ名</label>
            <input class="input" type="text" data-new-phase-title placeholder="例：準備 / 構築 / 検証 など" />
          </div>
          <button class="btn btn--primary" type="submit" data-action="add-phase" data-initiative-id="${initiative.id}">追加</button>
        </div>
        <div class="muted" style="margin-top:8px;">※ 空欄の場合は「新規フェーズ n」で自動命名します。</div>
      </form>

      ${cards || '<div class="card"><p>フェーズを追加してください</p></div>'}
    `;
  }

  function renderFixedLayer(initiative) {
    const fixed = initiative.layers.fixed;
    return `
      <div class="card">
        <div class="card-line" style="background:var(--accent-fixed);"></div>
        <h3 style="margin-top:0;">基本ルール</h3>
        <div class="section-stack">
          ${renderFixedField("基本ルール（行動・判断の規範）", "basicRules", fixed.basicRules)}
          ${renderFixedField("前提条件（環境・制約）", "assumptions", fixed.assumptions)}
          ${renderFixedField("固定（変更しないもの）", "locked", fixed.locked)}
        </div>
        <div class="muted" style="margin-top:8px;">最終更新: ${formatDate(fixed.updatedAt)}</div>
      </div>
    `;
  }

  function renderFixedField(label, field, value) {
    return `
      <div class="card" style="padding:12px;">
        <h4 style="margin:0 0 8px 0;">${label}</h4>
        <textarea data-layer="fixed" data-field="${field}" placeholder="${label}を入力">${value || ""}</textarea>
      </div>
    `;
  }

  function renderReviewLayer(initiative) {
    const review = initiative.layers.review;
    return `
      <div class="card">
        <div class="card-line" style="background:var(--accent-review);"></div>
        <h3 style="margin-top:0;">検討レイヤー</h3>
        <div class="section-stack">
          ${renderReviewField("現在の目的（仮）", "goalDraft", review.goalDraft, `この施策で、いま達成したい目的を仮で記載してください。\n数値や期限、表現は後から変更して問題ありません。`)}
          ${renderReviewField("変更点・仮説", "changesHypothesis", review.changesHypothesis, `・なぜ変更したいのか\n・何を試そうとしているのか\n・うまくいったと判断する基準は何か\n思いついた順で箇条書きして構いません。`)}
          ${renderReviewField("扱わないこと（除外）", "exclusions", review.exclusions, `今回は意図的に扱わないこと、後回しにすると決めたことを記載してください。\n「やらない」と決めることで、判断が楽になります。`, true)}
          ${renderReviewField("自由メモ", "freeMemo", review.freeMemo, `まだ言語化できていない考え、違和感、迷いなどを自由に書いてください。\nここに書いた内容は、そのまま残さなくても構いません。`)}
        </div>
        <div class="muted" style="margin-top:8px;">最終更新: ${formatDate(review.updatedAt)}</div>
      </div>
    `;
  }

  function renderReviewField(label, field, value, placeholder, dotted = false) {
    const extraClass = dotted ? " dotted" : "";
    return `
      <div class="card${extraClass}" style="padding:12px;">
        <h4 style="margin:0 0 8px 0;">${label}</h4>
        <textarea data-layer="review" data-field="${field}" placeholder="${placeholder}">${value || ""}</textarea>
      </div>
    `;
  }

  function renderLogsView(project, initiative) {
    const phase = getPhaseById(initiative, store.state.ui.activePhaseId) || initiative?.roadmap.phases[0];
    if (!initiative || !phase) {
      return '<div class="card"><p>フェーズが見つかりません</p></div>';
    }
    const logs = phase.logs.logOrder
      .map((id) => phase.logs.items.find((l) => l.id === id))
      .filter(Boolean);

    const logCards = logs
      .map(
        (log) => `
        <div class="card">
          <div class="log-item">
            <div>
              <div class="card-title">${log.title}</div>
              <div class="muted">更新: ${formatDate(log.updatedAt)}</div>
            </div>
            <div><span class="badge gray">${log.quantityLabel || "数量"}: ${log.quantityValue}</span></div>
            <div>${log.done ? '<span class="badge green">完了</span>' : '<span class="badge gray">進行中</span>'}</div>
            <div>${log.note || "-"}</div>
            <div style="text-align:right;">
              <button data-action="toggle-log" data-log-id="${log.id}" data-phase-id="${phase.id}">${log.done ? "未完了へ" : "完了"}</button>
              <button data-action="delete-log" data-log-id="${log.id}" data-phase-id="${phase.id}">削除</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    return `
      <div class="card qb-section logs" style="padding:12px;">
        <div class="card-line" style="background:var(--accent-log);"></div>
        <div class="logs-header">
        <button data-action="back-roadmap">← ロードマップに戻る</button>
        <div>
          <div class="card-title">${initiative.name} / ${phase.title}</div>
          <div class="muted">ログ更新: ${formatDate(phase.updatedAt)}</div>
        </div>
        <button data-action="add-log" data-phase-id="${phase.id}" id="add-log-btn">新規ログ追加</button>
      </div>
        <div class="card">
        <form id="log-form" data-phase-id="${phase.id}">
          <div class="form-row">
            <div>
              <label>件名</label>
              <input name="title" required />
            </div>
            <div>
              <label>量 (数量)</label>
              <input name="quantityValue" type="number" min="0" step="1" value="0" />
            </div>
            <div>
              <label>完了</label>
              <select name="done">
                <option value="false">進行中</option>
                <option value="true">完了</option>
              </select>
            </div>
          </div>
          <div>
            <label>メモ</label>
            <textarea name="note"></textarea>
          </div>
          <div style="text-align:right; margin-top:10px;">
            <button type="submit">追加</button>
          </div>
        </form>
      </div>
      ${logCards || '<div class="card"><p>ログはまだありません</p></div>'}
      </div>
    `;
  }

  function renderShare(initiative) {
    const fixedText = formatFixedText(initiative.layers.fixed);
    const reviewText = formatReviewText(initiative.layers.review);
    const roadmapText = formatRoadmapText(initiative.roadmap);
    return `
        <div class="card">
        <h3 style="margin-top:0;">出力・共有</h3>
        <div class="flex-row" style="margin-bottom:12px;">
          <button id="export-json">JSONエクスポート</button>
          <label style="display:inline-flex;align-items:center;gap:6px;">
            <input type="file" id="import-json" accept="application/json" style="width:auto;" />
            JSONインポート
          </label>
          <button id="generate-sample">サンプル生成</button>
        </div>
        <div class="card" style="margin-bottom:12px;">
          <h4>検討レイヤーをコピー</h4>
          <div class="copy-area">
            <textarea readonly>${reviewText}</textarea>
            <button data-action="copy" data-copy-target="review">コピー</button>
          </div>
        </div>
        <div class="card" style="margin-bottom:12px;">
          <h4>固定レイヤーをコピー</h4>
          <div class="copy-area">
            <textarea readonly>${fixedText}</textarea>
            <button data-action="copy" data-copy-target="fixed">コピー</button>
          </div>
        </div>
        <div class="card">
          <h4>ロードマップ概要をコピー</h4>
          <div class="copy-area">
            <textarea readonly>${roadmapText}</textarea>
            <button data-action="copy" data-copy-target="roadmap">コピー</button>
          </div>
        </div>
        <div class="card">
          <h4>全部まとめてコピー</h4>
          <div class="copy-area">
            <textarea readonly>${formatAllText(initiative, fixedText, reviewText, roadmapText)}</textarea>
            <button data-action="copy" data-copy-target="all">コピー</button>
          </div>
        </div>
        <div class="notice">コピーはブラウザのクリップボードを利用します。</div>
      </div>
    `;
  }

  function formatFixedText(fixed) {
    return `【基本ルール】\n${fixed.basicRules}\n\n【前提条件】\n${fixed.assumptions}\n\n【固定（変更しないもの）】\n${fixed.locked}`.trim();
  }

  function formatReviewText(review) {
    return `【現在の目的（仮）】\n${review.goalDraft}\n\n【変更点・仮説】\n${review.changesHypothesis}\n\n【扱わないこと（除外）】\n${review.exclusions}\n\n【自由メモ】\n${review.freeMemo}`.trim();
  }

  function formatAllText(initiative, fixedText, reviewText, roadmapText) {
    const header = `【施策】${initiative.name}\n更新: ${formatDate(initiative.updatedAt)}\nステータス: ${initiative.status || ""}`;
    return [
      header,
      "\n\n---\n\n",
      "【基本ルール】\n" + (fixedText || "(未入力)"),
      "\n\n【検討レイヤー】\n" + (reviewText || "(未入力)"),
      "\n\n【ロードマップ】\n" + (roadmapText || "(未入力)")
    ].join("");
  }

  function formatRoadmapText(roadmap) {
    const lines = roadmap.phaseOrder
      .map((id) => roadmap.phases.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => `- ${p.title}: 進行中${p.metrics.inProgressCount} / 完了${p.metrics.doneCount} (更新 ${formatDate(p.metrics.lastUpdatedAt)})`);
    return lines.join("\n");
  }

  function bindEvents() {
    document.body.addEventListener("click", handleClick);
    document.body.addEventListener("dblclick", handleDblClick);
    document.body.addEventListener("change", handleChange);
    document.body.addEventListener("input", handleInput);
    document.body.addEventListener("submit", handleSubmit);
  }

  function handleClick(e) {
    const tab = e.target.closest("[data-tab]");
    if (tab) {
      e.preventDefault();
      const next = tab.dataset.tab;
      store.update((draft) => {
        draft.ui.activeTab = next;
      });
      return;
    }

    const initiativeItem = e.target.closest("[data-initiative-id]");
    if (initiativeItem && initiativeItem.classList.contains("initiative-item")) {
      const id = initiativeItem.dataset.initiativeId;
      store.update((draft) => {
        draft.ui.activeInitiativeId = id;
        draft.ui.activeTab = TABS.ROADMAP;
      });
      return;
    }

    const action = (e.target.closest("[data-action]") || e.target).dataset.action;
    if (!action) return;

    if (action === "add-phase") {
      const btn = e.target.closest('[data-action="add-phase"]');
      if (btn && btn.type === "submit") {
        // handled by form submit
        return;
      }
      const initId = btn?.dataset?.initiativeId || store.getState().ui.activeInitiativeId;
      if (!initId) return;

      // Prefer the inline add form title (promptは使わない)
      const container = btn?.closest('[data-roadmap-add]') || document.querySelector(`[data-roadmap-add][data-initiative-id="${initId}"]`);
      const input = container ? container.querySelector('input[data-new-phase-title]') : null;
      const rawTitle = input ? input.value : "";
      addPhase(initId, rawTitle);

      if (input) input.value = "";
      return;
    }

    if (action === "rename-phase") {
      const phaseId = (e.target.closest("[data-action]") || e.target).dataset.phaseId;
      if (!phaseId) return;
      renamePhase(phaseId);
      return;
    }

    if (action === "delete-initiative") {
      const initiativeId = (e.target.closest("[data-action]") || e.target).dataset.initiativeId;
      const project = store.getState().projects.find((p) => p.id === store.getState().ui.activeProjectId);
      const initiative = project?.initiatives.find((i) => i.id === initiativeId);
      const name = initiative?.name || "";
      if (confirm(`施策「${name}」を削除しますか？`)) {
        deleteInitiative(initiativeId);
      }
    }

    if (action === "delete-phase") {
      const phaseId = (e.target.closest("[data-action]") || e.target).dataset.phaseId;
      if (confirm("フェーズを削除しますか？")) {
        deletePhase(phaseId);
      }
    }

    if (action === "open-logs") {
      const phaseId = (e.target.closest("[data-action]") || e.target).dataset.phaseId;
      store.update((draft) => {
        draft.ui.activeTab = TABS.LOGS;
        draft.ui.activePhaseId = phaseId;
      });
    }

    if (action === "back-roadmap") {
      store.update((draft) => {
        draft.ui.activeTab = TABS.ROADMAP;
        draft.ui.activePhaseId = null;
      });
    }

    if (action === "delete-log") {
      const { phaseId, logId } = e.target.dataset;
      if (confirm("ログを削除しますか？")) {
        deleteLog(phaseId, logId);
      }
    }

    if (action === "toggle-log") {
      const { phaseId, logId } = e.target.dataset;
      toggleLogDone(phaseId, logId);
    }

    if (action === "copy") {
      const target = e.target.dataset.copyTarget;
      handleCopy(target);
    }
  }

  
  function handleDblClick(e) {
    const titleEl = e.target.closest(".phase-title[data-phase-id]");
    if (!titleEl) return;

    e.preventDefault();
    const phaseId = titleEl.dataset.phaseId;
    const current = titleEl.textContent || "";

    // If already editing, do nothing
    if (titleEl.tagName === "INPUT") return;

    // Close any other inline editors
    const existing = document.querySelector('input.inline-edit[data-edit="phase-title"]');
    if (existing) {
      existing.blur();
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = "input inline-edit";
    input.dataset.edit = "phase-title";
    input.dataset.phaseId = phaseId;
    input.value = current;
    // サイズ・タイポをタイトル表示と揃える
    const cs = window.getComputedStyle(titleEl);
    const rect = titleEl.getBoundingClientRect();
    input.style.fontSize = cs.fontSize;
    input.style.fontWeight = cs.fontWeight;
    input.style.letterSpacing = cs.letterSpacing;
    input.style.width = `${Math.max(120, Math.round(rect.width))}px`;
    input.style.height = `${Math.round(rect.height)}px`;

    // Replace the title element with input
    titleEl.replaceWith(input);
    input.focus();
    input.select();

    const commit = () => {
      const next = String(input.value || "").trim();
      if (next) {
        setPhaseTitle(phaseId, next);
      }
      // re-render happens via store.update
    };

    const cancel = () => {
      // revert by forcing a re-render (no state change)
      renderApp();
    };

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        commit();
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        cancel();
      }
    });

    input.addEventListener("blur", () => {
      // Blur commits (spec)
      commit();
    });
  }

function handleChange(e) {
    if (e.target.id === "import-json" && e.target.files?.length) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const next = storageAdapter.import(ev.target.result);
          store.state = next;
          renderApp();
        } catch (err) {
          alert("JSONの読み込みに失敗しました");
        }
      };
      reader.readAsText(file);
    }
  }

  function handleInput(e) {
    const layer = e.target.dataset.layer;
    const field = e.target.dataset.field;
    if (layer && field) {
      const value = e.target.value;
      updateLayerField(layer, field, value);
    }
  }

  function handleSubmit(e) {
    if (e.target.matches && e.target.matches("[data-roadmap-add]")) {
      e.preventDefault();
      const form = e.target;
      const initId = form.dataset.initiativeId || store.getState().ui.activeInitiativeId;
      const input = form.querySelector("input[data-new-phase-title]");
      const rawTitle = input ? input.value : "";
      if (!initId) return;
      addPhase(initId, rawTitle);
      if (input) input.value = "";
      return;
    }

    if (e.target.id === "new-initiative-form") {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const name = formData.get("name").trim();
      if (!name) return;
      const summary = formData.get("summary");
      createInitiative({ name, summary });
      form.reset();
    }

    if (e.target.id === "log-form") {
      e.preventDefault();
      const form = e.target;
      const phaseId = form.dataset.phaseId;
      const fd = new FormData(form);
      const title = fd.get("title").trim();
      if (!title) return;
      const quantityValue = Number(fd.get("quantityValue")) || 0;
      const done = fd.get("done") === "true";
      const note = fd.get("note");
      addLog(phaseId, { title, quantityValue, done, note });
      form.reset();
    }
  }

  function addPhase(initiativeId, rawTitle = "") {
    const now = new Date().toISOString();
    const phaseId = crypto.randomUUID();

    const project = store.getState().projects.find((p) => p.id === store.getState().ui.activeProjectId);
    const initiative = project?.initiatives.find((i) => i.id === initiativeId);
    const nextNum = (initiative?.roadmap?.phases?.length || 0) + 1;
    const defaultTitle = `新規フェーズ ${nextNum}`;

    const titleText = String(rawTitle || "").trim() || defaultTitle;

    store.update((draft) => {
      const p = draft.projects.find((x) => x.id === draft.ui.activeProjectId);
      const ini = p?.initiatives.find((i) => i.id === initiativeId);
      if (!ini) return;

      if (!ini.roadmap) ini.roadmap = { phaseOrder: [], phases: [] };
      if (!Array.isArray(ini.roadmap.phases)) ini.roadmap.phases = [];
      if (!Array.isArray(ini.roadmap.phaseOrder)) ini.roadmap.phaseOrder = [];

      const phase = {
        id: phaseId,
        title: titleText,
        createdAt: now,
        updatedAt: now,
        metrics: { inProgressCount: 0, doneCount: 0, lastUpdatedAt: now, allDoneBadge: false },
        logs: { logOrder: [], items: [] },
      };

      ini.roadmap.phases.push(phase);
      ini.roadmap.phaseOrder.push(phaseId);
      ini.updatedAt = now;
      p.updatedAt = now;
    });
  }
function setPhaseTitle(phaseId, newTitle) {
    const now = new Date().toISOString();
    const titleText = String(newTitle || "").trim();
    if (!titleText) return;

    store.update((draft) => {
      const proj = draft.projects.find((p) => p.id === draft.ui.activeProjectId);
      const init = proj?.initiatives.find((i) => i.id === draft.ui.activeInitiativeId);
      const phase = init?.roadmap?.phases?.find((p) => p.id === phaseId);
      if (!phase) return;

      phase.title = titleText;
      phase.updatedAt = now;
      if (phase.metrics) phase.metrics.lastUpdatedAt = now;
      init.updatedAt = now;
      proj.updatedAt = now;
    });
  }

  // backward compat (unused button route)
  function renamePhase(phaseId) {
    const phaseTitleEl = document.querySelector(`[data-phase-id="${phaseId}"]`);
    const current = phaseTitleEl ? phaseTitleEl.textContent : "";
    setPhaseTitle(phaseId, current);
  }



  function createInitiative({ name, summary }) {
    const now = new Date().toISOString();
    const initiativeId = crypto.randomUUID();
    const phaseId = crypto.randomUUID();

    store.update((draft) => {
      const project = draft.projects.find((p) => p.id === draft.ui.activeProjectId);
      if (!project) return;
      const initiative = {
        id: initiativeId,
        name,
        summary,
        createdAt: now,
        updatedAt: now,
        roadmap: {
          phaseOrder: [phaseId],
          phases: [
            {
              id: phaseId,
              title: "初期フェーズ",
              status: "未着手",
              createdAt: now,
              updatedAt: now,
              metrics: { inProgressCount: 0, doneCount: 0, lastUpdatedAt: now, allDoneBadge: false },
              logs: { logOrder: [], items: [] },
            },
          ],
        },
        layers: {
          fixed: { basicRules: "", assumptions: "", locked: "", updatedAt: now },
          review: { goalDraft: "", changesHypothesis: "", exclusions: "", freeMemo: "", updatedAt: now },
        },
      };
      project.initiatives.push(initiative);
      project.initiativeOrder.push(initiativeId);
      project.updatedAt = now;
      draft.ui.activeInitiativeId = initiativeId;
      draft.ui.activeTab = TABS.ROADMAP;
      draft.ui.activePhaseId = phaseId;
    });
  }

  function updateLayerField(layer, field, value) {
    const now = new Date().toISOString();
    store.update((draft) => {
      const project = draft.projects.find((p) => p.id === draft.ui.activeProjectId);
      const initiative = project?.initiatives.find((i) => i.id === draft.ui.activeInitiativeId);
      if (!initiative) return;
      initiative.layers[layer][field] = value;
      initiative.layers[layer].updatedAt = now;
      initiative.updatedAt = now;
      project.updatedAt = now;
    });
  }

  function addLog(phaseId, { title, quantityValue, done, note }) {
    const now = new Date().toISOString();
    const logId = crypto.randomUUID();
    store.update((draft) => {
      const project = draft.projects.find((p) => p.id === draft.ui.activeProjectId);
      const initiative = project?.initiatives.find((i) => i.id === draft.ui.activeInitiativeId);
      if (!initiative) return;
      const phase = initiative.roadmap.phases.find((p) => p.id === phaseId);
      if (!phase) return;
      const log = {
        id: logId,
        title,
        quantityLabel: "件数",
        quantityValue,
        done,
        note,
        createdAt: now,
        updatedAt: now,
      };
      phase.logs.items.push(log);
      phase.logs.logOrder.push(logId);
      if (log.done) {
        phase.metrics.doneCount = 1;
      } else {
        phase.metrics.inProgressCount = 1;
      }
      phase.metrics.lastUpdatedAt = now;
      phase.metrics.allDoneBadge = phase.logs.items.length > 0 && phase.logs.items.every((l) => l.done);
      phase.updatedAt = now;
      initiative.updatedAt = now;
      project.updatedAt = now;
      draft.ui.activePhaseId = phaseId;
    });
  }

  function deleteLog(phaseId, logId) {
    const now = new Date().toISOString();
    store.update((draft) => {
      const project = draft.projects.find((p) => p.id === draft.ui.activeProjectId);
      const initiative = project?.initiatives.find((i) => i.id === draft.ui.activeInitiativeId);
      if (!initiative) return;
      const phase = initiative.roadmap.phases.find((p) => p.id === phaseId);
      if (!phase) return;
      phase.logs.items = phase.logs.items.filter((l) => l.id !== logId);
      phase.logs.logOrder = phase.logs.logOrder.filter((id) => id !== logId);
      phase.metrics.doneCount = phase.logs.items.filter((l) => l.done).length;
      phase.metrics.inProgressCount = phase.logs.items.length - phase.metrics.doneCount;
      phase.metrics.allDoneBadge = phase.logs.items.length > 0 && phase.logs.items.every((l) => l.done);
      phase.metrics.lastUpdatedAt = now;
      phase.updatedAt = now;
      initiative.updatedAt = now;
      project.updatedAt = now;
    });
  }

  function toggleLogDone(phaseId, logId) {
    const now = new Date().toISOString();
    store.update((draft) => {
      const project = draft.projects.find((p) => p.id === draft.ui.activeProjectId);
      const initiative = project?.initiatives.find((i) => i.id === draft.ui.activeInitiativeId);
      if (!initiative) return;
      const phase = initiative.roadmap.phases.find((p) => p.id === phaseId);
      if (!phase) return;
      const log = phase.logs.items.find((l) => l.id === logId);
      if (!log) return;
      log.done = !log.done;
      log.updatedAt = now;
      phase.metrics.doneCount = phase.logs.items.filter((l) => l.done).length;
      phase.metrics.inProgressCount = phase.logs.items.length - phase.metrics.doneCount;
      phase.metrics.lastUpdatedAt = now;
      phase.metrics.allDoneBadge = phase.logs.items.length > 0 && phase.logs.items.every((l) => l.done);
      phase.updatedAt = now;
      initiative.updatedAt = now;
      project.updatedAt = now;
    });
  }

  function handleCopy(target) {
    const initiative = getActiveInitiative();
    if (!initiative) return;
    let text = "";
    if (target === "fixed") text = formatFixedText(initiative.layers.fixed);
    if (target === "review") text = formatReviewText(initiative.layers.review);
    if (target === "roadmap") text = formatRoadmapText(initiative.roadmap);
    if (target === "all") {
      const fixedText = formatFixedText(initiative.layers.fixed);
      const reviewText = formatReviewText(initiative.layers.review);
      const roadmapText = formatRoadmapText(initiative.roadmap);
      text = formatAllText(initiative, fixedText, reviewText, roadmapText);
    }
    if (!text) text = "";
    navigator.clipboard.writeText(text).then(() => alert("コピーしました"));
  }

  function formatDate(date) {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const pad = (n) => (n < 10 ? `0${n}` : n);

  window.addEventListener("load", () => {
    injectThemeCSS();
    store.init();

    const exportBtn = () => document.getElementById("export-json");
    const sampleBtn = () => document.getElementById("generate-sample");

    const attachDynamicEvents = () => {
      const eb = exportBtn();
      if (eb) {
        eb.onclick = () => {
          const data = storageAdapter.export(store.state);
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "quest_board_state.json";
          a.click();
          URL.revokeObjectURL(url);
        };
      }
      const sb = sampleBtn();
      if (sb) {
        sb.onclick = () => {
          const sample = storageAdapter.generateSample();
          store.state = sample;
          renderApp();
        };
      }
    };

    const observer = new MutationObserver(() => attachDynamicEvents());
    observer.observe(document.body, { childList: true, subtree: true });
    attachDynamicEvents();
  });
})()
  function deleteInitiative(initiativeId) {
    store.update((draft) => {
      const project = draft.projects.find((p) => p.id === draft.ui.activeProjectId) || draft.projects[0];
      if (!project) return;

      project.initiatives = project.initiatives.filter((i) => i.id !== initiativeId);
      project.initiativeOrder = project.initiativeOrder.filter((id) => id !== initiativeId);

      // アクティブ施策を削除した場合のフォールバック
      if (draft.ui.activeInitiativeId === initiativeId) {
        draft.ui.activeInitiativeId = project.initiativeOrder[0] || null;
        draft.ui.activeTab = TABS.ROADMAP;
      }

      // アクティブフェーズを安全に補正
      const activeInit = project.initiatives.find((i) => i.id === draft.ui.activeInitiativeId) || project.initiatives[0];
      const firstPhaseId = activeInit?.roadmap?.phaseOrder?.[0] || activeInit?.roadmap?.phases?.[0]?.id || null;
      draft.ui.activePhaseId = firstPhaseId;
    });
  }

;