// Chinese translation registry keyed by node id.
//
// Translations land in stage-grouped batches. The validator's rule 12
// (phase=4) treats a missing key, an undefined value, or an empty
// string the same: a translation gap. Add entries here and the build
// picks them up automatically through the `getZh` helper.
//
// Proper-noun rules from docs/voice-and-visual.md: SpaceX, Falcon 9,
// Dragon, Starlink, Starshield, COLOSSUS, Grok, xAI, Macrohard,
// Terafab, NASA, FCC, FAA, etc. — and personal names like Elon Musk —
// stay in English inside the Chinese string. The Musk quote and other
// verbatim S-1 quotes keep their English original on screen; the zh
// string is the translation rendered beneath, not a replacement (see
// dualText in apps/web/src/lib/localized.ts).

export const zhTranslations: Readonly<Record<string, string>> = Object.freeze({
  // Stage 0 — authored mission briefing (third-person, by the site authors).
  "stage0.briefing.disclaimer":
    "本项目是 SpaceX 于 2026 年 5 月公开发布的 Form S-1 文件的爱好者可视化作品，与 SpaceX 官方无任何关联，也不构成投资建议。",
  "stage0.briefing.conceit":
    "本项目把这份招股说明书读作一次发射任务流程，依次穿过任务背景、业务、风险、治理与来源注解。",
  "stage0.briefing.sources":
    "通过来源按钮，可在已引用的段落旁显示对应的 S-1 行号；仅本简报与片尾字幕属于本项目原创，不带来源标注。",
  "stage0.briefing.controls":
    "声音默认关闭；本项目会遵循系统的减少动效偏好，本简报亦可通过信息按钮再次打开。",

  // Stage 1 — verbatim Musk quote. Per docs/voice-and-visual.md the
  // English original stays on screen and this zh string renders
  // beneath. ColdOpen.tsx's secondary parser accepts either a leading
  // ASCII em-dash or the full-width double em-dash for the attribution
  // line, so we use the natural Chinese convention here.
  "stage1.cold-open.musk-quote":
    "“你想要早上醒来时觉得未来一片光明——而这正是成为太空文明的意义所在。它关乎对未来的信念，关乎相信未来会比过去更好。我想不出还有什么比走向群星、置身其间更令人激动的事。”\n——Elon Musk",

  // Stage 4 — non-verbatim list parsed by parseList. Preserves the
  // 7-item numbered shape so the parser emits seven cards in zh just
  // like en. Heading line + intro paragraph land in the parser's
  // preamble slot, matching the existing English render path.
  "stage4.algorithm.repeatable-business-model":
    "我们的可复制商业模式\n我们的商业模式建立在一套可复制、以工程为驱动的框架之上：将我们无与伦比的发射能力、极致的垂直整合、快速迭代与严格的资本纪律相结合，从而构建可持续的大规模业务。我们通过以下核心原则贯彻这套框架：\n1. 利用我们无与伦比的发射能力实现大规模扩张；\n2. 识别并开创全新的万亿美元级市场机会；\n3. 以世界一流的工程能力与第一性原理思维设计解决方案；\n4. 应用“算法准则”（减少愚蠢、删除、优化、加速、自动化）；\n5. 一路垂直整合到最终客户；\n6. 持续降低成本、提升产能；以及\n7. 产生可观的现金流并再投资于未来。",
  // Verbatim algorithm step 4 (the single-line Musk-coined formula).
  // The zh translation will render beneath the verbatim English line
  // per dualText's verbatim path.
  "stage4.algorithm.five-step": "4. 应用“算法准则”（减少愚蠢、删除、优化、加速、自动化）；",
});
