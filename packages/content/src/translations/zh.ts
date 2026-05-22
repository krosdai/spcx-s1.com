// Chinese translation registry keyed by node id.
//
// PR A (this commit) seeds the registry empty. The translation pass in
// PR B populates one entry per node id. Proper-noun rules from
// `docs/voice-and-visual.md` apply: SpaceX, Falcon 9, Dragon, Starlink,
// Starshield, COLOSSUS, Grok, xAI, Macrohard, Terafab, NASA, FCC, FAA,
// etc. stay in English inside the Chinese string. The Musk quote and
// verbatim S-1 quotes keep their English original on screen — the zh
// string is the translation rendered beneath, not a replacement.
//
// The validator's rule 12 (phase=4) treats a missing key, an undefined
// value, or an empty string the same: a translation gap. Add entries
// here and the build picks them up automatically.

export const zhTranslations: Readonly<Record<string, string>> = Object.freeze({});
