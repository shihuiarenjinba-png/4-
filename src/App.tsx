import { useState, useEffect, useCallback } from "react";

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════
interface SubjMeta {
  label: string;
  max: number;
  group: string;
  toshinKeys: Record<number, string>;
  pnUrl: string;
}

interface ScoreEntry { [key: string]: number }
interface LogEntry { date: string; subject: string; mins: number }
interface WeakNote { text: string; date: string }

interface AppState {
  scores: Record<string, ScoreEntry>;
  goals: Record<string, number>;
  logs: LogEntry[];
  weakNotes: WeakNote[];
  ai: { c: number; w: number; today: number; todayDate: string; weakMap: Record<string, number> };
  checks: Record<string, boolean>;
  streak: number;
  school: string;
  selectedSubjs: string[];
  examTab: string;
}

// ════════════════════════════════════════
// 過去問URLデータベース（完全版・年度別直接URL）
// 東進: https://www.toshin.com/kyotsutest/YYYY/filename.html
// パスナビ: https://passnavi.obunsha.co.jp/kakomon/center/科目/
// ════════════════════════════════════════

// 東進 直接URL完全データベース（年度→科目→URL）
const TOSHIN_URLS: Record<number, Record<string, string>> = {
  2025: {
    "英語リーディング":     "https://www.toshin.com/kyotsutest/2025/reading_question_4.html",
    "英語リスニング":       "https://www.toshin.com/kyotsutest/2025/listening_question_4.html",
    "数学IA":               "https://www.toshin.com/kyotsutest/2025/suugaku-1a_question_4.html",
    "数学IIB":              "https://www.toshin.com/kyotsutest/2025/suugaku2bc_question_4.html",
    "国語":                 "https://www.toshin.com/kyotsutest/2025/kokugo_question_4.html",
    "情報I":                "https://www.toshin.com/kyotsutest/2025/jouhou1_question_2.html",
    "物理基礎":             "https://www.toshin.com/kyotsutest/2025/butsuri-kiso_question_1.html",
    "化学基礎":             "https://www.toshin.com/kyotsutest/2025/kagaku-kiso_question_1.html",
    "生物基礎":             "https://www.toshin.com/kyotsutest/2025/seibutsu-kiso_question_1.html",
    "地学基礎":             "https://www.toshin.com/kyotsutest/2025/chigaku-kiso_question_1.html",
    "物理":                 "https://www.toshin.com/kyotsutest/2025/butsuri_question_1.html",
    "化学":                 "https://www.toshin.com/kyotsutest/2025/kagaku_question_1.html",
    "生物":                 "https://www.toshin.com/kyotsutest/2025/seibutsu_question_1.html",
    "地学":                 "https://www.toshin.com/kyotsutest/2025/chigaku_question_1.html",
    "地理総合・地理探究":   "https://www.toshin.com/kyotsutest/2025/chiri-tankyu_question_1.html",
    "歴史総合・日本史探究": "https://www.toshin.com/kyotsutest/2025/nihonshi-tankyu_question_1.html",
    "歴史総合・世界史探究": "https://www.toshin.com/kyotsutest/2025/sekaishi-tankyu_question_1.html",
    "公共・倫理":           "https://www.toshin.com/kyotsutest/2025/koukyo-rinri_question_1.html",
    "公共・政治経済":       "https://www.toshin.com/kyotsutest/2025/koukyo-seikei_question_1.html",
  },
  2024: {
    "英語リーディング":     "https://www.toshin.com/kyotsutest/2024/reading_question_3.html",
    "英語リスニング":       "https://www.toshin.com/kyotsutest/2024/listening_question_3.html",
    "数学IA":               "https://www.toshin.com/kyotsutest/2024/suugaku-1a_question_3.html",
    "数学IIB":              "https://www.toshin.com/kyotsutest/2024/suugaku2bc_question_3.html",
    "国語":                 "https://www.toshin.com/kyotsutest/2024/kokugo_question_3.html",
    "情報I":                "https://www.toshin.com/kyotsutest/2024/jouhou1_question_1.html",
    "物理基礎":             "https://www.toshin.com/kyotsutest/2024/butsuri-kiso_question_0.html",
    "化学基礎":             "https://www.toshin.com/kyotsutest/2024/kagaku-kiso_question_0.html",
    "生物基礎":             "https://www.toshin.com/kyotsutest/2024/seibutsu-kiso_question_0.html",
    "地学基礎":             "https://www.toshin.com/kyotsutest/2024/chigaku-kiso_question_0.html",
    "物理":                 "https://www.toshin.com/kyotsutest/2024/butsuri_question_0.html",
    "化学":                 "https://www.toshin.com/kyotsutest/2024/kagaku_question_0.html",
    "生物":                 "https://www.toshin.com/kyotsutest/2024/seibutsu_question_0.html",
    "地学":                 "https://www.toshin.com/kyotsutest/2024/chigaku_question_0.html",
    "地理総合・地理探究":   "https://www.toshin.com/kyotsutest/2024/chiri-tankyu_question_0.html",
    "歴史総合・日本史探究": "https://www.toshin.com/kyotsutest/2024/nihonshi-tankyu_question_0.html",
    "歴史総合・世界史探究": "https://www.toshin.com/kyotsutest/2024/sekaishi-tankyu_question_0.html",
    "公共・倫理":           "https://www.toshin.com/kyotsutest/2024/koukyo-rinri_question_0.html",
    "公共・政治経済":       "https://www.toshin.com/kyotsutest/2024/koukyo-seikei_question_0.html",
  },
  2023: {
    "英語リーディング":     "https://www.toshin.com/kyotsutest/2023/reading_question_2.html",
    "英語リスニング":       "https://www.toshin.com/kyotsutest/2023/listening_question_2.html",
    "数学IA":               "https://www.toshin.com/kyotsutest/2023/suugaku-1a_question_2.html",
    "数学IIB":              "https://www.toshin.com/kyotsutest/2023/suugaku2bc_question_2.html",
    "国語":                 "https://www.toshin.com/kyotsutest/2023/kokugo_question_2.html",
    "物理基礎":             "https://www.toshin.com/kyotsutest/2023/butsuri-kiso_question_0.html",
    "化学基礎":             "https://www.toshin.com/kyotsutest/2023/kagaku-kiso_question_0.html",
    "生物基礎":             "https://www.toshin.com/kyotsutest/2023/seibutsu-kiso_question_0.html",
    "地学基礎":             "https://www.toshin.com/kyotsutest/2023/chigaku-kiso_question_0.html",
    "物理":                 "https://www.toshin.com/kyotsutest/2023/butsuri_question_0.html",
    "化学":                 "https://www.toshin.com/kyotsutest/2023/kagaku_question_0.html",
    "生物":                 "https://www.toshin.com/kyotsutest/2023/seibutsu_question_0.html",
    "地学":                 "https://www.toshin.com/kyotsutest/2023/chigaku_question_0.html",
    "地理総合・地理探究":   "https://www.toshin.com/kyotsutest/2023/chiri-tankyu_question_0.html",
    "歴史総合・日本史探究": "https://www.toshin.com/kyotsutest/2023/nihonshi-tankyu_question_0.html",
    "歴史総合・世界史探究": "https://www.toshin.com/kyotsutest/2023/sekaishi-tankyu_question_0.html",
  },
  2022: {
    "英語リーディング":     "https://www.toshin.com/kyotsutest/2022/reading_question_1.html",
    "英語リスニング":       "https://www.toshin.com/kyotsutest/2022/listening_question_1.html",
    "数学IA":               "https://www.toshin.com/kyotsutest/2022/suugaku-1a_question_1.html",
    "数学IIB":              "https://www.toshin.com/kyotsutest/2022/suugaku2bc_question_1.html",
    "国語":                 "https://www.toshin.com/kyotsutest/2022/kokugo_question_1.html",
    "物理基礎":             "https://www.toshin.com/kyotsutest/2022/butsuri-kiso_question_0.html",
    "化学基礎":             "https://www.toshin.com/kyotsutest/2022/kagaku-kiso_question_0.html",
    "生物基礎":             "https://www.toshin.com/kyotsutest/2022/seibutsu-kiso_question_0.html",
    "地学基礎":             "https://www.toshin.com/kyotsutest/2022/chigaku-kiso_question_0.html",
    "物理":                 "https://www.toshin.com/kyotsutest/2022/butsuri_question_0.html",
    "化学":                 "https://www.toshin.com/kyotsutest/2022/kagaku_question_0.html",
    "生物":                 "https://www.toshin.com/kyotsutest/2022/seibutsu_question_0.html",
    "地学":                 "https://www.toshin.com/kyotsutest/2022/chigaku_question_0.html",
    "地理総合・地理探究":   "https://www.toshin.com/kyotsutest/2022/chiri-tankyu_question_0.html",
    "歴史総合・日本史探究": "https://www.toshin.com/kyotsutest/2022/nihonshi-tankyu_question_0.html",
    "歴史総合・世界史探究": "https://www.toshin.com/kyotsutest/2022/sekaishi-tankyu_question_0.html",
  },
  2021: {
    "英語リーディング":     "https://www.toshin.com/kyotsutest/2021/reading_question_0.html",
    "英語リスニング":       "https://www.toshin.com/kyotsutest/2021/listening_question_0.html",
    "数学IA":               "https://www.toshin.com/kyotsutest/2021/suugaku-1a_question_0.html",
    "数学IIB":              "https://www.toshin.com/kyotsutest/2021/suugaku2bc_question_0.html",
    "国語":                 "https://www.toshin.com/kyotsutest/2021/kokugo_question_0.html",
    "物理基礎":             "https://www.toshin.com/kyotsutest/2021/butsuri-kiso_question_0.html",
    "化学基礎":             "https://www.toshin.com/kyotsutest/2021/kagaku-kiso_question_0.html",
    "生物基礎":             "https://www.toshin.com/kyotsutest/2021/seibutsu-kiso_question_0.html",
    "地学基礎":             "https://www.toshin.com/kyotsutest/2021/chigaku-kiso_question_0.html",
    "物理":                 "https://www.toshin.com/kyotsutest/2021/butsuri_question_0.html",
    "化学":                 "https://www.toshin.com/kyotsutest/2021/kagaku_question_0.html",
    "生物":                 "https://www.toshin.com/kyotsutest/2021/seibutsu_question_0.html",
    "地学":                 "https://www.toshin.com/kyotsutest/2021/chigaku_question_0.html",
  },
};

// パスナビ 科目別URL（obunsha.co.jp）
const PN_URLS: Record<string, string> = {
  "英語リーディング":     "https://passnavi.obunsha.co.jp/kakomon/center/eigo/",
  "英語リスニング":       "https://passnavi.obunsha.co.jp/kakomon/center/eigo/",
  "数学IA":               "https://passnavi.obunsha.co.jp/kakomon/center/sugaku/",
  "数学IIB":              "https://passnavi.obunsha.co.jp/kakomon/center/sugaku/",
  "国語":                 "https://passnavi.obunsha.co.jp/kakomon/center/kokugo/",
  "情報I":                "https://passnavi.obunsha.co.jp/kakomon/center/",
  "物理基礎":             "https://passnavi.obunsha.co.jp/kakomon/center/butsuri/",
  "化学基礎":             "https://passnavi.obunsha.co.jp/kakomon/center/kagaku/",
  "生物基礎":             "https://passnavi.obunsha.co.jp/kakomon/center/seibutsu/",
  "地学基礎":             "https://passnavi.obunsha.co.jp/kakomon/center/chigaku/",
  "物理":                 "https://passnavi.obunsha.co.jp/kakomon/center/butsuri/",
  "化学":                 "https://passnavi.obunsha.co.jp/kakomon/center/kagaku/",
  "生物":                 "https://passnavi.obunsha.co.jp/kakomon/center/seibutsu/",
  "地学":                 "https://passnavi.obunsha.co.jp/kakomon/center/chigaku/",
  "地理総合・地理探究":   "https://passnavi.obunsha.co.jp/kakomon/center/chiri/",
  "歴史総合・日本史探究": "https://passnavi.obunsha.co.jp/kakomon/center/chiri/",
  "歴史総合・世界史探究": "https://passnavi.obunsha.co.jp/kakomon/center/chiri/",
  "公共・倫理":           "https://passnavi.obunsha.co.jp/kakomon/center/rinri/",
  "公共・政治経済":       "https://passnavi.obunsha.co.jp/kakomon/center/rinri/",
};

// パスナビ正規URL（obunsha.co.jp）
const PN_BASE = "https://passnavi.obunsha.co.jp/kakomon/center/";

const SUBJ_MASTER: Record<string, SubjMeta> = {
  "英語リーディング": { label: "英語（リーディング）", max: 100, group: "英語",
    toshinKeys: {}, pnUrl: PN_URLS["英語リーディング"] },
  "英語リスニング": { label: "英語（リスニング）", max: 100, group: "英語",
    toshinKeys: {}, pnUrl: PN_URLS["英語リスニング"] },
  "数学IA": { label: "数学ⅠA", max: 100, group: "数学",
    toshinKeys: {}, pnUrl: PN_URLS["数学IA"] },
  "数学IIB": { label: "数学ⅡBC", max: 100, group: "数学",
    toshinKeys: {}, pnUrl: PN_URLS["数学IIB"] },
  "国語": { label: "国語", max: 200, group: "国語",
    toshinKeys: {}, pnUrl: PN_URLS["国語"] },
  "情報I": { label: "情報Ⅰ", max: 100, group: "情報",
    toshinKeys: {}, pnUrl: PN_URLS["情報I"] },
  "物理基礎": { label: "物理基礎", max: 50, group: "理科（基礎）",
    toshinKeys: {}, pnUrl: PN_URLS["物理基礎"] },
  "化学基礎": { label: "化学基礎", max: 50, group: "理科（基礎）",
    toshinKeys: {}, pnUrl: PN_URLS["化学基礎"] },
  "生物基礎": { label: "生物基礎", max: 50, group: "理科（基礎）",
    toshinKeys: {}, pnUrl: PN_URLS["生物基礎"] },
  "地学基礎": { label: "地学基礎", max: 50, group: "理科（基礎）",
    toshinKeys: {}, pnUrl: PN_URLS["地学基礎"] },
  "物理": { label: "物理", max: 100, group: "理科（発展）",
    toshinKeys: {}, pnUrl: PN_URLS["物理"] },
  "化学": { label: "化学", max: 100, group: "理科（発展）",
    toshinKeys: {}, pnUrl: PN_URLS["化学"] },
  "生物": { label: "生物", max: 100, group: "理科（発展）",
    toshinKeys: {}, pnUrl: PN_URLS["生物"] },
  "地学": { label: "地学", max: 100, group: "理科（発展）",
    toshinKeys: {}, pnUrl: PN_URLS["地学"] },
  "地理総合・地理探究": { label: "地理総合、地理探究", max: 100, group: "地歴公民",
    toshinKeys: {}, pnUrl: PN_URLS["地理総合・地理探究"] },
  "歴史総合・日本史探究": { label: "歴史総合、日本史探究", max: 100, group: "地歴公民",
    toshinKeys: {}, pnUrl: PN_URLS["歴史総合・日本史探究"] },
  "歴史総合・世界史探究": { label: "歴史総合、世界史探究", max: 100, group: "地歴公民",
    toshinKeys: {}, pnUrl: PN_URLS["歴史総合・世界史探究"] },
  "公共・倫理": { label: "公共、倫理", max: 100, group: "地歴公民",
    toshinKeys: {}, pnUrl: PN_URLS["公共・倫理"] },
  "公共・政治経済": { label: "公共、政治・経済", max: 100, group: "地歴公民",
    toshinKeys: {}, pnUrl: PN_URLS["公共・政治経済"] },
};

const GROUP_COLOR: Record<string, string> = {
  "英語": "#4d8fff", "数学": "#ff6535", "国語": "#ffd060",
  "情報": "#b060ff", "理科（基礎）": "#00e09c", "理科（発展）": "#00e09c",
  "地歴公民": "#e07850",
};

const CHECKS = [
  { id: "c1", t: "英単語アプリ（Flips）を毎日起動する習慣をつける" },
  { id: "c2", t: "東進DBに無料会員登録する" },
  { id: "c3", t: "パスナビに無料会員登録する" },
  { id: "c4", t: "数ⅠAの基礎問題集を1周する" },
  { id: "c5", t: "数ⅡBの基礎問題集を1周する" },
  { id: "c6", t: "模試（進研模試）を1回受けてスコアを記録する" },
  { id: "c7", t: "志望校を1校以上決める（設定タブに入力）" },
  { id: "c8", t: "AI問題タブで10問以上解く" },
];

const EXAM_YEARS = [2025, 2024, 2023, 2022, 2021];
const DAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

const DEFAULT_STATE: AppState = {
  scores: {}, goals: {}, logs: [], weakNotes: [],
  ai: { c: 0, w: 0, today: 0, todayDate: "", weakMap: {} },
  checks: {}, streak: 1, school: "",
  selectedSubjs: Object.keys(SUBJ_MASTER),
  examTab: Object.keys(SUBJ_MASTER)[0],
};

const STORAGE_KEY = "jp3";

// ════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════
function p2(n: number) { return String(n).padStart(2, "0"); }
function clamp(v: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, v)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function monthStr() { return new Date().toISOString().slice(0, 7); }

// DBから直接URLを引く（推測なし）
function getToshinURL(key: string, year: number): string | null {
  return TOSHIN_URLS[year]?.[key] ?? null;
}

function getPnURL(key: string): string {
  return PN_URLS[key] ?? PN_BASE;
}

function getLatest(scores: Record<string, ScoreEntry>, key: string): number | null {
  const dates = Object.keys(scores).sort().reverse();
  for (const d of dates) if (scores[d][key] != null) return scores[d][key];
  return null;
}
function getAll(scores: Record<string, ScoreEntry>, key: string) {
  return Object.keys(scores).sort().map(d => ({ date: d, val: scores[d][key] })).filter(x => x.val != null);
}
function getPct(scores: Record<string, ScoreEntry>, key: string): number | null {
  const v = getLatest(scores, key);
  if (v == null) return null;
  return Math.round(v / (SUBJ_MASTER[key]?.max || 100) * 100);
}

// ════════════════════════════════════════
// CSS (injected once)
// ════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
:root{--bg:#09090e;--s1:#101016;--s2:#15151c;--b1:#222230;--b2:#2c2c3c;--t1:#eeeef8;--t2:#9898b8;--t3:#55556a;--gr:#00e09c;--grd:#00e09c22;--or:#ff6535;--ord:#ff653522;--bl:#4d8fff;--bld:#4d8fff22;--pu:#b060ff;--pud:#b060ff22;--ye:#ffd060;--re:#ff4466;--r:10px;--rsm:7px}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Noto Sans JP',sans-serif;background:var(--bg);color:var(--t1);font-size:13px;line-height:1.6;min-height:100vh}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px}
.hdr{position:sticky;top:0;z-index:300;background:rgba(9,9,14,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--b1);height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 18px}
.logo{font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:var(--gr);letter-spacing:.5px}
.logo span{color:var(--t3)}
.streak{font-family:'DM Mono',monospace;font-size:10px;background:var(--ord);color:var(--or);border:1px solid #ff653530;padding:3px 9px;border-radius:99px}
.hdate{font-family:'DM Mono',monospace;font-size:10px;color:var(--t3)}
.nav{background:var(--s1);border-bottom:1px solid var(--b1);display:flex;overflow-x:auto;scrollbar-width:none;padding:0 18px}
.nav::-webkit-scrollbar{display:none}
.nb{padding:10px 14px;border:none;background:transparent;color:var(--t2);cursor:pointer;font-size:12px;font-weight:500;font-family:'Noto Sans JP',sans-serif;border-bottom:2px solid transparent;white-space:nowrap;transition:color .15s,border-color .15s}
.nb:hover{color:var(--t1)}
.nb.on{color:var(--gr);border-bottom-color:var(--gr)}
.main{padding:16px 14px;max-width:1060px;margin:0 auto}
@media(max-width:480px){.main{padding:12px 10px}}
.card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:16px;margin-bottom:14px}
.ct{font-size:13px;font-weight:700;margin-bottom:3px}
.cs{font-size:11px;color:var(--t2);margin-bottom:12px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
@media(max-width:680px){.g2,.g4{grid-template-columns:1fr}}
@media(min-width:481px) and (max-width:900px){.g4{grid-template-columns:1fr 1fr}}
.sc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:14px;position:relative;overflow:hidden}
.sc::after{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.sc.g::after{background:var(--gr)}.sc.o::after{background:var(--or)}.sc.b::after{background:var(--bl)}.sc.p::after{background:var(--pu)}
.slbl{font-size:10px;color:var(--t2);text-transform:uppercase;letter-spacing:.8px;font-weight:600;margin-bottom:5px}
.sval{font-family:'DM Mono',monospace;font-size:24px;line-height:1;margin-bottom:3px}
.sval.g{color:var(--gr)}.sval.o{color:var(--or)}.sval.b{color:var(--bl)}.sval.p{color:var(--pu)}
.sunit{font-size:11px;color:var(--t2)}
.bbg{margin-top:9px;background:var(--b1);border-radius:99px;height:3px;overflow:hidden}
.bb{height:100%;border-radius:99px;transition:width 1s cubic-bezier(.16,1,.3,1)}
.bb.g{background:var(--gr)}.bb.o{background:var(--or)}.bb.b{background:var(--bl)}.bb.p{background:var(--pu)}.bb.y{background:var(--ye)}
.badge{display:inline-flex;align-items:center;font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px}
.badge.a{background:var(--gr);color:#000}.badge.h{background:var(--or);color:#fff}.badge.u{background:var(--b1);color:var(--t2)}.badge.f{background:var(--pu);color:#fff}
.pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:22px}
.pc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:14px}
.pc.cur{border-color:var(--gr);background:var(--grd)}
.pn{font-size:13px;font-weight:700;margin-bottom:2px}
.pp{font-size:11px;color:var(--t2);margin-bottom:8px}
.pl{list-style:none}
.pl li{font-size:11px;color:var(--t2);padding:2px 0 2px 11px;position:relative}
.pl li::before{content:'›';position:absolute;left:0;color:var(--gr)}
.adv{background:var(--ord);border:1px solid #ff653530;border-radius:var(--rsm);padding:10px 12px;font-size:12px;color:var(--or);margin-bottom:14px;display:flex;gap:8px;line-height:1.6}
.adv.good{background:var(--grd);border-color:#00e09c30;color:var(--gr)}
.lp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
@media(max-width:480px){.lp{grid-template-columns:1fr}}
.lb{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;border-radius:var(--rsm);text-decoration:none;border:1px solid;cursor:pointer;transition:transform .1s,opacity .1s;gap:6px}
.lb:hover{transform:translateY(-1px);opacity:.88}
.lb:active{transform:none}
.lb.pn{background:#00c97e12;border-color:#00c97e30;color:#00c97e}
.lb.ts{background:var(--ord);border-color:#ff653530;color:var(--or)}
.ln{font-size:12px;font-weight:700}
.ld2{font-size:10px;opacity:.65;margin-top:1px}
.la{font-size:13px;opacity:.5;flex-shrink:0}
.sh{font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;padding-bottom:7px;margin-bottom:7px;border-bottom:1px solid var(--b1)}
.sr{display:flex;align-items:center;padding:9px 0;border-bottom:1px solid var(--b1);gap:8px;font-size:12px}
.sr:last-child{border-bottom:none}
.ci{display:flex;align-items:flex-start;gap:9px;padding:12px 0;border-bottom:1px solid var(--b1);cursor:pointer;user-select:none;font-size:12px;-webkit-tap-highlight-color:transparent}
.ci:last-child{border-bottom:none}
.ci input[type=checkbox]{width:18px;height:18px;flex-shrink:0;accent-color:var(--gr);margin-top:1px;cursor:pointer}
.ci.done{color:var(--t3);text-decoration:line-through}
.li{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--b1);font-size:12px}
.li:last-child{border-bottom:none}
.ldx{font-family:'DM Mono',monospace;font-size:10px;color:var(--t3);white-space:nowrap;padding-top:2px;min-width:65px}
.lm{font-family:'DM Mono',monospace;font-size:11px;color:var(--gr)}
.rg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:11px}
.rc{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:15px;display:flex;flex-direction:column;gap:5px}
.rt{display:inline-block;font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;text-transform:uppercase;letter-spacing:.5px;width:fit-content}
.tag-en{background:var(--bld);color:var(--bl)}.tag-ma{background:var(--ord);color:var(--or)}.tag-sc{background:var(--pud);color:var(--pu)}.tag-ap{background:var(--grd);color:var(--gr)}
.rl{font-size:13px;font-weight:700}
.rd{font-size:11px;color:var(--t2);line-height:1.6}
.ra{display:inline-flex;align-items:center;gap:3px;font-size:11px;color:var(--gr);text-decoration:none;font-weight:600;margin-top:3px}
.ra:hover{opacity:.75}
.btn{padding:8px 16px;border:none;border-radius:var(--rsm);font-size:12px;font-weight:700;font-family:'Noto Sans JP',sans-serif;cursor:pointer;transition:opacity .15s,transform .1s;white-space:nowrap}
.btn:hover{opacity:.85}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.3;cursor:not-allowed;transform:none}
.btn-g{background:var(--gr);color:#000}
.btn-b{background:var(--bl);color:#fff}
.btn-ghost{background:transparent;color:var(--t2);border:1px solid var(--b2)}
.btn-ghost:hover{color:var(--t1);border-color:var(--t3)}
input[type=text],select,textarea{background:var(--s2);border:1px solid var(--b2);border-radius:var(--rsm);padding:7px 10px;color:var(--t1);font-family:'Noto Sans JP',sans-serif;font-size:12px;width:100%;transition:border-color .15s}
select{cursor:pointer}
input[type=text]:focus,select:focus,textarea:focus{outline:none;border-color:var(--gr)}
textarea{resize:vertical;min-height:65px}
.fl{font-size:10px;color:var(--t2);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.fg{display:flex;flex-direction:column;flex:1;min-width:120px}
.prob-box{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:18px;min-height:140px}
.prob-empty{color:var(--t3);text-align:center;padding:36px 0}
.prob-txt{font-size:13px;line-height:1.9;white-space:pre-wrap}
.choices{margin-top:11px;display:flex;flex-direction:column;gap:5px}
.ch{text-align:left;background:var(--s2);border:1px solid var(--b2);border-radius:var(--rsm);padding:9px 13px;color:var(--t1);font-family:'Noto Sans JP',sans-serif;font-size:12px;cursor:pointer;transition:all .12s;width:100%}
.ch:hover{border-color:var(--bl);background:var(--bld)}
.ch.ok{border-color:var(--gr);background:var(--grd);color:var(--gr)}
.ch.ng{border-color:var(--re);background:#ff446622;color:var(--re)}
.fb{margin-top:10px;padding:12px;border-radius:var(--rsm);font-size:12px;line-height:1.8;white-space:pre-wrap}
.fb.ok{background:var(--grd);border:1px solid #00e09c30;color:var(--gr)}
.fb.ng{background:#ff446622;border:1px solid #ff446630;color:#ff9090}
.fb.ld{background:var(--s2);border:1px solid var(--b1);color:var(--t2)}
.spin{display:inline-block;width:11px;height:11px;border:2px solid var(--b2);border-top-color:var(--gr);border-radius:50%;animation:rot .6s linear infinite;vertical-align:middle;margin-right:5px}
@keyframes rot{to{transform:rotate(360deg)}}
.divider{height:1px;background:var(--b1);margin:14px 0}
.stitle{font-size:15px;font-weight:700;margin-bottom:3px}
.ssub{font-size:12px;color:var(--t2);margin-bottom:18px}
.wi{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--b1);font-size:12px}
.wi:last-child{border-bottom:none}
.wd{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.dr{background:var(--re)}.dy{background:var(--ye)}.dg{background:var(--gr)}
`;

// ════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("progress");
  const [S, setS] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {}
    return DEFAULT_STATE;
  });

  // Persist state
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch {}
  }, [S]);

  // Inject CSS once
  useEffect(() => {
    if (!document.getElementById("juken-css")) {
      const el = document.createElement("style");
      el.id = "juken-css";
      el.textContent = CSS;
      document.head.appendChild(el);
    }
  }, []);

  const update = useCallback((fn: (prev: AppState) => AppState) => setS(fn), []);

  const getSubjs = () => S.selectedSubjs.length ? S.selectedSubjs : Object.keys(SUBJ_MASTER);

  // ── TAB NAVIGATION ──
  const TABS = [
    { id: "progress", label: "📊 進捗" },
    { id: "exam",     label: "📝 過去問" },
    { id: "ref",      label: "📚 参考書" },
    { id: "ai",       label: "🤖 AI問題" },
    { id: "score",    label: "🎯 スコア記録" },
    { id: "file",     label: "📁 データ分析" },
    { id: "weak",     label: "⚠️ 弱点管理" },
    { id: "plan",     label: "📅 学習計画" },
    { id: "settings", label: "⚙️ 設定" },
  ];

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${p2(now.getMonth() + 1)}.${p2(now.getDate())}`;
  const exam = new Date("2027-01-18");
  const daysLeft = Math.ceil((exam.getTime() - now.getTime()) / 86400000);
  const total = Math.ceil((exam.getTime() - new Date("2026-04-01").getTime()) / 86400000);
  const daysPct = clamp(((total - daysLeft) / total) * 100);

  const enScore = getLatest(S.scores, "英語リーディング");
  const maScore = getLatest(S.scores, "数学IA");
  const ym = monthStr();
  const monthMins = S.logs.filter(l => l.date.startsWith(ym)).reduce((a, l) => a + l.mins, 0);
  const monthHrs = monthMins / 60;

  return (
    <div>
      {/* Header */}
      <header className="hdr">
        <div className="logo">JUKEN<span>/</span>PROJECT</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="streak">🔥 {S.streak}日連続</div>
          <div className="hdate">{dateStr}</div>
        </div>
      </header>

      {/* Nav */}
      <nav className="nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nb${tab === t.id ? " on" : ""}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </nav>

      <main className="main">
        {tab === "progress" && <ProgressTab S={S} update={update} daysLeft={daysLeft} daysPct={daysPct} enScore={enScore} maScore={maScore} monthHrs={monthHrs} getSubjs={getSubjs} />}
        {tab === "exam"     && <ExamTab S={S} update={update} getSubjs={getSubjs} />}
        {tab === "ref"      && <RefTab />}
        {tab === "ai"       && <AITab S={S} update={update} getSubjs={getSubjs} />}
        {tab === "score"    && <ScoreTab S={S} update={update} getSubjs={getSubjs} />}
        {tab === "file"     && <FileTab S={S} getSubjs={getSubjs} />}
        {tab === "weak"     && <WeakTab S={S} update={update} />}
        {tab === "plan"     && <PlanTab logs={S.logs} />}
        {tab === "settings" && <SettingsTab S={S} update={update} getSubjs={getSubjs} />}
      </main>
    </div>
  );
}

// ════════════════════════════════════════
// PROGRESS TAB
// ════════════════════════════════════════
function ProgressTab({ S, update, daysLeft, daysPct, enScore, maScore, monthHrs, getSubjs }: {
  S: AppState; update: any; daysLeft: number; daysPct: number;
  enScore: number | null; maScore: number | null; monthHrs: number; getSubjs: () => string[];
}) {
  const enPct = enScore != null ? enScore : 0;
  const maPct = maScore != null ? maScore : 0;
  const hrsPct = clamp(monthHrs / 60 * 100);

  const lowSubjs = getSubjs().filter(k => {
    const pct = getPct(S.scores, k);
    return pct != null && pct < 50;
  });
  const ym = monthStr();
  const mLogs = S.logs.filter(l => l.date.startsWith(ym));

  return (
    <div>
      <div className="stitle">受験合格プロジェクト</div>
      <div className="ssub">高校3年生 — 英語・数学・理科社会 重点強化プラン</div>

      {/* Advisory */}
      {(lowSubjs.length > 0 || mLogs.length < 3) && (
        <div>
          {lowSubjs.length > 0 && (
            <div className="adv">⚠️ {lowSubjs.map(k => SUBJ_MASTER[k]?.label).join("・")}のスコアが低め — 基礎から取り組みましょう</div>
          )}
          {mLogs.length < 3 && (
            <div className="adv">⚠️ 今月の学習記録が少なめです — 毎日ログをつけましょう</div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="g4" style={{ marginBottom: 22 }}>
        <StatCard color="g" label="共通テストまで" value={String(daysLeft)} unit="日" pct={daysPct} />
        <StatCard color="o" label="英語スコア" value={enScore != null ? String(enScore) : "—"} unit="/100点" pct={enPct} />
        <StatCard color="b" label="数学スコア" value={maScore != null ? String(maScore) : "—"} unit="/100点" pct={maPct} />
        <StatCard color="p" label="今月の学習時間" value={monthHrs.toFixed(1)} unit="時間" pct={hrsPct} />
      </div>

      {/* Phase roadmap */}
      <div style={{ fontSize: 11, color: "var(--t2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>📅 フェーズロードマップ</div>
      <div className="pgrid">
        {[
          { badge: "a", label: "▶ 現在", name: "🌱 Phase 1 — 基礎完成", period: "4月〜6月（部活期間）", items: ["Flipsで英単語毎日習慣化", "移動中リスニング積み上げ", "数ⅠAⅡBの基礎問題集1周", "東進DB登録・過去問に慣れる", "「ゼロにしない」を徹底"], cur: true },
          { badge: "h", label: "🔥 勝負", name: "🔥 Phase 2 — 実力養成", period: "7月〜9月（夏休み）", items: ["1日4〜6時間学習へ切替", "長文読解・リスニング強化", "理科・社会の範囲を完了", "河合・進研模試で現状把握", "志望校確定・赤本購入"], cur: false },
          { badge: "u", label: "📝 次", name: "📝 Phase 3 — 過去問演習", period: "10月〜11月", items: ["東進DBで共通テスト5〜10年分", "パスナビ解説で理解を深める", "苦手分野を集中補強", "時間計測で本番ペース把握"], cur: false },
          { badge: "f", label: "🏁 仕上げ", name: "🏁 Phase 4 — 本番対策", period: "12月〜1月", items: ["本番形式・時間制限で演習", "二次・私大過去問3〜5年分", "体調・メンタル管理最優先", "苦手単元の最終確認"], cur: false },
        ].map(p => (
          <div key={p.name} className={`pc${p.cur ? " cur" : ""}`}>
            <span className={`badge ${p.badge}`}>{p.label}</span>
            <div className="pn">{p.name}</div>
            <div className="pp">{p.period}</div>
            <ul className="pl">{p.items.map(i => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div style={{ fontSize: 11, color: "var(--t2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>✅ Phase 1 チェックリスト</div>
      <div className="card">
        {CHECKS.map(c => (
          <div
            key={c.id}
            className={`ci${S.checks[c.id] ? " done" : ""}`}
            onClick={() => update((prev: AppState) => ({ ...prev, checks: { ...prev.checks, [c.id]: !prev.checks[c.id] } }))}
          >
            <input type="checkbox" checked={!!S.checks[c.id]} onChange={() => {}} onClick={e => e.stopPropagation()} />
            <span>{c.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ color, label, value, unit, pct }: { color: string; label: string; value: string; unit: string; pct: number }) {
  return (
    <div className={`sc ${color}`}>
      <div className="slbl">{label}</div>
      <div className={`sval ${color}`}>{value}</div>
      <div className="sunit">{unit}</div>
      <div className="bbg"><div className={`bb ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

// ════════════════════════════════════════
// EXAM TAB
// ════════════════════════════════════════
function ExamTab({ S, update, getSubjs }: { S: AppState; update: any; getSubjs: () => string[] }) {
  const groups: Record<string, string[]> = {};
  getSubjs().forEach(key => {
    const m = SUBJ_MASTER[key];
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(key);
  });

  const setExamTab = (key: string) => update((p: AppState) => ({ ...p, examTab: key }));
  const activeKey = S.examTab;
  const activeM = SUBJ_MASTER[activeKey];
  const color = activeM ? (GROUP_COLOR[activeM.group] || "var(--t2)") : "var(--t2)";

  return (
    <div>
      <div className="stitle">過去問データベース</div>
      <div className="ssub">科目を選んで年度ボタンで直接その年の問題ページへジャンプ</div>

      {/* Subject tabs */}
      <div style={{ marginBottom: 18 }}>
        {Object.entries(groups).map(([grp, keys]) => (
          <div key={grp} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>{grp}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {keys.map(key => {
                const m = SUBJ_MASTER[key];
                const c = GROUP_COLOR[m.group] || "var(--t2)";
                const active = activeKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setExamTab(key)}
                    style={{
                      padding: "5px 12px", borderRadius: 99,
                      border: `1px solid ${active ? c + "88" : "var(--b2)"}`,
                      background: active ? c + "22" : "transparent",
                      color: active ? c : "var(--t2)",
                      fontSize: 11, fontWeight: active ? 700 : 500,
                      cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >{m.label}</button>
                );
              })}
            </div>
          </div>
        ))}
        {/* Secondary tab */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>🎓 二次試験</div>
          <button
            onClick={() => setExamTab("__secondary__")}
            style={{
              padding: "5px 12px", borderRadius: 99,
              border: `1px solid ${activeKey === "__secondary__" ? "var(--pu)88" : "var(--b2)"}`,
              background: activeKey === "__secondary__" ? "var(--pud)" : "transparent",
              color: activeKey === "__secondary__" ? "var(--pu)" : "var(--t2)",
              fontSize: 11, fontWeight: activeKey === "__secondary__" ? 700 : 500,
              cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif",
            }}
          >二次試験（大学別）</button>
        </div>
      </div>

      {/* Content */}
      {activeKey === "__secondary__" ? (
        <div className="card">
          <div className="ct">🎓 二次試験（個別試験）</div>
          <div className="cs">2教科500点満点 / 個別(2次)配点比率33%</div>
          <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 14, lineHeight: 1.9 }}>
            【数学】数Ⅰ・数A・数Ⅱ・数B（数列）・数C（ベクトル）(200点)<br />
            【理科】「物理基礎・物理」「化学基礎・化学」「生物基礎・生物」から1科目 (200点)<br />
            【調査書】(100点)
          </div>
          <div className="lp">
            <a className="lb pn" href="https://passnavi.obunsha.co.jp/kakomon/" target="_blank" rel="noopener noreferrer">
              <div><div className="ln">パスナビ｜大学別 過去問検索</div><div className="ld2">大学名で検索して各校の二次試験へ</div></div>
              <div className="la">↗</div>
            </a>
            <a className="lb ts" href="https://www.toshin-kakomon.com/univ/" target="_blank" rel="noopener noreferrer">
              <div><div className="ln">東進｜大学別 過去問DB</div><div className="ld2">大学別DB（要無料会員登録）</div></div>
              <div className="la">↗</div>
            </a>
          </div>
        </div>
      ) : activeM ? (
        <div className="card">
          <div className="ct" style={{ color }}>{activeM.label}</div>
          <div className="cs">満点: {activeM.max}点 ｜ 年度ボタンで直接その年の問題ページへ</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>
              📂 東進 — 年度を選んで直接その問題ページへ
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EXAM_YEARS.map(y => {
                const url = getToshinURL(activeKey, y);
                return url ? (
                  <a key={y} href={url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-block", padding: "5px 13px", borderRadius: 99,
                      background: color + "22", border: `1px solid ${color}44`, color,
                      fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >{y}年</a>
                ) : (
                  <span key={y} style={{ padding: "5px 12px", borderRadius: 99, background: "var(--b1)", color: "var(--t4)", fontSize: 11, fontFamily: "'DM Mono',monospace" }}>{y}</span>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>📖 パスナビ — 解説付き過去問（5年分）</div>
            <a className="lb pn" href={getPnURL(activeKey)} target="_blank" rel="noopener noreferrer">
              <div><div className="ln">パスナビ｜{activeM.label} 過去問（解説付き）</div><div className="ld2">解説・解答付き過去問</div></div>
              <div className="la">↗</div>
            </a>
          </div>

          <div style={{ fontSize: 11, color: "var(--t3)", padding: 10, background: "var(--s2)", borderRadius: "var(--rsm)", lineHeight: 1.7 }}>
            💡 東進DBは<strong style={{ color: "var(--t2)" }}>無料会員登録</strong>で最大31年分閲覧可。
            パスナビは<strong style={{ color: "var(--t2)" }}>解説付き</strong>で理解を深めるのに最適。
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ════════════════════════════════════════
// REF TAB
// ════════════════════════════════════════
function RefTab() {
  const refs = [
    { tag: "tag-ap", tagLabel: "📱 アプリ", title: "Flips — 共通テスト英単語", desc: "共通テストによく出る英単語を収録。部活の移動中・すき間時間に最適。", href: "https://apps.apple.com/jp/app/flips-%E5%85%B1%E9%80%9A%E3%83%86%E3%82%B9%E3%83%88%E3%81%A7%E3%82%88%E3%81%8F%E5%87%BA%E3%82%8B%E8%8B%B1%E5%8D%98%E8%AA%9E%E3%82%92%E5%8F%8E%E9%8C%B2/id6752226363", linkLabel: "App Storeで開く ↗" },
    { tag: "tag-en", tagLabel: "過去問", title: "東進 過去問データベース", desc: "完全無料。全科目・最大31年分が閲覧・PDF保存可。会員登録のみ。", href: "https://www.toshin-kakomon.com/", linkLabel: "サイトを開く ↗" },
    { tag: "tag-en", tagLabel: "過去問", title: "パスナビ（旺文社）", desc: "解説・英語全訳付き。170大学以上・5年分を無料閲覧。解説重視ならこちら。", href: "https://passnavi.obunsha.co.jp/", linkLabel: "サイトを開く ↗" },
    { tag: "tag-sc", tagLabel: "理科・社会", title: "マナビジョン（ベネッセ）", desc: "国公立大の過去問が解説付きで無料閲覧可能。120大学以上対応。", href: "https://manabi.benesse.ne.jp/", linkLabel: "サイトを開く ↗" },
    { tag: "tag-ap", tagLabel: "📱 アプリ", title: "スタディサプリ", desc: "映像授業で基礎から応用まで。共通テスト対策講座が充実。", href: "https://studysapuri.jp/", linkLabel: "サイトを開く ↗" },
  ];

  return (
    <div>
      <div className="stitle">参考書・学習ツール</div>
      <div className="ssub">大学受験向けおすすめリソース</div>
      <div className="rg">
        {refs.map(r => (
          <div key={r.title} className="rc">
            <span className={`rt ${r.tag}`}>{r.tagLabel}</span>
            <div className="rl">{r.title}</div>
            <div className="rd">{r.desc}</div>
            <a className="ra" href={r.href} target="_blank" rel="noopener noreferrer">{r.linkLabel}</a>
          </div>
        ))}
        {/* Google AI API枠 */}
        <div className="rc" style={{ border: "1px dashed var(--bl)", background: "var(--bld)" }}>
          <span className="rt" style={{ background: "var(--bld)", color: "var(--bl)" }}>🤖 AI</span>
          <div className="rl" style={{ color: "var(--bl)" }}>Google AI Studio（準備中）</div>
          <div className="rd">Gemini APIを活用した学習支援機能をここに追加予定。APIキーを設定タブで設定してください。</div>
          <span style={{ fontSize: 11, color: "var(--t3)", marginTop: 3 }}>設定タブ → Google AI API欄</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// AI TAB
// ════════════════════════════════════════
function AITab({ S, update, getSubjs }: { S: AppState; update: any; getSubjs: () => string[] }) {
  const [subj, setSubj] = useState("英語リーディング");
  const [lvl, setLvl] = useState("標準（70〜82点レベル）");
  const [typ, setTyp] = useState("choice");
  const [probHtml, setProbHtml] = useState("");
  const [curAns, setCurAns] = useState("");
  const [ansText, setAnsText] = useState("");
  const [fb, setFb] = useState({ text: "", cls: "" });
  const [busy, setBusy] = useState(false);
  const [showAns, setShowAns] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [choiceStates, setChoiceStates] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);

  const recordResult = (isOk: boolean, subjKey: string) => {
    update((prev: AppState) => {
      const ai = { ...prev.ai };
      if (isOk) ai.c++;
      else {
        ai.w++;
        ai.weakMap = { ...ai.weakMap, [subjKey]: (ai.weakMap[subjKey] || 0) + 1 };
      }
      const today = todayStr();
      if (ai.todayDate !== today) { ai.today = 0; ai.todayDate = today; }
      ai.today++;
      return { ...prev, ai };
    });
  };

  const genProblem = async () => {
    if (busy) return;
    setBusy(true); setFb({ text: "", cls: "" }); setProbHtml(""); setCurAns(""); setAnsText(""); setChoices([]); setChoiceStates([]); setAnswered(false); setShowAns(false);
    const isChoice = typ === "choice";
    const typeTxt = isChoice ? "5択の選択式（共通テスト形式）" : typ === "fill" ? "穴埋め" : "記述式";
    const prompt = `共通テスト対策の${subj}の${lvl}の${typeTxt}問題を1問作成してください。
形式（必ずこの通りに出力）:
P:（問題文）
${isChoice ? "C1:（選択肢1）\nC2:（選択肢2）\nC3:（選択肢3）\nC4:（選択肢4）\nC5:（選択肢5）" : ""}
A:（正解${isChoice ? "の番号1〜5" : "・模範解答"}）
E:（解説50〜80字）`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const txt = data.content?.map((c: any) => c.text || "").join("") || "";
      const get = (tag: string) => { const m = txt.match(new RegExp(`${tag}:([^\n]+)`)); return m ? m[1].trim() : ""; };
      const prob = get("P"); const ans = get("A"); const expl = get("E");
      if (!prob) throw new Error("parse error");
      setCurAns(ans); setProbHtml(prob);
      if (isChoice) {
        const ch = [1,2,3,4,5].map(i => get("C" + i)).filter(Boolean);
        setChoices(ch); setChoiceStates(ch.map(() => ""));
      } else { setShowAns(true); }
      update((prev: AppState) => {
        const ai = { ...prev.ai };
        const today = todayStr();
        if (ai.todayDate !== today) { ai.today = 0; ai.todayDate = today; }
        ai.today++; return { ...prev, ai };
      });
      // store expl for later
      setCurAns(ans + "\n__EXPL__" + expl);
    } catch { setProbHtml("__ERROR__"); }
    setBusy(false);
  };

  const pickChoice = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    const correctIdx = parseInt(curAns.split("\n")[0]) - 1;
    const isOk = idx === correctIdx;
    setChoiceStates(choices.map((_, i) => i === idx ? (isOk ? "ok" : "ng") : i === correctIdx ? "ok" : ""));
    const expl = curAns.split("__EXPL__")[1] || "";
    if (!isOk && expl) setFb({ text: "解説: " + expl, cls: "ng" });
    recordResult(isOk, subj);
  };

  const checkAns = async () => {
    if (!ansText.trim() || busy) return;
    setBusy(true); setFb({ text: "", cls: "ld" });
    const ans = curAns.split("\n")[0];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, messages: [{ role: "user", content: `問題:${probHtml}\n模範解答:${ans}\nユーザー解答:${ansText}\n1行目に「正解」か「不正解」、2行目以降に60字以内の解説。` }] }),
      });
      const data = await res.json();
      const txt = data.content?.map((c: any) => c.text || "").join("") || "";
      const isOk = txt.startsWith("正解");
      setFb({ text: txt, cls: isOk ? "ok" : "ng" });
      recordResult(isOk, subj);
    } catch { setFb({ text: "採点エラー。再試行してください。", cls: "ng" }); }
    setBusy(false);
  };

  const total = S.ai.c + S.ai.w;
  const rate = total > 0 ? Math.round(S.ai.c / total * 100) + "%" : "—";

  return (
    <div>
      <div className="stitle">AI 問題生成</div>
      <div className="ssub">共通テスト傾向に特化した問題をリアルタイム生成・即採点</div>

      <div className="card">
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="fg"><div className="fl">科目</div>
            <select value={subj} onChange={e => setSubj(e.target.value)}>
              {getSubjs().map(k => <option key={k} value={k}>{SUBJ_MASTER[k]?.label || k}</option>)}
            </select>
          </div>
          <div className="fg"><div className="fl">難易度</div>
            <select value={lvl} onChange={e => setLvl(e.target.value)}>
              <option value="基礎（50〜65点レベル）">🟢 基礎</option>
              <option value="標準（70〜82点レベル）">🟡 標準</option>
              <option value="応用（85〜100点レベル）">🔴 応用</option>
            </select>
          </div>
          <div className="fg"><div className="fl">形式</div>
            <select value={typ} onChange={e => setTyp(e.target.value)}>
              <option value="choice">選択式（共通テスト形式）</option>
              <option value="text">記述式</option>
              <option value="fill">穴埋め</option>
            </select>
          </div>
          <button className="btn btn-g" onClick={genProblem} disabled={busy}>
            {busy ? <><span className="spin" />生成中…</> : "問題を生成 →"}
          </button>
        </div>
      </div>

      <div className="prob-box">
        {!probHtml && !busy && <div className="prob-empty">科目・難易度を選んで「問題を生成」を押してください</div>}
        {busy && !probHtml && <div className="prob-empty"><span className="spin" />問題を生成中…</div>}
        {probHtml === "__ERROR__" && <div className="prob-empty" style={{ color: "var(--re)" }}>⚠️ 生成に失敗しました。再試行してください。</div>}
        {probHtml && probHtml !== "__ERROR__" && (
          <>
            <div className="prob-txt">{probHtml}</div>
            {choices.length > 0 && (
              <div className="choices">
                {choices.map((c, i) => (
                  <button
                    key={i}
                    className={`ch${choiceStates[i] ? " " + choiceStates[i] : ""}`}
                    onClick={() => pickChoice(i)}
                    disabled={answered}
                  >{i + 1}. {c}</button>
                ))}
              </div>
            )}
            {answered && (
              <div style={{ marginTop: 11, padding: 11, background: "var(--grd)", border: "1px solid #00e09c30", borderRadius: "var(--rsm)", fontSize: 12, color: "var(--gr)" }}>
                ✅ 正解: {curAns.split("\n")[0]}
              </div>
            )}
          </>
        )}
      </div>

      {showAns && probHtml && probHtml !== "__ERROR__" && (
        <div style={{ marginTop: 10 }}>
          <textarea value={ansText} onChange={e => setAnsText(e.target.value)} placeholder="解答を入力してください…" />
          <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
            <button className="btn btn-b" onClick={checkAns} disabled={busy}>採点する</button>
            <button className="btn btn-ghost" onClick={genProblem}>次の問題 →</button>
          </div>
        </div>
      )}
      {answered && <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={genProblem}>次の問題 →</button>}

      {fb.text && <div className={`fb ${fb.cls}`}>{fb.text}</div>}

      <div className="g4" style={{ marginTop: 18 }}>
        {[["正解数", String(S.ai.c), "var(--gr)"], ["不正解数", String(S.ai.w), "var(--re)"], ["正解率", rate, "var(--bl)"], ["今日の問題数", String(S.ai.today), "var(--ye)"]].map(([label, val, color]) => (
          <div key={label} className="card" style={{ marginBottom: 0 }}>
            <div className="ct">{label}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 22, color }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// SCORE TAB
// ════════════════════════════════════════
function ScoreTab({ S, update, getSubjs }: { S: AppState; update: any; getSubjs: () => string[] }) {
  const [scoreDate, setScoreDate] = useState(monthStr());
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [logSubj, setLogSubj] = useState("英語リーディング");
  const [logMins, setLogMins] = useState("");

  const saveScores = () => {
    if (!scoreDate) return;
    update((prev: AppState) => {
      const scores = { ...prev.scores, [scoreDate]: { ...(prev.scores[scoreDate] || {}) } };
      getSubjs().forEach(key => {
        const v = scoreInputs[key];
        if (v && !isNaN(Number(v))) {
          const num = parseInt(v);
          const max = SUBJ_MASTER[key]?.max || 100;
          if (num >= 0 && num <= max) scores[scoreDate][key] = num;
        }
      });
      return { ...prev, scores };
    });
    setScoreInputs({});
    alert("✅ スコアを保存しました！");
  };

  const addLog = () => {
    const mins = parseInt(logMins);
    if (!logSubj || !mins || isNaN(mins)) { alert("科目と時間（分）を入力してください"); return; }
    const date = todayStr();
    update((prev: AppState) => {
      const logs = [{ date, subject: logSubj, mins }, ...prev.logs].slice(0, 200);
      let streak = prev.streak;
      const lastLog = prev.logs[0]?.date || "";
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastLog === yesterday) streak++;
      else if (lastLog !== date) streak = 1;
      return { ...prev, logs, streak };
    });
    setLogMins("");
    alert(`✅ ${logSubj} ${mins}分を記録！`);
  };

  const dates = Object.keys(S.scores).sort().reverse();

  return (
    <div>
      <div className="stitle">スコア記録</div>
      <div className="ssub">模試・過去問の点数を記録すると進捗タブに即反映されます</div>
      <div className="g2">
        <div className="card">
          <div className="ct">📝 共通テスト点数記録</div>
          <div className="cs">各科目のスコアを入力して保存</div>
          {getSubjs().map(key => {
            const m = SUBJ_MASTER[key];
            if (!m) return null;
            return (
              <div key={key} className="sr">
                <span style={{ flex: 1, fontSize: 12 }}>{m.label}</span>
                <input type="text" value={scoreInputs[key] || ""} onChange={e => setScoreInputs(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="—" style={{ width: 60, textAlign: "right", padding: "4px 6px", fontSize: 12, fontFamily: "'DM Mono',monospace" }} />
                <span style={{ fontSize: 10, color: "var(--t3)" }}>/{m.max}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <div className="fg" style={{ flex: 2, minWidth: 110 }}>
              <div className="fl">実施日</div>
              <input type="text" value={scoreDate} onChange={e => setScoreDate(e.target.value)} placeholder="2026-04" />
            </div>
            <button className="btn btn-g" style={{ alignSelf: "flex-end" }} onClick={saveScores}>保存</button>
          </div>
        </div>

        <div className="card">
          <div className="ct">⏱️ 学習時間記録</div>
          <div className="cs">今日の学習時間を科目別に記録</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <div className="fg" style={{ flex: 2, minWidth: 100 }}>
              <div className="fl">科目</div>
              <select value={logSubj} onChange={e => setLogSubj(e.target.value)}>
                {getSubjs().map(k => <option key={k} value={k}>{SUBJ_MASTER[k]?.label || k}</option>)}
              </select>
            </div>
            <div className="fg" style={{ flex: 1, minWidth: 70 }}>
              <div className="fl">時間（分）</div>
              <input type="text" value={logMins} onChange={e => setLogMins(e.target.value)} placeholder="60" />
            </div>
          </div>
          <button className="btn btn-g" style={{ width: "100%" }} onClick={addLog}>記録する</button>
          <div className="divider" />
          {S.logs.length === 0
            ? <div style={{ color: "var(--t3)", fontSize: 12 }}>記録がありません</div>
            : S.logs.slice(0, 8).map((l, i) => (
              <div key={i} className="li">
                <div className="ldx">{l.date}</div>
                <div style={{ flex: 1 }}>{l.subject}</div>
                <div className="lm">{l.mins}分</div>
              </div>
            ))}
        </div>
      </div>

      <div className="card">
        <div className="ct">📊 スコア履歴</div>
        <div className="cs">保存したスコアの一覧</div>
        {!dates.length
          ? <div style={{ color: "var(--t3)", fontSize: 12 }}>まだスコアが記録されていません</div>
          : dates.slice(0, 6).map(d => (
            <div key={d} className="sr">
              <span className="ldx">{d}</span>
              <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(S.scores[d]).map(([key, v]) => {
                  const m = SUBJ_MASTER[key];
                  return (
                    <span key={key} style={{ color: "var(--t2)", fontSize: 11 }}>
                      {m?.label || key}:<span style={{ color: "var(--gr)", fontFamily: "'DM Mono',monospace" }}> {v}/{m?.max || 100}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// FILE TAB (Data Analysis)
// ════════════════════════════════════════
function FileTab({ S, getSubjs }: { S: AppState; getSubjs: () => string[] }) {
  const lowSubjs = getSubjs().filter(k => { const pct = getPct(S.scores, k); return pct != null && pct < 50; });
  const ym = monthStr();
  const mLogs = S.logs.filter(l => l.date.startsWith(ym));

  // Time by subject
  const bySubj: Record<string, number> = {};
  S.logs.forEach(l => { bySubj[l.subject] = (bySubj[l.subject] || 0) + l.mins; });
  const total = Object.values(bySubj).reduce((a, b) => a + b, 0);

  // Freq by day
  const byDay: Record<string, number> = {};
  mLogs.forEach(l => { byDay[l.date] = (byDay[l.date] || 0) + l.mins; });

  return (
    <div>
      <div className="stitle">データ分析</div>
      <div className="ssub">スコア・学習頻度を分析してアドバイスを自動生成</div>

      {lowSubjs.length > 0
        ? <div className="adv">⚠️ {lowSubjs.map(k => SUBJ_MASTER[k]?.label).join("・")} のスコアが50%を下回っています。集中的に基礎を固めましょう。</div>
        : Object.keys(S.scores).length > 0
          ? <div className="adv good">✅ 記録されたスコアはすべて50%以上です。この調子で積み上げましょう！</div>
          : null}

      <div className="g2">
        {/* Subject analysis */}
        <div className="card">
          <div className="ct">📊 科目別 現在地</div>
          <div className="cs">記録スコアによる評価</div>
          {getSubjs().filter(k => getLatest(S.scores, k) != null).length === 0
            ? <div style={{ color: "var(--t3)", fontSize: 12 }}>スコアを記録すると分析が表示されます</div>
            : getSubjs().filter(k => getLatest(S.scores, k) != null).map(key => {
              const m = SUBJ_MASTER[key]; if (!m) return null;
              const v = getLatest(S.scores, key)!;
              const pct = getPct(S.scores, key)!;
              const all = getAll(S.scores, key);
              const prev = all.length > 1 ? all[all.length - 2].val : null;
              const diff = prev != null ? v - prev : null;
              const label = pct >= 80 ? "✅ 優秀" : pct >= 65 ? "🟡 標準" : pct >= 50 ? "🟠 要注意" : "🔴 要強化";
              const bc = pct >= 80 ? "g" : pct >= 65 ? "y" : "o";
              return (
                <div key={key} className="sr">
                  <span style={{ flex: 1, fontSize: 11 }}>{m.label}</span>
                  <div className="bbg" style={{ flex: 1, height: 4, margin: "0 8px" }}><div className={`bb ${bc}`} style={{ width: `${pct}%` }} /></div>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{v}/{m.max}</span>
                  <span style={{ fontSize: 10, minWidth: 30, textAlign: "right", color: diff != null ? diff >= 0 ? "var(--gr)" : "var(--re)" : "var(--t3)" }}>
                    {diff != null ? (diff >= 0 ? "+" : "") + diff : ""}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--t3)", minWidth: 56, textAlign: "right" }}>{label}</span>
                </div>
              );
            })}
        </div>

        {/* Goal analysis */}
        <div className="card">
          <div className="ct">🎯 目標達成度</div>
          <div className="cs">設定目標に対する現在位置</div>
          {Object.entries(S.goals).filter(([k]) => getLatest(S.scores, k) != null).length === 0
            ? <div style={{ color: "var(--t3)", fontSize: 12 }}>目標スコアを設定するかスコアを記録してください</div>
            : Object.entries(S.goals).filter(([k]) => getLatest(S.scores, k) != null).map(([key, goal]) => {
              const m = SUBJ_MASTER[key]; if (!m) return null;
              const latest = getLatest(S.scores, key)!;
              const pct = clamp(latest / goal * 100);
              const ok = latest >= goal;
              return (
                <div key={key} className="sr" style={{ padding: "7px 0" }}>
                  <span style={{ flex: 1, fontSize: 11 }}>{m.label}</span>
                  <div className="bbg" style={{ flex: 1, height: 3, margin: "0 8px" }}><div className={`bb ${ok ? "g" : "o"}`} style={{ width: `${pct}%` }} /></div>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: ok ? "var(--gr)" : "var(--t2)" }}>{latest}/{goal}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="g2" style={{ marginTop: 14 }}>
        {/* Time analysis */}
        <div className="card">
          <div className="ct">⏱️ 学習時間分析</div>
          <div className="cs">科目別学習時間の割合</div>
          {!S.logs.length
            ? <div style={{ color: "var(--t3)", fontSize: 12 }}>学習ログを記録すると分析が表示されます</div>
            : <>
              <div style={{ marginBottom: 8, fontSize: 11, color: "var(--t2)" }}>総学習時間: <span style={{ color: "var(--gr)", fontFamily: "'DM Mono',monospace" }}>{(total / 60).toFixed(1)}時間</span></div>
              {Object.entries(bySubj).sort((a, b) => b[1] - a[1]).map(([s, m]) => (
                <div key={s} className="sr" style={{ padding: "6px 0" }}>
                  <span style={{ flex: 1 }}>{s}</span>
                  <div className="bbg" style={{ flex: 1, height: 3, margin: "0 8px" }}><div className="bb g" style={{ width: `${total > 0 ? m / total * 100 : 0}%` }} /></div>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--t2)" }}>{(m / 60).toFixed(1)}h</span>
                </div>
              ))}
            </>}
        </div>

        {/* Freq */}
        <div className="card">
          <div className="ct">📅 今月の学習頻度</div>
          <div className="cs">日別の学習記録</div>
          {!mLogs.length
            ? <div style={{ color: "var(--t3)", fontSize: 12 }}>今月の学習記録がありません</div>
            : Object.entries(byDay).sort().map(([d, m]) => {
              const pct = clamp(m / 240 * 100);
              const dow = new Date(d).getDay();
              return (
                <div key={d} className="sr" style={{ padding: "5px 0" }}>
                  <span className="ldx">{d.slice(5)} ({DAYS_JA[dow]})</span>
                  <div className="bbg" style={{ flex: 1, height: 4, margin: "0 8px" }}><div className={`bb ${m >= 120 ? "g" : m >= 60 ? "y" : "o"}`} style={{ width: `${pct}%` }} /></div>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--t2)" }}>{m}分</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// WEAK TAB
// ════════════════════════════════════════
function WeakTab({ S, update }: { S: AppState; update: any }) {
  const [weakInp, setWeakInp] = useState("");
  const wm = S.ai.weakMap || {};
  const entries = Object.entries(wm).sort((a, b) => b[1] - a[1]);

  const PLANS: Record<string, string> = {
    "英語リーディング": "→ パスナビで解説確認。Flipsで単語を毎日10語",
    "英語リスニング": "→ NHK語学でリスニング毎日5分。繰り返し聴く",
    "数学IA": "→ 教科書例題を1問/日。Khan Academyで基礎動画",
    "数学IIB": "→ 公式の暗記から。東進DB数学過去問で演習",
    "物理": "→ 公式の導出から理解。東進DB物理過去問で演習",
    "化学": "→ 反応式の暗記。パスナビ化学で解説確認",
    "生物": "→ 用語整理から。パスナビ生物で解説付き演習",
    "歴史総合・日本史探究": "→ 年号を流れで覚える。東進DB日本史で演習",
    "歴史総合・世界史探究": "→ 地図と合わせて学習。パスナビ世界史で解説確認",
    "地理総合・地理探究": "→ 統計・地図問題に慣れる。東進DB地理で演習",
    "国語": "→ 現代文は根拠を探す練習。古文単語300語を優先",
  };

  const addWeak = () => {
    if (!weakInp.trim()) return;
    update((prev: AppState) => ({
      ...prev,
      weakNotes: [{ text: weakInp.trim(), date: todayStr() }, ...prev.weakNotes],
    }));
    setWeakInp("");
  };
  const removeWeak = (i: number) => {
    update((prev: AppState) => ({ ...prev, weakNotes: prev.weakNotes.filter((_, idx) => idx !== i) }));
  };

  const allWeak = [...S.weakNotes.map(w => w.text), ...entries.slice(0, 3).map(([s]) => s)];

  return (
    <div>
      <div className="stitle">弱点管理</div>
      <div className="ssub">AI問題の正誤・手動入力から弱点を管理します</div>

      <div className="g2">
        <div className="card">
          <div className="ct">⚠️ 弱点科目ランキング</div>
          <div className="cs">AI問題の不正解回数が多い順</div>
          {!entries.length
            ? <div style={{ color: "var(--t3)", fontSize: 12 }}>AI問題を解くと自動集計されます</div>
            : entries.slice(0, 8).map(([s, c], i) => (
              <div key={s} className="wi">
                <div className={`wd ${i === 0 ? "dr" : i <= 2 ? "dy" : "dg"}`} />
                <div style={{ flex: 1 }}>{SUBJ_MASTER[s]?.label || s}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--t2)" }}>不正解 {c}回</div>
              </div>
            ))}
        </div>

        <div className="card">
          <div className="ct">📝 弱点メモ（手動）</div>
          <div className="cs">自分で弱点を追加・管理</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input type="text" value={weakInp} onChange={e => setWeakInp(e.target.value)} placeholder="例: 英語の仮定法" style={{ flex: 1 }} />
            <button className="btn btn-g" onClick={addWeak}>追加</button>
          </div>
          {!S.weakNotes.length
            ? <div style={{ color: "var(--t3)", fontSize: 12 }}>まだ弱点が登録されていません</div>
            : S.weakNotes.map((w, i) => (
              <div key={i} className="wi">
                <div className="wd dy" />
                <div style={{ flex: 1 }}>{w.text}</div>
                <div className="ldx">{w.date}</div>
                <button onClick={() => removeWeak(i)} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 11, padding: "0 4px" }}>✕</button>
              </div>
            ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="ct">🔧 弱点克服プラン</div>
        <div className="cs">登録された弱点に対する対策</div>
        {!allWeak.length
          ? <div style={{ color: "var(--t3)", fontSize: 12 }}>弱点を登録すると対策プランが自動生成されます</div>
          : allWeak.slice(0, 5).map((w, i) => {
            const plan = PLANS[w] || `→ AI問題タブで「${w}」を選んで集中演習してください`;
            return (
              <div key={i} style={{ padding: "9px 0", borderBottom: "1px solid var(--b1)", fontSize: 12 }}>
                <strong>{w}</strong><br />
                <span style={{ color: "var(--t2)" }}>{plan}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// PLAN TAB
// ════════════════════════════════════════
function PlanTab({ logs }: { logs: LogEntry[] }) {
  const [activeDayType, setActiveDayType] = useState<"club" | "noclub">("club");

  const dailyClub = [
    { time: "〜部活前", act: "Flips起動（5分）英単語チェック" },
    { time: "部活中（移動）", act: "リスニング音声を聴き流し" },
    { time: "帰宅後", act: "休憩・食事を最優先" },
    { time: "21:00〜", act: "余裕があれば問題1〜2問のみ" },
    { time: "寝る前（5分）", act: "暗記系の復習・翌日の準備" },
  ];
  const dailyNoClub = [
    { time: "午前中（〜12時）", act: "数学 or 理科 集中演習（60〜90分）" },
    { time: "昼食・休憩", act: "Flips単語チェック（10分）" },
    { time: "午後（13〜15時）", act: "英語 長文読解 or 文法（60分）" },
    { time: "15〜17時", act: "苦手科目の問題集（60分）" },
    { time: "夕食・休憩", act: "しっかり休む（脳を回復）" },
    { time: "20〜22時", act: "今日の復習 + 明日の準備（60分）" },
  ];

  const studyTimeSummary = [
    { phase: "Phase 1（部活期間）", club: "30〜60分/日", noClub: "3〜4時間/日", weekTotal: "10〜20時間" },
    { phase: "Phase 2（夏休み）",   club: "—",           noClub: "5〜6時間/日", weekTotal: "35〜42時間" },
    { phase: "Phase 3（秋）",       club: "—",           noClub: "4〜5時間/日", weekTotal: "28〜35時間" },
    { phase: "Phase 4（直前）",     club: "—",           noClub: "6〜8時間/日", weekTotal: "42〜56時間" },
  ];

  const monthly = [
    "Flipsで英単語100語以上をマスター",
    "数ⅠAの基礎問題集を最低20問解く",
    "AI問題タブで30問以上解く",
    "学習記録を週5日以上つける",
    "模試の目標スコアを設定タブに入力する",
  ];

  // 実績集計
  const ym = monthStr();
  const thisMonthMins = logs.filter(l => l.date.startsWith(ym)).reduce((a, l) => a + l.mins, 0);
  const totalMins = logs.reduce((a, l) => a + l.mins, 0);
  const bySubj: Record<string, number> = {};
  logs.forEach(l => { bySubj[l.subject] = (bySubj[l.subject] || 0) + l.mins; });
  const sortedSubj = Object.entries(bySubj).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="stitle">学習計画</div>
      <div className="ssub">フェーズ別の総学習時間目標と実績・1日のスケジュール</div>

      {/* 実績合計 */}
      <div className="g2" style={{ marginBottom: 14 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="ct">📊 今月の実績合計</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 32, color: "var(--gr)", margin: "8px 0 4px" }}>
            {(thisMonthMins / 60).toFixed(1)}<span style={{ fontSize: 14, color: "var(--t2)", marginLeft: 4 }}>時間</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 12 }}>
            累計 {(totalMins / 60).toFixed(1)}時間 / Phase 1目標: 週10〜20時間
          </div>
          <div className="bbg" style={{ height: 5, marginBottom: 12 }}>
            <div className="bb g" style={{ width: `${clamp(thisMonthMins / (20*4*60) * 100)}%` }} />
          </div>
          {sortedSubj.slice(0, 5).map(([s, m]) => (
            <div key={s} className="sr" style={{ padding: "5px 0" }}>
              <span style={{ flex: 1, fontSize: 11 }}>{s}</span>
              <div className="bbg" style={{ flex: 1, height: 3, margin: "0 8px" }}>
                <div className="bb g" style={{ width: `${totalMins > 0 ? clamp(m / totalMins * 100) : 0}%` }} />
              </div>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--t2)" }}>{(m / 60).toFixed(1)}h</span>
            </div>
          ))}
          {!logs.length && <div style={{ color: "var(--t3)", fontSize: 12 }}>スコア記録タブで学習ログを入力すると表示されます</div>}
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="ct">⏱️ フェーズ別 週の目標時間</div>
          <div className="cs">現在はPhase 1 — 習慣化を最優先に</div>
          {studyTimeSummary.map((r, i) => (
            <div key={i} className="sr" style={{
              padding: "8px 0",
              background: i === 0 ? "var(--grd)" : "transparent",
              margin: i === 0 ? "0 -4px" : "0",
              padding: i === 0 ? "8px 4px" : "8px 0",
              borderRadius: i === 0 ? "6px" : "0",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? "var(--gr)" : "var(--t1)" }}>{r.phase}</div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>部活なし {r.noClub}</div>
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: i === 0 ? "var(--gr)" : "var(--t2)", fontWeight: 600 }}>
                {r.weekTotal}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* タイムテーブル切替 */}
      <div className="card">
        <div className="ct">🗓️ 1日のタイムテーブル</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button className={`btn ${activeDayType === "club" ? "btn-g" : "btn-ghost"}`}
            onClick={() => setActiveDayType("club")} style={{ flex: 1 }}>⚽ 部活がある日</button>
          <button className={`btn ${activeDayType === "noclub" ? "btn-g" : "btn-ghost"}`}
            onClick={() => setActiveDayType("noclub")} style={{ flex: 1 }}>📚 部活がない日</button>
        </div>
        {activeDayType === "club" ? (
          <>
            <div className="cs" style={{ marginBottom: 8 }}>疲れを前提に「ゼロにしない」が目標。無理は禁物。</div>
            {dailyClub.map(r => (
              <div key={r.time} className="sr">
                <span style={{ minWidth: 110, fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--t3)" }}>{r.time}</span>
                <span style={{ fontSize: 12 }}>{r.act}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="cs" style={{ marginBottom: 8 }}>部活なし日は3〜4時間が目標。集中とメリハリを意識。</div>
            {dailyNoClub.map(r => (
              <div key={r.time} className="sr">
                <span style={{ minWidth: 110, fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--bl)" }}>{r.time}</span>
                <span style={{ fontSize: 12 }}>{r.act}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 今月の目標 */}
      <div className="card">
        <div className="ct">📊 今月の目標チェック</div>
        <div className="cs">今月達成したい目標リスト（Phase 1）</div>
        {monthly.map(g => (
          <div key={g} className="sr" style={{ padding: "8px 0" }}>
            <span style={{ color: "var(--gr)", marginRight: 8 }}>›</span>
            <span>{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

  const dailyClub = [
    { time: "〜部活前", act: "Flips起動（5分）英単語チェック" },
    { time: "部活中（移動）", act: "リスニング音声を聴き流し" },
    { time: "帰宅後", act: "休憩・食事を最優先" },
    { time: "21:00〜", act: "余裕があれば問題1〜2問のみ" },
    { time: "寝る前（5分）", act: "暗記系の復習・翌日の準備" },
  ];
  const dailyNoClub = [
    { time: "午前中（〜12時）", act: "数学 or 理科 集中演習（60〜90分）" },
    { time: "昼食・休憩", act: "Flips単語チェック（10分）" },
    { time: "午後（13〜15時）", act: "英語 長文読解 or 文法（60分）" },
    { time: "15〜17時", act: "苦手科目の問題集（60分）" },
    { time: "夕食・休憩", act: "しっかり休む（脳を回復）" },
    { time: "20〜22時", act: "今日の復習 + 明日の準備（60分）" },
  ];

  const studyTimeSummary = [
    { phase: "Phase 1（部活期間）", club: "30〜60分/日", noClub: "3〜4時間/日", total: "週計 10〜20時間目標" },
    { phase: "Phase 2（夏休み）", club: "—", noClub: "5〜6時間/日", total: "週計 35〜42時間目標" },
    { phase: "Phase 3（秋）", club: "—", noClub: "4〜5時間/日", total: "週計 28〜35時間目標" },
    { phase: "Phase 4（直前）", club: "—", noClub: "6〜8時間/日", total: "週計 42〜56時間目標" },
  ];

  const monthly = [
    "Flipsで英単語100語以上をマスター",
    "数ⅠAの基礎問題集を最低20問解く",
    "AI問題タブで30問以上解く",
    "学習記録を週5日以上つける",
    "模試の目標スコアを設定タブに入力する",
  ];

  return (
    <div>
      <div className="stitle">学習計画</div>
      <div className="ssub">フェーズ別の総学習時間目標と1日のスケジュール</div>

      {/* 総学習時間 */}
      <div className="card">
        <div className="ct">⏱️ フェーズ別 総学習時間の目安</div>
        <div className="cs">現在はPhase 1（部活期間）— まずは習慣化を最優先に</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--b1)" }}>
                {["フェーズ", "部活あり日", "部活なし日", "週の目標"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "var(--t2)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studyTimeSummary.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--b1)", background: i === 0 ? "var(--grd)" : "transparent" }}>
                  <td style={{ padding: "8px", color: i === 0 ? "var(--gr)" : "var(--t1)", fontWeight: i === 0 ? 700 : 400 }}>{r.phase}</td>
                  <td style={{ padding: "8px", fontFamily: "'DM Mono',monospace", color: "var(--t2)" }}>{r.club}</td>
                  <td style={{ padding: "8px", fontFamily: "'DM Mono',monospace", color: "var(--t2)" }}>{r.noClub}</td>
                  <td style={{ padding: "8px", color: "var(--t2)", fontSize: 11 }}>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* タイムテーブル切替 */}
      <div className="card">
        <div className="ct">🗓️ 1日のタイムテーブル</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button
            className={`btn ${activeDayType === "club" ? "btn-g" : "btn-ghost"}`}
            onClick={() => setActiveDayType("club")}
            style={{ flex: 1 }}
          >⚽ 部活がある日</button>
          <button
            className={`btn ${activeDayType === "noclub" ? "btn-g" : "btn-ghost"}`}
            onClick={() => setActiveDayType("noclub")}
            style={{ flex: 1 }}
          >📚 部活がない日</button>
        </div>
        {activeDayType === "club" ? (
          <>
            <div className="cs" style={{ marginBottom: 8 }}>疲れを前提に「ゼロにしない」が目標。無理は禁物。</div>
            {dailyClub.map(r => (
              <div key={r.time} className="sr">
                <span style={{ minWidth: 110, fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--t3)" }}>{r.time}</span>
                <span style={{ fontSize: 12 }}>{r.act}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="cs" style={{ marginBottom: 8 }}>部活なし日は3〜4時間が目標。集中とメリハリを意識。</div>
            {dailyNoClub.map(r => (
              <div key={r.time} className="sr">
                <span style={{ minWidth: 110, fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--bl)" }}>{r.time}</span>
                <span style={{ fontSize: 12 }}>{r.act}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 今月の目標 */}
      <div className="card">
        <div className="ct">📊 今月の目標</div>
        <div className="cs">今月達成したい目標リスト（Phase 1）</div>
        {monthly.map(g => (
          <div key={g} className="sr" style={{ padding: "8px 0" }}>
            <span style={{ color: "var(--gr)", marginRight: 8 }}>›</span>
            <span>{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// SUBJECT SELECTOR (独立コンポーネント - チェック即時反映)
// ════════════════════════════════════════
function SubjSelector({ selected, onChange }: { selected: string[]; onChange: (keys: string[]) => void }) {
  const groups: Record<string, string[]> = {};
  Object.entries(SUBJ_MASTER).forEach(([key, m]) => {
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(key);
  });

  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    onChange(next);
  };

  const selectAll = () => onChange(Object.keys(SUBJ_MASTER));
  const clearAll = () => onChange([]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }} onClick={selectAll}>全選択</button>
        <button className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }} onClick={clearAll}>全解除</button>
        <span style={{ fontSize: 11, color: "var(--t3)", alignSelf: "center" }}>{selected.length}科目選択中</span>
      </div>
      {Object.entries(groups).map(([grp, keys]) => (
        <div key={grp} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>{grp}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {keys.map(key => {
              const m = SUBJ_MASTER[key];
              const checked = selected.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    border: `1px solid ${checked ? "var(--gr)88" : "var(--b2)"}`,
                    background: checked ? "var(--grd)" : "transparent",
                    color: checked ? "var(--gr)" : "var(--t3)",
                    fontSize: 12,
                    fontFamily: "'Noto Sans JP',sans-serif",
                    cursor: "pointer",
                    transition: "all .12s",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {checked ? "✓ " : ""}{m.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
function SettingsTab({ S, update, getSubjs }: { S: AppState; update: any; getSubjs: () => string[] }) {
  const [school, setSchool] = useState(S.school);
  const [goalInputs, setGoalInputs] = useState<Record<string, string>>({});
  const [localSelected, setLocalSelected] = useState<string[]>(S.selectedSubjs);
  const [saved, setSaved] = useState(false);

  const saveAll = () => {
    update((prev: AppState) => ({ ...prev, school, selectedSubjs: localSelected }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveGoals = () => {
    update((prev: AppState) => {
      const goals = { ...prev.goals };
      getSubjs().forEach(key => {
        const v = goalInputs[key];
        if (v && !isNaN(Number(v))) {
          const max = SUBJ_MASTER[key]?.max || 100;
          const num = parseInt(v);
          if (num >= 0 && num <= max) goals[key] = num;
        }
      });
      return { ...prev, goals };
    });
    setGoalInputs({});
    alert("✅ 目標スコアを保存しました！");
  };

  return (
    <div>
      <div className="stitle">設定</div>
      <div className="ssub">プロフィール・受験科目・目標スコアを設定します。</div>

      <div className="g2">
        <div className="card">
          <div className="ct">👤 プロフィール</div>
          <div className="cs">現在の状況</div>
          {[["学年", "高校3年（4月〜）"], ["部活終了時期", "6月末"], ["現フェーズ", "Phase 1"]].map(([k, v]) => (
            <div key={k} className="sr">
              <span style={{ flex: 1 }}>{k}</span>
              <span style={{ color: "var(--gr)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{v}</span>
            </div>
          ))}
          <div className="sr">
            <span style={{ flex: 1 }}>志望校</span>
            <input type="text" value={school} onChange={e => setSchool(e.target.value)}
              placeholder="例: 琉球大学" style={{ maxWidth: 170, fontSize: 11, padding: "4px 7px" }} />
          </div>
        </div>

        <div className="card">
          <div className="ct">🤖 Google AI API（準備中）</div>
          <div className="cs">Gemini APIキーを入力するとAI機能が拡張されます</div>
          <div style={{ marginBottom: 8 }}>
            <div className="fl">Google AI Studio APIキー</div>
            <input type="password" placeholder="AIzaSy... （Google AI Studioで取得）"
              style={{ fontSize: 11 }} onChange={() => {}} />
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: "var(--bl)", textDecoration: "none" }}>
            → Google AI StudioでAPIキーを取得 ↗
          </a>
          <div style={{ marginTop: 10, padding: 10, background: "var(--s2)", borderRadius: "var(--rsm)", fontSize: 11, color: "var(--t3)" }}>
            ※ 現在はAnthropicのClaude APIで動作中。Gemini APIの統合は今後実装予定。<br/>
            ※ Anthropic APIキーは <code>src/main.tsx</code> またはVercelの環境変数に設定してください。
          </div>
        </div>
      </div>

      {/* 受験科目選択 - ボタン式で即時反映 */}
      <div className="card">
        <div className="ct">📋 受験科目の選択</div>
        <div className="cs">タップで即時選択・解除。緑色ハイライトが選択中です。最後に「保存」してください。</div>
        <SubjSelector selected={localSelected} onChange={setLocalSelected} />
        <button
          className="btn btn-g"
          style={{ width: "100%", marginTop: 14, fontSize: 13, padding: "11px 0" }}
          onClick={saveAll}
        >
          {saved ? "✅ 保存しました！全タブに反映済み" : "💾 設定を保存して全タブに反映"}
        </button>
      </div>

      {/* 目標スコア */}
      <div className="card">
        <div className="ct">🎯 目標スコア設定</div>
        <div className="cs">各科目の目標点を設定すると分析に反映（満点は科目別に自動設定）</div>
        {getSubjs().map(key => {
          const m = SUBJ_MASTER[key]; if (!m) return null;
          return (
            <div key={key} className="sr">
              <span style={{ flex: 1, fontSize: 11 }}>{m.label}</span>
              <input type="text"
                value={goalInputs[key] ?? (S.goals[key] != null ? String(S.goals[key]) : "")}
                onChange={e => setGoalInputs(p => ({ ...p, [key]: e.target.value }))}
                placeholder="—"
                style={{ width: 60, textAlign: "right", padding: "4px 6px", fontSize: 12, fontFamily: "'DM Mono',monospace" }} />
              <span style={{ fontSize: 10, color: "var(--t3)" }}>/{m.max}</span>
            </div>
          );
        })}
        <button className="btn btn-g" style={{ marginTop: 10 }} onClick={saveGoals}>保存</button>
      </div>
    </div>
  );
}
