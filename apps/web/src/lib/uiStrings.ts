import type { Locale } from "../stores/uiStore";

// Central registry of UI strings that are not part of the S-1 content
// layer — button labels, aria descriptions, modal copy, stage titles,
// etc. Keyed by dot-separated id. An empty zh string falls back to en
// at render time, so stages whose translation pass hasn't landed yet
// keep rendering English in the zh locale without crashing.
//
// Proper-noun rules from docs/voice-and-visual.md: SpaceX, Falcon 9,
// Dragon, Starlink, Starshield, COLOSSUS, Grok, xAI, Macrohard,
// Terafab, NASA, FCC, FAA, etc. stay in English inside the Chinese
// string. The Stage NN telemetry chip is rendered via `shell.stage-prefix`
// plus a zero-padded number so locale switching threads through every
// stage eyebrow.

interface UiStringEntry {
  en: string;
  zh: string;
}

const stageTitle = (en: string, zh: string): UiStringEntry => ({ en, zh });

export const UI_STRINGS = {
  "shell.brand": { en: "SpaceX S-1", zh: "SpaceX S-1" },
  "shell.tminus.aria": { en: "T minus", zh: "T 减" },
  "shell.chapters.label": { en: "Chapters", zh: "章节" },
  "shell.chapters.nav-aria": { en: "Chapter index", zh: "章节索引" },
  "shell.controls.source.show": { en: "Show source references", zh: "显示来源引用" },
  "shell.controls.source.hide": { en: "Hide source references", zh: "隐藏来源引用" },
  "shell.controls.audio.on": { en: "Turn audio on", zh: "开启声音" },
  "shell.controls.audio.off": { en: "Turn audio off", zh: "关闭声音" },
  "shell.controls.locale.to-en": { en: "Switch language to English", zh: "切换至英文" },
  "shell.controls.locale.to-zh": { en: "Switch language to Chinese", zh: "切换至中文" },
  "shell.controls.reopen-briefing": { en: "Reopen mission briefing", zh: "重新打开任务简报" },

  "shell.stage-prefix": { en: "Stage", zh: "阶段" },

  "stage0.dismiss": { en: "Begin", zh: "开始" },
  "stage0.intro": {
    en: "This stage opens as a modal on first visit and remains reachable from the information control.",
    zh: "首次访问时本阶段以弹窗形式打开，之后亦可通过信息按钮再次进入。",
  },

  "stage4.algorithm.callout": { en: "The Algorithm", zh: "算法准则" },

  // Stage 2 — Who We Are
  "stage2.kpis.aria": { en: "Headline scale metrics", zh: "核心规模指标" },
  "stage2.milestones.heading": { en: "Milestones", zh: "里程碑" },

  // Stage 3 — The Three Pillars
  "stage3.pillar.eyebrow": { en: "Pillar", zh: "支柱" },
  "stage3.pillar.01.name": { en: "Space", zh: "Space（太空）" },
  "stage3.pillar.02.name": { en: "Connectivity", zh: "Connectivity（连接）" },
  "stage3.pillar.03.name": { en: "AI", zh: "AI" },
  "stage3.detail.summary": { en: "Full Business detail", zh: "完整业务说明" },
  "stage3.extras.fallback": { en: "Additional detail", zh: "更多细节" },

  // Stage 5 — Roadmap
  "stage5.why-now.eyebrow": { en: "Why this matters now", zh: "为什么是现在" },
  "stage5.growth.heading": { en: "Our growth strategies", zh: "我们的增长战略" },
  "stage5.growth.fallback": { en: "Growth", zh: "增长" },
  "stage5.future-markets.heading": { en: "Future markets", zh: "未来市场" },
  "stage5.growth-detail.summary": {
    en: "Read the full Business — Growth Strategies section",
    zh: "查看完整的“业务——增长战略”章节",
  },
  "stage5.caveat.eyebrow": {
    en: "Commercial viability — verbatim caveat",
    zh: "商业化可行性——逐字提示",
  },
  "stage5.caveat.title": {
    en: "These initiatives may not achieve commercial viability",
    zh: "上述方向可能无法实现商业化",
  },

  // Stage 6 — The Numbers
  "stage6.revenue.heading": { en: "Revenue trajectory", zh: "收入轨迹" },
  "stage6.net-income.heading": { en: "Net income (loss)", zh: "净利润（亏损）" },
  "stage6.verbatim.eyebrow": { en: "Verbatim", zh: "逐字引用" },
  "stage6.section.fallback": { en: "Section", zh: "章节" },
  "stage6.full-financial.heading": { en: "Full financial detail", zh: "完整财务明细" },

  // Stage 7 — The Anomaly Log
  "stage7.section.principal-risk-factors.heading": {
    en: "Principal risk factors",
    zh: "主要风险因素",
  },
  "stage7.section.principal-risk-factors.summary": { en: "Read the summary", zh: "查看摘要" },
  "stage7.section.highlighted-disclosures.heading": {
    en: "Highlighted disclosures",
    zh: "重点披露事项",
  },
  "stage7.section.highlighted-disclosures.lede": {
    en: "Six specific items the S-1 calls out and we surface verbatim. Each links back to the exact line range of the filing.",
    zh: "S-1 文件中点名的六项重点披露，我们逐字呈现。每条都链接回招股说明书的具体行号。",
  },
  "stage7.section.risk-taxonomy.heading": { en: "Risk taxonomy", zh: "风险分类" },
  "stage7.caveat.crosslink.eyebrow": {
    en: "Cross-link — Commercial viability caveat",
    zh: "交叉引用——商业化可行性提示",
  },
  "stage7.caveat.crosslink.title": {
    en: "Commercial viability of new markets is uncertain",
    zh: "新市场的商业化可行性存在不确定性",
  },
  "stage7.severity.low": { en: "Low", zh: "低" },
  "stage7.severity.medium": { en: "Medium", zh: "中" },
  "stage7.severity.high": { en: "High", zh: "高" },
  "stage7.severity.critical": { en: "Critical", zh: "严重" },
  "stage7.severity.aria-prefix": { en: "Severity", zh: "严重级别" },
  "stage7.category.mission": { en: "Mission", zh: "任务" },
  "stage7.category.operational": { en: "Operational", zh: "运营" },
  "stage7.category.regulatory": { en: "Regulatory", zh: "监管" },
  "stage7.category.financial": { en: "Financial", zh: "财务" },
  "stage7.category.governance": { en: "Governance", zh: "治理" },
  "stage7.category.sector-ai": { en: "Sector — AI", zh: "行业——AI" },
  "stage7.title.summary.principal-risk-factors": {
    en: "Principal risk factors (summary)",
    zh: "主要风险因素（摘要）",
  },
  "stage7.title.taxonomy.mission-starship": {
    en: "Mission — Starship dependency",
    zh: "任务——Starship 依赖",
  },
  "stage7.title.taxonomy.regulatory-approvals": {
    en: "Regulatory — approvals & spectrum",
    zh: "监管——审批与频谱",
  },
  "stage7.title.taxonomy.operational-space-systems": {
    en: "Operational — space systems",
    zh: "运营——太空系统",
  },
  "stage7.title.taxonomy.sector-ai-infrastructure": {
    en: "Sector — AI infrastructure",
    zh: "行业——AI 基础设施",
  },
  "stage7.title.taxonomy.financial-capital-markets": {
    en: "Financial — capital markets",
    zh: "财务——资本市场",
  },
  "stage7.title.taxonomy.governance-ownership": {
    en: "Governance — ownership structure",
    zh: "治理——股权结构",
  },
  "stage7.title.highlight.in-orbit-satellites-uninsured": {
    en: "In-orbit satellites uninsured by policy",
    zh: "在轨卫星按策略不投保",
  },
  "stage7.title.highlight.no-key-person-insurance-musk": {
    en: "No key-person life insurance on Mr. Musk",
    zh: "未对 Mr. Musk 投保关键人员人寿险",
  },
  "stage7.title.highlight.musk-not-full-time": {
    en: "Mr. Musk does not devote full time to the business",
    zh: "Mr. Musk 并非全职投入本业务",
  },
  "stage7.title.highlight.musk-senior-advisor": {
    en: "Mr. Musk previously served as Senior Advisor to the President",
    zh: "Mr. Musk 曾任美国总统 Senior Advisor",
  },
  "stage7.title.highlight.cursor-fees": {
    en: "Cursor — $1.5B termination + $8.5B deferred services fee",
    zh: "Cursor——15 亿美元终止费 + 85 亿美元递延服务费",
  },
  "stage7.title.highlight.tesla-macrohard-terafab-unfinalized": {
    en: "Tesla / Macrohard / Terafab terms not yet finalized",
    zh: "Tesla / Macrohard / Terafab 条款尚未最终确定",
  },
  "stage7.title.caveat.commercial-viability-crosslink": {
    en: "Commercial-viability caveat (cross-link)",
    zh: "商业化可行性提示（交叉引用）",
  },

  // Stage 8 — Who Steers the Ship
  "stage8.block.founder.label": {
    en: "Founder & controlled-company status",
    zh: "创始人与受控公司状态",
  },
  "stage8.block.founder.description": {
    en: "Mr. Musk's roles inside and outside SpaceX, and what controlled-company status means.",
    zh: "Mr. Musk 在 SpaceX 内外的角色，以及“受控公司”身份的含义。",
  },
  "stage8.block.dual-class.label": {
    en: "Dual-class share structure",
    zh: "双层股权结构",
  },
  "stage8.block.dual-class.description": {
    en: "Class A (one vote), Class B (ten votes), Class C (reclassified at IPO), Class D (authorized but unused).",
    zh: "Class A（一票）、Class B（十票）、Class C（IPO 时重新分类）、Class D（已授权但未发行）。",
  },
  "stage8.block.texas-forum.label": {
    en: "Texas reincorporation & forum selection",
    zh: "Texas 重新设立公司与法院选择条款",
  },
  "stage8.block.texas-forum.description": {
    en: "Texas Business Court as the exclusive forum for internal-affairs disputes.",
    zh: "以 Texas Business Court 作为内部事务争议的专属法院。",
  },
  "stage8.block.musk-dependency.label": {
    en: "Musk-dependency risk factor",
    zh: "对 Mr. Musk 的依赖风险",
  },
  "stage8.block.related-party-transactions.label": {
    en: "Related-party transactions — summary",
    zh: "关联方交易——概览",
  },
  "stage8.block.related-party-business-detail.label": {
    en: "Related-party transactions — financial-statement notes",
    zh: "关联方交易——财务报表附注",
  },
  "stage8.summary.read-verbatim": {
    en: "Read the verbatim source",
    zh: "查看逐字原文",
  },

  // Stage 9 — The Horizon
  "stage9.kardashev.eyebrow": {
    en: "Why this matters now — Kardashev Type II framing",
    zh: "为什么是现在——Kardashev II 框架",
  },
  "stage9.future-markets.heading": { en: "Future markets", zh: "未来市场" },
  "stage9.lunar.eyebrow": { en: "The lunar economy", zh: "月球经济" },
  "stage9.future-detail.summary": {
    en: "Read the full Future Markets section",
    zh: "查看完整的“未来市场”章节",
  },
  "stage9.caveat.eyebrow": {
    en: "Commercial viability — verbatim caveat (non-dismissible)",
    zh: "商业化可行性——逐字提示（不可关闭）",
  },
  "stage9.caveat.title": {
    en: "Timeline and commercial viability remain uncertain",
    zh: "时间表与商业化可行性仍存在不确定性",
  },
  "stage9.closing.eyebrow": { en: "Closing transmission", zh: "结尾传讯" },

  // Stage 10 — End Credits
  "stage10.forward-looking.heading": {
    en: "Forward-Looking Statements",
    zh: "前瞻性陈述",
  },
  "stage10.glossary.search.label": { en: "Glossary Search", zh: "术语表搜索" },

  // Stage titles ship in zh only when the rest of the stage's in-stage
  // labels (headings, summary toggles, card subtitles) have been
  // migrated and translated too — otherwise the title reads zh while
  // the body still reads en, which is more confusing than a uniform en
  // fallback. Stages 2/3/5/6/7/8/9 fill below; Stage 10 still pending.
  "stage.title.0": stageTitle("Mission Briefing", "任务简报"),
  "stage.title.1": stageTitle("Cold Open", "开场"),
  "stage.title.2": stageTitle("Who We Are", "我们是谁"),
  "stage.title.3": stageTitle("The Three Pillars", "三大支柱"),
  "stage.title.4": stageTitle("The Algorithm", "算法准则"),
  "stage.title.5": stageTitle("The Roadmap", "路线图"),
  "stage.title.6": stageTitle("The Numbers", "数字"),
  "stage.title.7": stageTitle("The Anomaly Log", "异常日志"),
  "stage.title.8": stageTitle("Who Steers the Ship", "由谁掌舵"),
  "stage.title.9": stageTitle("The Horizon", "地平线"),
  "stage.title.10": stageTitle("End Credits", "片尾字幕"),
} as const satisfies Record<string, UiStringEntry>;

export type UiStringId = keyof typeof UI_STRINGS;

export const uiString = (id: UiStringId, locale: Locale): string => {
  const entry = UI_STRINGS[id];
  if (locale === "zh" && entry.zh.trim().length > 0) return entry.zh;
  return entry.en;
};

// Narrowed signature: only stage ids the registry actually defines are
// accepted. Catches the case where a future contributor extends STAGES
// without adding the corresponding `stage.title.N` entry — TypeScript
// will reject the call instead of bouncing through an `as UiStringId`
// cast that crashes `uiString()` with `Cannot read properties of
// undefined` when ChapterIndex enumerates the stage.
type StageTitleKey = Extract<UiStringId, `stage.title.${number}`>;
export type StageWithTitle = StageTitleKey extends `stage.title.${infer N extends number}`
  ? N
  : never;

export const stageTitleId = (id: StageWithTitle): StageTitleKey =>
  `stage.title.${String(id)}` as StageTitleKey;

// Renders the "Stage NN" telemetry chip used as each stage's eyebrow.
// The prefix word is localised through `shell.stage-prefix`; the number
// is zero-padded and stays language-neutral so the JetBrains-Mono
// tabular column stays aligned in both locales.
export const stageEyebrow = (id: number, locale: Locale): string => {
  const prefix = uiString("shell.stage-prefix", locale);
  return `${prefix} ${String(id).padStart(2, "0")}`;
};
