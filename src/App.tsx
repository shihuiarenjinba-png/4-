import { useState, useRef, createContext, useContext } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar
} from 'recharts';

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════
type UserProfile = {
  name: string; loginId: string; password: string;
  toushinId: string; toushinPw: string; passnavi: string; passnaviPw: string;
};
type MockExam = {
  id: string; examName: string; date: string;
  totalScore: number; maxScore: number; rank: string;
  scores: Record<string, { score: number; maxScore: number; deviation: number }>;
  judgments: Record<string, { school: string; judgment: 'A'|'B'|'C'|'D'|'E' }>;
};

// ═══════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════
type AppCtx = {
  selectedSubjects: Set<string>; setSelectedSubjects: (s: Set<string>) => void;
  user: UserProfile | null; setUser: (u: UserProfile | null) => void;
  mockExams: MockExam[]; setMockExams: (e: MockExam[]) => void;
};
const AppContext = createContext<AppCtx>({
  selectedSubjects: new Set(), setSelectedSubjects: () => {},
  user: null, setUser: () => {},
  mockExams: [], setMockExams: () => {},
});
const useApp = () => useContext(AppContext);

// ═══════════════════════════════════════════════════════
//  STATIC DATA
// ═══════════════════════════════════════════════════════
const dailyProgress = [
  { date: '3/19', studyTime: 120, accuracy: 80 },
  { date: '3/20', studyTime: 150, accuracy: 75 },
  { date: '3/21', studyTime: 90,  accuracy: 83 },
  { date: '3/22', studyTime: 180, accuracy: 75 },
  { date: '3/23', studyTime: 210, accuracy: 87 },
  { date: '3/24', studyTime: 160, accuracy: 80 },
  { date: '3/25', studyTime: 240, accuracy: 83 },
];
const weeklyProgress = [
  { week: '2月第4週', studyTime: 850,  accuracy: 72 },
  { week: '3月第1週', studyTime: 920,  accuracy: 75 },
  { week: '3月第2週', studyTime: 1050, accuracy: 78 },
  { week: '3月第3週', studyTime: 1150, accuracy: 81 },
];
const monthlyProgress = [
  { month: '12月', studyTime: 3200, accuracy: 65 },
  { month: '1月',  studyTime: 3800, accuracy: 68 },
  { month: '2月',  studyTime: 4100, accuracy: 73 },
  { month: '3月',  studyTime: 4500, accuracy: 79 },
];

const weakAreas = [
  { subject: '数学', topic: '微分積分',         errorRate: 45, suggestion: '「基礎問題精講」の微積分の章を復習し、計算ミスを減らす練習をしましょう。',  resourceKey: '数学_微積分',  groupKey: '数学' },
  { subject: '英語', topic: '関係代名詞',        errorRate: 38, suggestion: '「Next Stage」の文法セクションで関係詞の用法を再確認してください。',         resourceKey: '英語_文法',   groupKey: '外国語' },
  { subject: '理科', topic: '物理：力学（剛体）', errorRate: 52, suggestion: 'モーメントのつり合いの式の立て方を「物理のエッセンス」で復習しましょう。', resourceKey: '理科_物理',   groupKey: '理科' },
  { subject: '国語', topic: '古文：助動詞の識別', errorRate: 30, suggestion: '助動詞の接続と意味の表を再度暗記し、識別練習を行ってください。',           resourceKey: '国語_古文',   groupKey: '国語' },
];

const SUBJECTS_TREE: Record<string, string[]> = {
  '外国語':   ['英語（リーディング）','英語（リスニング）','英語（外部試験利用）','ドイツ語','フランス語','中国語','韓国語'],
  '数学':     ['数学Ⅰ','数学Ⅱ','数学Ⅲ','数学Ⅰ・A','数学Ⅱ・B','数学Ⅱ・B・C','数学C','簿記・会計','情報関係基礎'],
  '国語':     ['現代文','古文','漢文','現代文・古文','現代文・古文・漢文'],
  '理科':     ['物理基礎','物理','化学基礎','化学','生物基礎','生物','地学基礎','地学','理科基礎（2科目）'],
  '地理歴史': ['日本史B','世界史B','地理B','日本史探究','世界史探究','地理探究'],
  '公民':     ['倫理','政治・経済','倫理・政治経済','現代社会','公共'],
  '情報':     ['情報Ⅰ'],
  '小論文':   ['小論文'],
  '実技':     ['実技（体育・音楽・美術等）'],
  '面接':     ['個人面接','グループ面接','プレゼン面接'],
};

const SUBJECT_TO_GROUP: Record<string, string> = {};
Object.entries(SUBJECTS_TREE).forEach(([g, ss]) => ss.forEach(s => { SUBJECT_TO_GROUP[s] = g; }));

const SUBJECT_TO_RESOURCE: Record<string, string> = {
  '数学Ⅰ': '数学_全般','数学Ⅱ': '数学_全般','数学Ⅲ': '数学_全般',
  '数学Ⅰ・A': '数学_全般','数学Ⅱ・B': '数学_全般','数学Ⅱ・B・C': '数学_全般',
  '英語（リーディング）': '英語_読解','英語（リスニング）': '英語_全般',
  '現代文': '国語_現代文','古文': '国語_古文','漢文': '国語_全般',
  '現代文・古文': '国語_全般','現代文・古文・漢文': '国語_全般',
  '物理': '理科_物理','物理基礎': '理科_物理',
  '化学': '理科_化学','化学基礎': '理科_化学',
  '生物': '理科_全般','生物基礎': '理科_全般',
  '日本史B': '社会_全般','日本史探究': '社会_全般',
  '世界史B': '社会_全般','世界史探究': '社会_全般',
  '地理B': '社会_全般','地理探究': '社会_全般',
};

const SUBJECT_TO_QBANK: Record<string, string> = {
  '数学Ⅰ': '数学','数学Ⅱ': '数学','数学Ⅲ': '数学',
  '数学Ⅰ・A': '数学','数学Ⅱ・B': '数学','数学Ⅱ・B・C': '数学',
  '英語（リーディング）': '英語','英語（リスニング）': '英語',
  '現代文': '国語','古文': '国語','漢文': '国語',
  '現代文・古文': '国語','現代文・古文・漢文': '国語',
  '物理': '理科','物理基礎': '理科','化学': '理科','化学基礎': '理科',
  '生物': '理科','生物基礎': '理科',
  '日本史B': '社会','日本史探究': '社会','世界史B': '社会',
  '世界史探究': '社会','地理B': '社会','地理探究': '社会',
};

type Resource = { title: string; type: string; desc: string; link: string };
type ResourceMap = Record<string, Resource[]>;

const allResources: ResourceMap = {
  '数学_全般': [
    { title: '青チャート（基礎からの数学）', type: '参考書', desc: '網羅性が高く基礎から応用まで対応。例題を完璧にすることが重要。', link: 'https://www.amazon.co.jp/s?k=%E9%9D%92%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88+%E6%95%B0%E5%AD%A6&i=stripbooks' },
    { title: '基礎問題精講 数学', type: '参考書', desc: '頻出問題が厳選されており短期間での基礎固めに最適。', link: 'https://www.amazon.co.jp/s?k=%E5%9F%BA%E7%A4%8E%E5%95%8F%E9%A1%8C%E7%B2%BE%E8%AC%9B+%E6%95%B0%E5%AD%A6&i=stripbooks' },
    { title: '大学への数学（東京出版）', type: '問題集', desc: '難関大志望者向けの高度な解法や思考力を養う問題が豊富。', link: 'https://www.amazon.co.jp/s?k=%E5%A4%A7%E5%AD%A6%E3%81%B8%E3%81%AE%E6%95%B0%E5%AD%A6+%E6%9D%B1%E4%BA%AC%E5%87%BA%E7%89%88&i=stripbooks' },
  ],
  '数学_微積分': [
    { title: '基礎問題精講 数学Ⅱ・B', type: '参考書', desc: '微分・積分の基礎計算から典型問題まで集中演習できる。計算ミス撲滅に最適。', link: 'https://www.amazon.co.jp/s?k=%E5%9F%BA%E7%A4%8E%E5%95%8F%E9%A1%8C%E7%B2%BE%E8%AC%9B+%E6%95%B0%E5%AD%A62B&i=stripbooks' },
    { title: '微積分基礎の極意（東京出版）', type: '参考書', desc: '難関大の微積分を徹底的に掘り下げる。計算技法と思考の両方を鍛える。', link: 'https://www.amazon.co.jp/s?k=%E5%BE%AE%E7%A9%8D%E5%88%86%E5%9F%BA%E7%A4%8E%E3%81%AE%E6%A5%B5%E6%84%8F&i=stripbooks' },
  ],
  '英語_全般': [
    { title: 'ターゲット1900', type: '参考書', desc: '大学受験の定番単語帳。アプリと併用して効率的に暗記可能。', link: 'https://www.amazon.co.jp/s?k=%E3%82%BF%E3%83%BC%E3%82%B2%E3%83%83%E3%83%881900&i=stripbooks' },
    { title: 'Next Stage（ネクステージ）', type: '参考書', desc: '文法・語法・イディオムを網羅。左ページに問題、右ページに解説の構成。', link: 'https://www.amazon.co.jp/s?k=Next+Stage+%E3%83%8D%E3%82%AF%E3%82%B9%E3%83%86%E3%83%BC%E3%82%B8&i=stripbooks' },
  ],
  '英語_文法': [
    { title: 'Next Stage（ネクステージ）文法編', type: '参考書', desc: '関係詞・接続詞のセクションを集中的に取り組む。1日10問の繰り返しが有効。', link: 'https://www.amazon.co.jp/s?k=Next+Stage+%E3%83%8D%E3%82%AF%E3%82%B9%E3%83%86%E3%83%BC%E3%82%B8&i=stripbooks' },
    { title: 'Vintage（ヴィンテージ）英文法', type: '参考書', desc: '文法・語法・イディオムをまとめて演習。難関大の文法問題にも対応。', link: 'https://www.amazon.co.jp/s?k=Vintage+%E8%8B%B1%E6%96%87%E6%B3%95&i=stripbooks' },
  ],
  '英語_読解': [
    { title: 'やっておきたい英語長文300', type: '参考書', desc: '標準レベルの長文に慣れるための定番書。語数・難易度が段階的。', link: 'https://www.amazon.co.jp/s?k=%E3%82%84%E3%81%A3%E3%81%A6%E3%81%8A%E3%81%8D%E3%81%9F%E3%81%84%E8%8B%B1%E8%AA%9E%E9%95%B7%E6%96%87300&i=stripbooks' },
    { title: 'ポレポレ英文読解プロセス50', type: '参考書', desc: '構文分析を通じて難解な英文をロジカルに読む力がつく。', link: 'https://www.amazon.co.jp/s?k=%E3%83%9D%E3%83%AC%E3%83%9D%E3%83%AC%E8%8B%B1%E6%96%87%E8%AA%AD%E8%A7%A3&i=stripbooks' },
  ],
  '国語_全般': [
    { title: '現代文キーワード読解', type: '参考書', desc: '頻出テーマとキーワードを理解し読解の背景知識を身につける。', link: 'https://www.amazon.co.jp/s?k=%E7%8F%BE%E4%BB%A3%E6%96%87%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89%E8%AA%AD%E8%A7%A3&i=stripbooks' },
    { title: '漢文早覚え速答法', type: '参考書', desc: '句法を効率よく暗記し得点源にするための定番書。', link: 'https://www.amazon.co.jp/s?k=%E6%BC%A2%E6%96%87%E6%97%A9%E8%A6%9A%E3%81%88%E9%80%9F%E7%AD%94%E6%B3%95&i=stripbooks' },
  ],
  '国語_古文': [
    { title: '古文上達 基礎編（Z会）', type: '参考書', desc: '助動詞の識別問題を段階的に演習。接続・活用・意味を体系的に確認できる。', link: 'https://www.amazon.co.jp/s?k=%E5%8F%A4%E6%96%87%E4%B8%8A%E9%81%94+%E5%9F%BA%E7%A4%8E%E7%B7%A8+Z%E4%BC%9A&i=stripbooks' },
    { title: 'ステップアップノート30 古典文法', type: '参考書', desc: '助動詞識別を含む文法問題を繰り返し演習できる穴埋め形式の問題集。', link: 'https://www.amazon.co.jp/s?k=%E3%82%B9%E3%83%86%E3%83%83%E3%83%97%E3%82%A2%E3%83%83%E3%83%97%E3%83%8E%E3%83%BC%E3%83%8830+%E5%8F%A4%E5%85%B8%E6%96%87%E6%B3%95&i=stripbooks' },
  ],
  '国語_現代文': [
    { title: '現代文読解力の開発講座（駿台）', type: '参考書', desc: '文章の論理構造を分析する力を養う。難関大現代文の根本的解法を習得。', link: 'https://www.amazon.co.jp/s?k=%E7%8F%BE%E4%BB%A3%E6%96%87%E8%AA%AD%E8%A7%A3%E5%8A%9B%E3%81%AE%E9%96%8B%E7%99%BA%E8%AC%9B%E5%BA%A7&i=stripbooks' },
    { title: '現代文キーワード読解', type: '参考書', desc: 'テーマ読解と語彙力を同時に強化。評論文頻出テーマを網羅。', link: 'https://www.amazon.co.jp/s?k=%E7%8F%BE%E4%BB%A3%E6%96%87%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89%E8%AA%AD%E8%A7%A3&i=stripbooks' },
  ],
  '理科_全般': [
    { title: '物理のエッセンス', type: '参考書', desc: '物理の考え方や解法の基本を直感的に理解できる名著。', link: 'https://www.amazon.co.jp/s?k=%E7%89%A9%E7%90%86%E3%81%AE%E3%82%A8%E3%83%83%E3%82%BB%E3%83%B3%E3%82%B9&i=stripbooks' },
    { title: '宇宙一わかりやすい高校化学', type: '参考書', desc: 'イラストが豊富で初学者でも化学のイメージが掴みやすい。', link: 'https://www.amazon.co.jp/s?k=%E5%AE%87%E5%AE%99%E4%B8%80%E3%82%8F%E3%81%8B%E3%82%8A%E3%82%84%E3%81%99%E3%81%84%E9%AB%98%E6%A0%A1%E5%8C%96%E5%AD%A6&i=stripbooks' },
  ],
  '理科_物理': [
    { title: '物理のエッセンス（力学・波動）', type: '参考書', desc: '剛体の力学・モーメントのつり合いは本書の力学編で徹底復習。図解が豊富。', link: 'https://www.amazon.co.jp/s?k=%E7%89%A9%E7%90%86%E3%81%AE%E3%82%A8%E3%83%83%E3%82%BB%E3%83%B3%E3%82%B9+%E5%8A%9B%E5%AD%A6&i=stripbooks' },
    { title: '良問の風 物理', type: '参考書', desc: '力学の応用問題を中心とした演習書。剛体・回転運動のパターンを習得できる。', link: 'https://www.amazon.co.jp/s?k=%E8%89%AF%E5%95%8F%E3%81%AE%E9%A2%A8+%E7%89%A9%E7%90%86&i=stripbooks' },
    { title: '名問の森 物理（力学・熱・波動）', type: '参考書', desc: '難関大の力学問題に特化。剛体・モーメント問題で高得点を狙う。', link: 'https://www.amazon.co.jp/s?k=%E5%90%8D%E5%95%8F%E3%81%AE%E6%A3%AE+%E7%89%A9%E7%90%86&i=stripbooks' },
  ],
  '理科_化学': [
    { title: '化学重要問題集（数研出版）', type: '参考書', desc: '化学の標準〜難問を網羅。各分野の頻出問題を効率的に演習できる。', link: 'https://www.amazon.co.jp/s?k=%E5%8C%96%E5%AD%A6%E9%87%8D%E8%A6%81%E5%95%8F%E9%A1%8C%E9%9B%86+%E6%95%B0%E7%A0%94%E5%87%BA%E7%89%88&i=stripbooks' },
    { title: '鎌田の有機化学の講義', type: '参考書', desc: '有機化学の仕組みを丁寧に解説。反応機構の理解を深める。', link: 'https://www.amazon.co.jp/s?k=%E9%8E%8C%E7%94%B0%E3%81%AE%E6%9C%89%E6%A9%9F%E5%8C%96%E5%AD%A6%E3%81%AE%E8%AC%9B%E7%BE%A9&i=stripbooks' },
  ],
  '社会_全般': [
    { title: '詳説日本史B（山川出版社）', type: '参考書', desc: '論述対策の基本となる一冊。辞書的に使うのが王道。', link: 'https://www.amazon.co.jp/s?k=%E8%A9%B3%E8%AA%AC%E6%97%A5%E6%9C%AC%E5%8F%B2B+%E5%B1%B1%E5%B7%9D&i=stripbooks' },
    { title: '時代と流れで覚える世界史B', type: '参考書', desc: '歴史の大きな流れを掴むのに最適な見開き構成。', link: 'https://www.amazon.co.jp/s?k=%E6%99%82%E4%BB%A3%E3%81%A8%E6%B5%81%E3%82%8C%E3%81%A7%E8%A6%9A%E3%81%88%E3%82%8B%E4%B8%96%E7%95%8C%E5%8F%B2B&i=stripbooks' },
    { title: '地理Bの点数が面白いほどとれる本', type: '参考書', desc: '地理の系統的な理解とデータ読み取りのコツを解説。', link: 'https://www.amazon.co.jp/s?k=%E5%9C%B0%E7%90%86B%E3%81%AE%E7%82%B9%E6%95%B0%E3%81%8C%E9%9D%A2%E7%99%BD%E3%81%84%E3%81%BB%E3%81%A9%E3%81%A8%E3%82%8C%E3%82%8B%E6%9C%AC&i=stripbooks' },
  ],
};

type QBank = Record<string, { id: string; difficulty: string; question: string; answer: string; explanation: string }[]>;
const aiQuestions: QBank = {
  数学: [
    { id: 'm1', difficulty: '標準', question: '関数 f(x) = x³ − 3x² + 2 の極値を求めよ。', answer: '極大値 2（x=0）、極小値 −2（x=2）', explanation: 'f′(x) = 3x² − 6x = 3x(x − 2)。f′(x)=0 は x=0, 2。増減表より x=0 で極大値 2、x=2 で極小値 −2。' },
    { id: 'm2', difficulty: 'やや難', question: '定積分 ∫₀¹ x·eˣ dx を求めよ。', answer: '1', explanation: '部分積分法：[x·eˣ]₀¹ − ∫₀¹ eˣ dx = e − [eˣ]₀¹ = e − (e−1) = 1。' },
    { id: 'm3', difficulty: '標準', question: '円 x² + y² = 5 と直線 y = 2x + k が接するとき、定数 k の値を求めよ。', answer: 'k = ±5', explanation: '中心 (0,0) と直線 2x−y+k=0 の距離が半径 √5 に等しい。|k|/√5 = √5 より |k|=5。' },
    { id: 'm4', difficulty: '難', question: '数列 {aₙ} が a₁=1、aₙ₊₁ = 2aₙ + 3 を満たすとき、一般項 aₙ を求めよ。', answer: 'aₙ = 2ⁿ⁺¹ − 3', explanation: 'aₙ₊₁+3 = 2(aₙ+3) と変形。{aₙ+3} は初項 4、公比 2 の等比数列。aₙ+3 = 2ⁿ⁺¹ より aₙ = 2ⁿ⁺¹ − 3。' },
    { id: 'm5', difficulty: '標準', question: 'サイコロを3回投げるとき、出る目の和が10になる確率を求めよ。', answer: '1/8', explanation: '和が10になる組合せは27通り。確率 = 27/216 = 1/8。' },
  ],
  英語: [
    { id: 'e1', difficulty: '標準', question: '次の日本語を英語に訳せ。\n「彼がその試験に合格したという知らせに、私たちは皆驚いた。」', answer: 'The news that he had passed the exam surprised us all.', explanation: '「〜という知らせ」は同格の that を用いて the news that … と表現。時制の一致で had passed（過去完了）を使う。' },
    { id: 'e2', difficulty: 'やや難', question: '空所に入る適切な語を選べ。\nHe is the last person (　) a lie.\n① telling　② to tell　③ tells　④ told', answer: '② to tell', explanation: '「the last person to do」で「最も〜しそうにない人」という定型表現。' },
    { id: 'e3', difficulty: '標準', question: '仮定法を用いて書き換えよ。\nAs I don\'t have enough money, I can\'t buy the car.', answer: 'If I had enough money, I could buy the car.', explanation: '現在の事実に反する仮定 → 仮定法過去（If S 過去形, S could 原形）。' },
    { id: 'e4', difficulty: '難', question: '誤りを指摘・訂正せよ。\n「Hardly he had arrived home when it began to rain.」', answer: 'he had arrived → had he arrived（倒置）', explanation: '否定副詞 Hardly が文頭 → 後ろは疑問文の語順（倒置）。「Hardly had S Vp.p. when…」の構文。' },
    { id: 'e5', difficulty: '標準', question: 'アクセントが他と異なるものを選べ。\n① e-con-o-my　② de-moc-ra-cy　③ pho-tog-ra-phy　④ pol-i-ti-cian', answer: '④ pol-i-ti-cian', explanation: '①②③は第2音節、④ politician は第3音節（-ti-）にアクセント。' },
  ],
  国語: [
    { id: 'j1', difficulty: '標準', question: '【古文】次の「る」の意味を答えよ。\n「（源氏が）都へ下らる。」', answer: '尊敬', explanation: '主語が高貴な人物（源氏）で自発・可能・受身の文脈でないため「尊敬（〜なさる）」。' },
    { id: 'j2', difficulty: 'やや難', question: '【漢文】「不者」の読みと意味を答えよ。', answer: '読み：しからずんば　意味：そうしなければ', explanation: '仮定条件の否定を表す重要句法。「もしそうでなければ」と訳す。' },
    { id: 'j3', difficulty: '標準', question: '【現代文】「パラダイムシフト」の意味を簡潔に説明せよ。', answer: 'ある時代・分野で当然とされた認識や価値観が劇的に転換すること。', explanation: '評論文で頻出のカタカナ語。科学史家トーマス・クーンが提唱した概念。' },
    { id: 'j4', difficulty: '難', question: '【古文】「いとほし」の現代語訳として最も適切なものを選べ。\n①かわいらしい　②気の毒だ　③恐ろしい　④素晴らしい', answer: '②気の毒だ', explanation: '「いとほし」の原義は「気の毒だ・かわいそうだ」。受験古文ではまず②を疑う。' },
    { id: 'j5', difficulty: '標準', question: '【現代文】「演繹（えんえき）」の対義語を漢字2文字で答えよ。', answer: '帰納（きのう）', explanation: '演繹：普遍 → 個別。帰納：個別 → 普遍。' },
  ],
  理科: [
    { id: 's1', difficulty: '標準', question: '【物理】質量 m の物体が高さ h から自由落下。地面衝突直前の速さ v を求めよ。\n（重力加速度 g、空気抵抗なし）', answer: 'v = √(2gh)', explanation: '力学的エネルギー保存則 mgh = ½mv² より v = √(2gh)。' },
    { id: 's2', difficulty: 'やや難', question: '【化学】0.10 mol/L の酢酸水溶液の pH を求めよ。\n（Ka = 2.7×10⁻⁵ mol/L、log₁₀3 = 0.48、電離度 ≪ 1）', answer: 'pH ≒ 2.78', explanation: '[H⁺] = √(c·Ka) ≒ 1.64×10⁻³。pH = −log₁₀(1.64×10⁻³) ≒ 2.78。' },
    { id: 's3', difficulty: '標準', question: '【生物】DNAを構成する4種類の塩基を答えよ。', answer: 'アデニン（A）・チミン（T）・グアニン（G）・シトシン（C）', explanation: 'RNAではチミン(T)のかわりにウラシル(U)が入る。' },
    { id: 's4', difficulty: '難', question: '【物理】ヤングの干渉実験。波長 λ、スリット間隔 d、距離 L のとき隣り合う明線の間隔 Δx は？', answer: 'Δx = Lλ / d', explanation: '明線の位置 x = mLλ/d（m は整数）。隣り合う間隔 Δx = Lλ/d。' },
    { id: 's5', difficulty: '標準', question: '【化学】アルカリ金属を原子番号の小さい順に3つ答えよ。', answer: 'リチウム(Li) → ナトリウム(Na) → カリウム(K)', explanation: '第1族元素のうち水素を除いたもの。Li, Na, K, Rb, Cs, Fr の順。' },
  ],
  社会: [
    { id: 'h1', difficulty: '標準', question: '【日本史】1192年に源頼朝が任命された役職名を答えよ。', answer: '征夷大将軍', explanation: '後白河法皇の死後に任命され、名実ともに鎌倉幕府が成立（諸説あり）。' },
    { id: 'h2', difficulty: 'やや難', question: '【世界史】1555年、神聖ローマ帝国でルター派が公認された和議の名称を答えよ。', answer: 'アウクスブルクの宗教和議', explanation: '諸侯にカトリックかルター派かの選択権が与えられたが、個人の信仰の自由やカルヴァン派は認められなかった。' },
    { id: 'h3', difficulty: '標準', question: '【地理】赤道付近で年中降水量が多い気候帯をケッペン区分で何というか。', answer: '熱帯雨林気候（Af）', explanation: '赤道低圧帯の影響を一年中受けるため高温多雨となる。' },
    { id: 'h4', difficulty: '難', question: '【日本史】天保の改革で株仲間の解散を命じた老中の名前を答えよ。', answer: '水野忠邦', explanation: '物価下落を狙った株仲間解散令だったが、流通が混乱し失敗に終わった。' },
    { id: 'h5', difficulty: '標準', question: '【世界史】フランス革命期に「人権宣言」の起草に中心的な役割を果たした人物は誰か。', answer: 'ラファイエット', explanation: '自由主義貴族の代表格で、アメリカ独立戦争にも参加。国民軍司令官としても活躍。' },
  ],
};

type FileItem = { id: string; name: string; subject: string; type: string; date: string; size: string; content: string };
const initialFiles: FileItem[] = [
  { id: 'f1', name: '2023年度 東大数学 第1問 解答メモ', subject: '数学', type: 'メモ', date: '2024-03-20', size: '12KB', content: '【問題概要】f(x)=x³−3x²+2の極値を求める問題\n【解法】f′(x)=3x²−6x=3x(x−2)\nx=0で極大値2、x=2で極小値−2\n【ミスポイント】増減表の符号の向きに注意' },
  { id: 'f2', name: '英語長文 要約ノート（共通テスト対策）', subject: '英語', type: 'ノート', date: '2024-03-22', size: '28KB', content: '【長文テーマ】AI技術と社会変容\n【要約】第1段落：AIの急速な普及\n第2段落：雇用への影響\n第3段落：倫理的問題\n【重要単語】unprecedented, automation, transparency' },
  { id: 'f3', name: '物理 力学まとめシート', subject: '理科', type: 'まとめ', date: '2024-03-23', size: '18KB', content: '■等加速度運動の公式\nv = v₀ + at\nx = v₀t + ½at²\nv² = v₀² + 2ax\n■剛体のモーメント\nN = Fr\n■エネルギー保存則\nmgh = ½mv²' },
];

const SUBJECT_COLORS: Record<string, string> = {
  '数学': '#3b82f6','英語': '#10b981','国語': '#f59e0b',
  '理科': '#8b5cf6','社会': '#ef4444','情報': '#06b6d4','全科目': '#6b7280',
};
const DIFF_COLORS: Record<string, string> = { '標準': '#10b981','やや難': '#f59e0b','難': '#ef4444' };
const JUDGE_COLORS: Record<string, string> = { 'A':'#10b981','B':'#3b82f6','C':'#f59e0b','D':'#f97316','E':'#ef4444' };
const sc = (s: string) => SUBJECT_COLORS[s] ?? '#6b7280';
const dc = (d: string) => DIFF_COLORS[d] ?? '#6b7280';

const EXAM_SUBJECTS = ['英語（リーディング）','英語（リスニング）','数学Ⅰ・A','数学Ⅱ・B','国語','物理','化学','生物','日本史B','世界史B','地理B'];

// ═══════════════════════════════════════════════════════
//  LOGIN SCREEN
// ═══════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: (u: UserProfile) => void }) {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [id, setId]     = useState('');
  const [pw, setPw]     = useState('');
  const [name, setName] = useState('');
  const [err, setErr]   = useState('');

  const DEMO: UserProfile = { name: 'テストユーザー', loginId: 'demo', password: 'demo123', toushinId: '', toushinPw: '', passnavi: '', passnaviPw: '' };

  const doLogin = () => {
    if (id === DEMO.loginId && pw === DEMO.password) { onLogin(DEMO); return; }
    setErr('IDまたはパスワードが違います');
  };
  const doRegister = () => {
    if (!name || !id || !pw) { setErr('全項目を入力してください'); return; }
    onLogin({ name, loginId: id, password: pw, toushinId: '', toushinPw: '', passnavi: '', passnaviPw: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-2xl font-black text-white tracking-tight">大学受験対策ポータル</h1>
          <p className="text-blue-300 text-sm mt-1">あなただけの受験管理システム</p>
        </div>
        <div className="rounded-2xl p-6 shadow-2xl border border-white/20" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {(['login','register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(''); }}
                className="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
                style={{ background: mode === m ? 'white' : 'transparent', color: mode === m ? '#1e3a8a' : '#93c5fd' }}>
                {m === 'login' ? 'ログイン' : '新規登録'}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {mode === 'register' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="お名前"
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 placeholder-blue-300"
                style={{ background: 'rgba(255,255,255,0.15)' }} />
            )}
            <input value={id} onChange={e => setId(e.target.value)} placeholder="ログインID"
              className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 placeholder-blue-300"
              style={{ background: 'rgba(255,255,255,0.15)' }} />
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="パスワード"
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? doLogin() : doRegister())}
              className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 placeholder-blue-300"
              style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
          {err && <p className="text-red-300 text-xs mt-2 text-center">{err}</p>}
          <button onClick={mode === 'login' ? doLogin : doRegister}
            className="w-full mt-4 py-3 rounded-xl font-black text-white text-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            {mode === 'login' ? 'ログイン →' : 'アカウント作成 →'}
          </button>
          {mode === 'login' && (
            <p className="text-center text-blue-300 text-xs mt-3">
              デモ: ID <span className="font-bold text-white">demo</span> / PW <span className="font-bold text-white">demo123</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  PROGRESS TAB
// ═══════════════════════════════════════════════════════
function ProgressTab() {
  const { selectedSubjects, mockExams } = useApp();
  const [range, setRange] = useState<'daily'|'weekly'|'monthly'>('daily');
  const selectedGroups = new Set([...selectedSubjects].map(s => SUBJECT_TO_GROUP[s]).filter(Boolean));

  const radarSource = [
    { subject: '数学Ⅰ・A', accuracy: 75, group: '数学' },
    { subject: '数学Ⅱ・B', accuracy: 68, group: '数学' },
    { subject: '英語(読解)', accuracy: 82, group: '外国語' },
    { subject: '英語(文法)', accuracy: 71, group: '外国語' },
    { subject: '現代文',    accuracy: 78, group: '国語' },
    { subject: '古文',      accuracy: 62, group: '国語' },
    { subject: '物理',      accuracy: 58, group: '理科' },
    { subject: '化学',      accuracy: 73, group: '理科' },
    { subject: '日本史B',   accuracy: 80, group: '地理歴史' },
    { subject: '世界史B',   accuracy: 74, group: '地理歴史' },
  ].filter(d => selectedGroups.size === 0 || selectedGroups.has(d.group));

  const filteredWeak = weakAreas.filter(w => selectedGroups.size === 0 || selectedGroups.has(w.groupKey));
  const chartData = range === 'daily' ? dailyProgress : range === 'weekly' ? weeklyProgress : monthlyProgress;
  const xKey = range === 'daily' ? 'date' : range === 'weekly' ? 'week' : 'month';
  const latestExam = mockExams[mockExams.length - 1];
  const examBarData = latestExam ? Object.entries(latestExam.scores).filter(([,v])=>v.score>0).map(([s,v])=>({ subject: s, score: v.score, max: v.maxScore, dev: v.deviation })) : [];

  return (
    <div className="space-y-5">
      {selectedSubjects.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
          <span>📋</span><span>受験科目（{selectedSubjects.size}科目）に絞り込んで表示中</span>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '今週の学習時間', value: '19.2h', sub: '先週比 +2.4h', color: '#3b82f6' },
          { label: '今週の正答率',   value: '81%',   sub: '先週比 +3%',   color: '#10b981' },
          { label: '累計問題数',     value: '1,247問', sub: '今月 +287問', color: '#8b5cf6' },
          { label: '連続学習日数',   value: '14日',  sub: '最長記録 21日', color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className="text-xl font-black" style={{ color: c.color }}>{c.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700">学習時間 & 正答率の推移</h3>
          <div className="flex gap-1">
            {(['daily','weekly','monthly'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="px-3 py-1 text-xs rounded-full transition-all"
                style={{ background: range===r?'#2563eb':'#f3f4f6', color: range===r?'white':'#6b7280' }}>
                {r==='daily'?'日別':r==='weekly'?'週別':'月別'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
            <YAxis yAxisId="l" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="r" orientation="right" domain={[50,100]} tick={{ fontSize: 10 }} />
            <Tooltip /><Legend />
            <Line yAxisId="l" type="monotone" dataKey="studyTime" stroke="#3b82f6" name="学習時間(分)" strokeWidth={2} dot={{ r: 3 }} />
            <Line yAxisId="r" type="monotone" dataKey="accuracy"  stroke="#10b981" name="正答率(%)"   strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {radarSource.length > 2 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">科目別 正答率レーダー</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarSource}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <Radar name="正答率" dataKey="accuracy" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {latestExam && examBarData.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-1">📝 直近の模試スコア（{latestExam.examName}）</h3>
          <p className="text-xs text-gray-400 mb-4">{latestExam.date}　総合 {latestExam.totalScore}/{latestExam.maxScore}点　{latestExam.rank}</p>
          <ResponsiveContainer width="100%" height={Math.max(160, examBarData.length * 30)}>
            <BarChart data={examBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(v, n) => [`${v}`, n==='score'?'得点':'偏差値']} />
              <Bar dataKey="score" fill="#3b82f6" radius={[0,4,4,0]} name="得点" />
              <Bar dataKey="dev"   fill="#8b5cf6" radius={[0,4,4,0]} name="偏差値" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {filteredWeak.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">⚠️ 苦手分野レポート</h3>
          <div className="space-y-3">
            {[...filteredWeak].sort((a,b)=>b.errorRate-a.errorRate).map(w => (
              <div key={w.topic} className="rounded-lg border border-gray-100 p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white mr-2" style={{ background: sc(w.subject) }}>{w.subject}</span>
                    <span className="font-bold text-gray-800 text-sm">{w.topic}</span>
                  </div>
                  <span className="text-sm font-bold text-red-500">誤答率 {w.errorRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${w.errorRate}%` }} />
                </div>
                <p className="text-xs text-gray-600">💡 {w.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MOCK EXAM TAB
// ═══════════════════════════════════════════════════════
function MockExamTab() {
  const { mockExams, setMockExams } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<string|null>(null);
  const initScores = () => Object.fromEntries(EXAM_SUBJECTS.map(s => [s, { score: 0, maxScore: 100, deviation: 50 }]));
  const [form, setForm] = useState({ examName: '', date: '', totalScore: 0, maxScore: 900, rank: '', scores: initScores() });
  const [judgeRows, setJudgeRows] = useState([{ school: '', judgment: 'C' as 'A'|'B'|'C'|'D'|'E' }]);
  const JUDGE_OPTS = ['A','B','C','D','E'] as const;

  const addExam = () => {
    if (!form.examName || !form.date) return;
    const judgments: MockExam['judgments'] = {};
    judgeRows.filter(r => r.school).forEach(r => { judgments[r.school] = { school: r.school, judgment: r.judgment }; });
    setMockExams([...mockExams, { id: `ex${Date.now()}`, ...form, judgments }]);
    setShowAdd(false);
    setForm({ examName: '', date: '', totalScore: 0, maxScore: 900, rank: '', scores: initScores() });
    setJudgeRows([{ school: '', judgment: 'C' }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-gray-700">📊 模擬試験記録</h3>
          <p className="text-xs text-gray-400">{mockExams.length}件の記録</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 text-xs rounded-xl text-white font-bold hover:opacity-80"
          style={{ background: '#1d4ed8' }}>＋ 模試を追加</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-200 space-y-4">
          <h4 className="font-bold text-blue-700">模試情報を入力</h4>
          <div className="grid grid-cols-2 gap-3">
            {([['試験名','examName','text','例：河合塾 全統模試'],['受験日','date','date',''],['総合点','totalScore','number',''],['順位','rank','text','例：2,340位 / 45,600人']] as [string,string,string,string][]).map(([label,key,type,ph]) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
                <input type={type} value={(form as any)[key]} placeholder={ph}
                  onChange={e => setForm({ ...form, [key]: type==='number' ? Number(e.target.value) : e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            ))}
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-600 mb-2">科目別スコア・偏差値</h5>
            <div className="overflow-y-auto max-h-56 space-y-2 pr-1">
              {EXAM_SUBJECTS.map(s => (
                <div key={s} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-xs text-gray-700 truncate">{s}</span>
                  <div className="flex items-center gap-1">
                    <input type="number" placeholder="得点" value={form.scores[s]?.score ?? 0}
                      onChange={e => setForm({ ...form, scores: { ...form.scores, [s]: { ...form.scores[s], score: Number(e.target.value) } } })}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300" />
                    <span className="text-xs text-gray-400 flex-shrink-0">pt</span>
                  </div>
                  <input type="number" placeholder="偏差値" value={form.scores[s]?.deviation ?? 50}
                    onChange={e => setForm({ ...form, scores: { ...form.scores, [s]: { ...form.scores[s], deviation: Number(e.target.value) } } })}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-xs font-bold text-gray-600">志望校判定（A〜E）</h5>
              <button onClick={() => setJudgeRows([...judgeRows, { school:'', judgment:'C' }])} className="text-xs text-blue-500 hover:underline">＋ 追加</button>
            </div>
            <div className="space-y-2">
              {judgeRows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={row.school} onChange={e => { const r=[...judgeRows]; r[i].school=e.target.value; setJudgeRows(r); }}
                    placeholder="志望校名" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none" />
                  <select value={row.judgment} onChange={e => { const r=[...judgeRows]; r[i].judgment=e.target.value as any; setJudgeRows(r); }}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                    style={{ color: JUDGE_COLORS[row.judgment] }}>
                    {JUDGE_OPTS.map(j => <option key={j} value={j}>{j}判定</option>)}
                  </select>
                  {judgeRows.length > 1 && <button onClick={() => setJudgeRows(judgeRows.filter((_,idx)=>idx!==i))} className="text-gray-400 hover:text-red-400 text-xs">✕</button>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600">キャンセル</button>
            <button onClick={addExam} className="px-4 py-2 text-xs rounded-lg text-white font-bold" style={{ background: '#1d4ed8' }}>保存</button>
          </div>
        </div>
      )}

      {mockExams.length === 0 && !showAdd && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm">模試の記録がまだありません</p>
          <p className="text-xs mt-1">「＋ 模試を追加」から記録を始めましょう</p>
        </div>
      )}

      <div className="space-y-3">
        {[...mockExams].reverse().map(exam => (
          <div key={exam.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setExpanded(expanded===exam.id ? null : exam.id)}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-gray-800">{exam.examName}</div>
                <div className="text-xs text-gray-400 mt-0.5">{exam.date}　{exam.rank}</div>
              </div>
              <div className="text-xl font-black text-blue-600">{exam.totalScore}<span className="text-xs text-gray-400 font-normal">/{exam.maxScore}点</span></div>
            </div>
            {Object.keys(exam.judgments).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.values(exam.judgments).map(j => (
                  <span key={j.school} className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ background: JUDGE_COLORS[j.judgment] }}>
                    {j.school}：{j.judgment}
                  </span>
                ))}
              </div>
            )}
            {expanded === exam.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <h5 className="text-xs font-bold text-gray-500 mb-2">科目別スコア & 偏差値</h5>
                {Object.entries(exam.scores).filter(([,v])=>v.score>0).map(([subj,v]) => (
                  <div key={subj} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-32 flex-shrink-0 truncate">{subj}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                        <span>{v.score}/{v.maxScore}点</span>
                        <span>偏差値 <strong className="text-blue-600">{v.deviation}</strong></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${(v.score/v.maxScore)*100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  RESOURCES TAB
// ═══════════════════════════════════════════════════════
function ResourceTab() {
  const { selectedSubjects } = useApp();
  const [showAll, setShowAll] = useState(false);

  const resourceKeys = new Set<string>();
  [...selectedSubjects].forEach(s => { const k = SUBJECT_TO_RESOURCE[s]; if (k) resourceKeys.add(k); });

  const weakList: Resource[] = [];
  const weakSeen = new Set<string>();
  [...weakAreas].sort((a,b)=>b.errorRate-a.errorRate).forEach(w => {
    (allResources[w.resourceKey] ?? allResources[`${w.subject}_全般`] ?? []).forEach(b => {
      if (!weakSeen.has(b.title) && weakList.length < 6) { weakSeen.add(b.title); weakList.push(b); }
    });
  });

  const subjectList: Resource[] = [];
  const subjectSeen = new Set<string>();
  [...resourceKeys].forEach(key => {
    (allResources[key] ?? []).forEach(b => {
      if (!subjectSeen.has(b.title) && subjectList.length < 10) { subjectSeen.add(b.title); subjectList.push(b); }
    });
  });

  const list = selectedSubjects.size > 0 ? subjectList : weakList;

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 text-white"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
        <div className="font-bold mb-1 text-sm">📚 参考書推薦ロジック</div>
        <p className="text-blue-200 text-xs leading-relaxed">
          {selectedSubjects.size > 0
            ? `受験科目タブで選択した ${selectedSubjects.size} 科目に対応した参考書を表示しています。`
            : '受験科目が未選択のため、苦手分野の誤答率に基づいて推薦しています。'}
        </p>
      </div>
      {selectedSubjects.size > 0 && (
        <div className="flex flex-wrap gap-1">
          {[...selectedSubjects].slice(0,6).map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{s}</span>)}
          {selectedSubjects.size > 6 && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">+{selectedSubjects.size-6}科目</span>}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {(showAll ? list : list.slice(0,6)).map((r,i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{r.type}</span>
            <h4 className="font-bold text-gray-800 mt-2 mb-1 text-sm">{r.title}</h4>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{r.desc}</p>
            <a href={r.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
              📖 詳細を見る →
            </a>
          </div>
        ))}
        {list.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 py-8">受験科目タブで科目を選択すると参考書が表示されます。</div>
        )}
      </div>
      {list.length > 6 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full py-2 text-sm text-blue-600 hover:underline">
          {showAll ? '折りたたむ ▲' : `さらに表示（残り ${list.length-6}冊）▼`}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SUBJECTS TAB
// ═══════════════════════════════════════════════════════
function SubjectsTab() {
  const { selectedSubjects, setSelectedSubjects } = useApp();
  const [openGroup, setOpenGroup] = useState<string|null>('外国語');

  const toggle = (s: string) => {
    const next = new Set(selectedSubjects);
    next.has(s) ? next.delete(s) : next.add(s);
    setSelectedSubjects(next);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 leading-relaxed">
        📋 <strong>受験科目を選択するとアプリ全体に反映されます。</strong><br />
        参考書推薦・AI問題集・学習進捗グラフが選択した科目に絞り込まれます。
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {Object.entries(SUBJECTS_TREE).map(([group, subs]) => {
          const cnt = subs.filter(s => selectedSubjects.has(s)).length;
          return (
            <div key={group} className="border-b border-gray-100 last:border-b-0">
              <button onClick={() => setOpenGroup(openGroup === group ? null : group)}
                className="w-full flex justify-between items-center px-5 py-3 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">{group}</span>
                  {cnt > 0 && <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ background: '#2563eb' }}>{cnt}選択中</span>}
                </div>
                <span className="text-gray-400 text-sm">{openGroup === group ? '▲' : '▼'}</span>
              </button>
              {openGroup === group && (
                <div className="px-5 pb-4 grid grid-cols-2 md:grid-cols-3 gap-1.5">
                  {subs.map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer group py-1">
                      <input type="checkbox" checked={selectedSubjects.has(s)} onChange={() => toggle(s)} className="w-4 h-4 rounded accent-blue-600" />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{s}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-gray-700">✅ 選択中の受験科目（{selectedSubjects.size}科目）</h4>
          {selectedSubjects.size > 0 && <button onClick={() => setSelectedSubjects(new Set())} className="text-xs text-red-400 hover:underline">全解除</button>}
        </div>
        {selectedSubjects.size === 0
          ? <p className="text-xs text-gray-400">まだ科目が選択されていません。</p>
          : <div className="flex flex-wrap gap-2">
              {[...selectedSubjects].map(s => (
                <button key={s} onClick={() => toggle(s)}
                  className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-red-100 hover:text-red-600 transition-colors">
                  {s} ✕
                </button>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  QUESTIONS TAB
// ═══════════════════════════════════════════════════════
function QuestionTab() {
  const { selectedSubjects } = useApp();
  const availableKeys = new Set<string>();
  if (selectedSubjects.size === 0) { Object.keys(aiQuestions).forEach(k => availableKeys.add(k)); }
  else {
    [...selectedSubjects].forEach(s => { const k = SUBJECT_TO_QBANK[s]; if (k) availableKeys.add(k); });
    if (availableKeys.size === 0) Object.keys(aiQuestions).forEach(k => availableKeys.add(k));
  }
  const tabs = [...availableKeys];
  const [activeTab, setActiveTab] = useState(tabs[0] ?? '数学');
  const [revealed, setRevealed]   = useState<Set<string>>(new Set());
  const [showExp, setShowExp]     = useState<Set<string>>(new Set());
  const cur = tabs.includes(activeTab) ? activeTab : tabs[0] ?? '数学';
  const questions = aiQuestions[cur] ?? [];

  return (
    <div className="space-y-4">
      {selectedSubjects.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700">
          📋 受験科目に対応した問題のみ表示中（{tabs.join('・')}）
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(s => (
          <button key={s} onClick={() => { setActiveTab(s); setRevealed(new Set()); setShowExp(new Set()); }}
            className="px-4 py-1.5 text-sm rounded-full font-medium transition-all"
            style={{ background: cur===s ? sc(s) : '#f3f4f6', color: cur===s ? 'white' : '#374151' }}>{s}</button>
        ))}
      </div>
      <div className="space-y-4">
        {questions.map((q,idx) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-bold text-gray-500">問 {idx+1}</span>
              <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ background: dc(q.difficulty) }}>{q.difficulty}</span>
            </div>
            <div className="px-5 py-4">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm leading-relaxed">{q.question}</pre>
            </div>
            <div className="px-5 pb-4 flex gap-2">
              <button onClick={() => setRevealed(prev => { const n=new Set(prev); n.has(q.id)?n.delete(q.id):n.add(q.id); return n; })}
                className="px-4 py-2 text-xs rounded-lg font-bold text-white hover:opacity-80"
                style={{ background: revealed.has(q.id) ? '#6b7280' : sc(cur) }}>
                {revealed.has(q.id) ? '解答を隠す' : '解答を見る'}
              </button>
              {revealed.has(q.id) && (
                <button onClick={() => setShowExp(prev => { const n=new Set(prev); n.has(q.id)?n.delete(q.id):n.add(q.id); return n; })}
                  className="px-4 py-2 text-xs rounded-lg font-bold border border-gray-300 text-gray-600 hover:bg-gray-50">
                  {showExp.has(q.id) ? '解説を隠す' : '解説を見る'}
                </button>
              )}
            </div>
            {revealed.has(q.id) && (
              <div className="mx-5 mb-3 rounded-lg p-3 bg-green-50 border border-green-200">
                <div className="text-xs font-bold text-green-700 mb-1">【解答】</div>
                <pre className="whitespace-pre-wrap font-sans text-green-800 text-sm">{q.answer}</pre>
              </div>
            )}
            {revealed.has(q.id) && showExp.has(q.id) && (
              <div className="mx-5 mb-4 rounded-lg p-3 bg-blue-50 border border-blue-200">
                <div className="text-xs font-bold text-blue-700 mb-1">【解説】</div>
                <pre className="whitespace-pre-wrap font-sans text-blue-800 text-sm">{q.explanation}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  FILE TAB
// ═══════════════════════════════════════════════════════
function FileTab() {
  const [files, setFiles]       = useState<FileItem[]>(initialFiles);
  const [filter, setFilter]     = useState('全科目');
  const [newName, setNewName]   = useState('');
  const [newSub, setNewSub]     = useState('数学');
  const [newType, setNewType]   = useState('メモ');
  const [newContent, setNewContent] = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const filtered = filter === '全科目' ? files : files.filter(f => f.subject === filter);

  const dl = (f: FileItem) => {
    const url = URL.createObjectURL(new Blob([f.content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `${f.name}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setFiles(prev => [{ id:`f${Date.now()}`, name: file.name.replace(/\.[^/.]+$/,''), subject:'数学', type:'アップロード', date: new Date().toISOString().slice(0,10), size:`${Math.round(file.size/1024)||1}KB`, content: ev.target?.result as string ?? '' }, ...prev]);
    reader.readAsText(file,'utf-8'); e.target.value='';
  };
  const add = () => {
    if (!newName.trim()||!newContent.trim()) return;
    setFiles(prev => [{ id:`f${Date.now()}`, name:newName, subject:newSub, type:newType, date:new Date().toISOString().slice(0,10), size:`${Math.round(new TextEncoder().encode(newContent).length/1024)||1}KB`, content:newContent }, ...prev]);
    setNewName(''); setNewContent(''); setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {['全科目','数学','英語','国語','理科','社会'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1 text-xs rounded-full transition-all"
              style={{ background: filter===s?sc(s):'#f3f4f6', color: filter===s?'white':'#374151' }}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium">📁 開く</button>
          <input ref={fileRef} type="file" accept=".txt,.md" onChange={upload} className="hidden" />
          <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 text-xs rounded-lg text-white font-medium hover:opacity-80" style={{ background:'#2563eb' }}>＋ 新規作成</button>
        </div>
      </div>
      {showAdd && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 space-y-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="タイトル"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <div className="flex gap-2">
            <select value={newSub} onChange={e => setNewSub(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1">
              {['数学','英語','国語','理科','社会','情報'].map(s=><option key={s}>{s}</option>)}
            </select>
            <select value={newType} onChange={e => setNewType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1">
              {['メモ','ノート','まとめ','問題','その他'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="内容を入力" rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600">キャンセル</button>
            <button onClick={add} className="px-4 py-1.5 text-xs rounded-lg text-white font-bold" style={{ background:'#2563eb' }}>保存</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {filtered.map(f => (
          <div key={f.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ background: sc(f.subject) }}>{f.subject}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{f.type}</span>
                  <span className="text-xs text-gray-400">{f.date}　{f.size}</span>
                </div>
                <div className="font-bold text-gray-800 text-sm truncate">{f.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-1">{f.content.slice(0,60)}…</div>
              </div>
              <div className="flex gap-1 ml-3 flex-shrink-0">
                <button onClick={() => dl(f)} className="px-3 py-1.5 text-xs rounded-lg text-white font-bold hover:opacity-80" style={{ background:'#10b981' }}>⬇ DL</button>
                <button onClick={() => setFiles(p=>p.filter(x=>x.id!==f.id))} className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-500 font-bold hover:bg-red-100">削除</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-400 py-10">ファイルがありません</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SETTINGS TAB
// ═══════════════════════════════════════════════════════
function SettingsTab() {
  const { user, setUser } = useApp();
  if (!user) return null;
  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);

  const save = () => { setUser(form); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const F = ({ label, k, type='text', ph='' }: { label:string; k:keyof UserProfile; type?:string; ph?:string }) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      <input type={type} value={form[k] as string} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={ph}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-black text-gray-700">👤 プロフィール</h3>
        <F label="お名前" k="name" ph="山田 太郎" />
        <F label="ログインID" k="loginId" ph="my_id" />
        <F label="パスワード" k="password" type="password" ph="••••••••" />
      </div>

      {[
        { service: '東進', color: '#ea580c', idKey: 'toushinId' as keyof UserProfile, pwKey: 'toushinPw' as keyof UserProfile, url: `https://www.toshin.com/`, desc: '東進のログインIDとパスワードを登録しておくと、下のボタンからワンクリックでアクセスできます。' },
        { service: 'パスナビ', color: '#16a34a', idKey: 'passnavi' as keyof UserProfile, pwKey: 'passnaviPw' as keyof UserProfile, url: `https://passnavi.evidus.com/`, desc: 'パスナビのIDとパスワードを登録しておくと、下のボタンからワンクリックでアクセスできます。' },
      ].map(({ service, color, idKey, pwKey, url, desc }) => (
        <div key={service} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div>
            <span className="font-black text-sm" style={{ color }}>{service}</span>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
          <F label={`${service} ID`} k={idKey} ph={`${service}のログインID`} />
          <F label={`${service} パスワード`} k={pwKey} type="password" ph={`${service}のパスワード`} />
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-80 transition-opacity"
            style={{ background: color }}>
            {service} を開く →
          </a>
          <p className="text-xs text-gray-300">※ セキュリティのため、パスワードはこのデバイス上にのみ保存されます。</p>
        </div>
      ))}

      <button onClick={save}
        className="w-full py-3 rounded-xl font-black text-white text-sm hover:opacity-90 transition-opacity"
        style={{ background: saved ? '#10b981' : 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
        {saved ? '✓ 保存しました！' : '設定を保存'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  PAST EXAM TAB（過去問リンク集）
// ═══════════════════════════════════════════════════════

// 科目グループ → 各サイトの過去問URL
type PastExamLink = { label: string; url: string; color: string; desc: string };
type PastExamSubject = { name: string; links: PastExamLink[] };
type PastExamCategory = { category: string; icon: string; subjects: PastExamSubject[] };

// 過去問データ：パスナビ・東進のみ
type PastExamEntry = {
  subject: string;
  passnavi: { label: string; url: string; desc: string } | null;
  toshin:   { label: string; url: string; desc: string } | null;
};

const PAST_EXAM_DATA: PastExamEntry[] = [
  {
    subject: '共通テスト（全科目）',
    passnavi: { label: 'パスナビ｜共通テスト過去問', url: 'https://passnavi.evidus.com/examination/center', desc: '科目ごとに問題・解答を閲覧できる' },
    toshin:   { label: '東進｜共通テスト過去問DB', url: 'https://www.toshin.com/kakomon/center/', desc: '東進の共通テスト過去問データベース（要会員）' },
  },
  {
    subject: '数学（ⅠA・ⅡB・ⅡBC）',
    passnavi: { label: 'パスナビ｜数学 過去問', url: 'https://passnavi.evidus.com/examination/center/math', desc: '共通テスト数学の過去問・解答' },
    toshin:   { label: '東進｜数学 過去問', url: 'https://www.toshin.com/kakomon/center/math/', desc: '東進の数学過去問データベース' },
  },
  {
    subject: '英語（リーディング・リスニング）',
    passnavi: { label: 'パスナビ｜英語 過去問', url: 'https://passnavi.evidus.com/examination/center/english', desc: 'R・L両方の過去問・解答' },
    toshin:   { label: '東進｜英語 過去問', url: 'https://www.toshin.com/kakomon/center/english/', desc: '東進の英語過去問データベース' },
  },
  {
    subject: '国語（現代文・古文・漢文）',
    passnavi: { label: 'パスナビ｜国語 過去問', url: 'https://passnavi.evidus.com/examination/center/japanese', desc: '現代文・古文・漢文の過去問・解答' },
    toshin:   { label: '東進｜国語 過去問', url: 'https://www.toshin.com/kakomon/center/japanese/', desc: '東進の国語過去問データベース' },
  },
  {
    subject: '物理',
    passnavi: { label: 'パスナビ｜物理 過去問', url: 'https://passnavi.evidus.com/examination/center/physics', desc: '物理・物理基礎の過去問・解答' },
    toshin:   { label: '東進｜物理 過去問', url: 'https://www.toshin.com/kakomon/center/physics/', desc: '東進の物理過去問データベース' },
  },
  {
    subject: '化学',
    passnavi: { label: 'パスナビ｜化学 過去問', url: 'https://passnavi.evidus.com/examination/center/chemistry', desc: '化学・化学基礎の過去問・解答' },
    toshin:   { label: '東進｜化学 過去問', url: 'https://www.toshin.com/kakomon/center/chemistry/', desc: '東進の化学過去問データベース' },
  },
  {
    subject: '生物',
    passnavi: { label: 'パスナビ｜生物 過去問', url: 'https://passnavi.evidus.com/examination/center/biology', desc: '生物・生物基礎の過去問・解答' },
    toshin:   { label: '東進｜生物 過去問', url: 'https://www.toshin.com/kakomon/center/biology/', desc: '東進の生物過去問データベース' },
  },
  {
    subject: '地学',
    passnavi: { label: 'パスナビ｜地学 過去問', url: 'https://passnavi.evidus.com/examination/center/earth-science', desc: '地学・地学基礎の過去問・解答' },
    toshin:   { label: '東進｜地学 過去問', url: 'https://www.toshin.com/kakomon/center/earth-science/', desc: '東進の地学過去問データベース' },
  },
  {
    subject: '日本史・世界史・地理',
    passnavi: { label: 'パスナビ｜地歴 過去問', url: 'https://passnavi.evidus.com/examination/center/geography-history', desc: '日本史・世界史・地理の過去問・解答' },
    toshin:   { label: '東進｜地歴 過去問', url: 'https://www.toshin.com/kakomon/center/geography-history/', desc: '東進の地歴過去問データベース' },
  },
  {
    subject: '倫理・政治経済・公共',
    passnavi: { label: 'パスナビ｜公民 過去問', url: 'https://passnavi.evidus.com/examination/center/civics', desc: '公民系科目の過去問・解答' },
    toshin:   { label: '東進｜公民 過去問', url: 'https://www.toshin.com/kakomon/center/civics/', desc: '東進の公民過去問データベース' },
  },
  {
    subject: '二次試験（大学別）',
    passnavi: { label: 'パスナビ｜大学別 過去問検索', url: 'https://passnavi.evidus.com/search_u/', desc: '大学名で検索して各校の過去問ページへ' },
    toshin:   { label: '東進｜大学別 過去問DB', url: 'https://www.toshin.com/kakomon/', desc: '東進の大学別過去問データベース（要会員）' },
  },
];

function PastExamTab() {
  const { selectedSubjects } = useApp();

  return (
    <div className="space-y-4">
      {/* バナー */}
      <div className="rounded-xl p-4 text-white"
        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #ea580c 100%)' }}>
        <div className="font-bold mb-1 text-sm">📝 過去問リンク集</div>
        <p className="text-green-100 text-xs leading-relaxed">
          パスナビと東進の過去問ページへの直接リンクです。科目を選んでクリックするとそのまま過去問ページへ移動できます。
        </p>
        {/* サイト凡例 */}
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-300 flex-shrink-0" />
            <span className="text-xs text-green-100 font-bold">パスナビ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-300 flex-shrink-0" />
            <span className="text-xs text-orange-100 font-bold">東進</span>
          </div>
        </div>
      </div>

      {/* 科目別テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {PAST_EXAM_DATA.map((entry, i) => (
          <div key={entry.subject}
            className={`border-b border-gray-50 last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
            <div className="px-4 py-3">
              <div className="font-bold text-gray-800 text-sm mb-2">{entry.subject}</div>
              <div className="flex flex-col sm:flex-row gap-2">
                {/* パスナビ */}
                {entry.passnavi && (
                  <a href={entry.passnavi.url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:shadow-sm transition-all group">
                    <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-green-800 text-xs group-hover:underline leading-tight">
                        {entry.passnavi.label} →
                      </div>
                      <div className="text-green-600 text-xs mt-0.5 leading-tight">{entry.passnavi.desc}</div>
                    </div>
                  </a>
                )}
                {/* 東進 */}
                {entry.toshin && (
                  <a href={entry.toshin.url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:shadow-sm transition-all group">
                    <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-orange-800 text-xs group-hover:underline leading-tight">
                        {entry.toshin.label} →
                      </div>
                      <div className="text-orange-600 text-xs mt-0.5 leading-tight">{entry.toshin.desc}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 両サイトのトップページへのショートカット */}
      <div className="grid grid-cols-2 gap-3">
        <a href="https://passnavi.evidus.com/examination/" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-black hover:opacity-90 transition-opacity"
          style={{ background: '#16a34a' }}>
          パスナビ 過去問トップ →
        </a>
        <a href="https://www.toshin.com/kakomon/" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-black hover:opacity-90 transition-opacity"
          style={{ background: '#ea580c' }}>
          東進 過去問DB →
        </a>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
type Tab = 'progress'|'mockexam'|'resources'|'pastexam'|'subjects'|'questions'|'files'|'settings';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    new Set(['英語（リーディング）','英語（リスニング）','数学Ⅱ・B','物理','化学','日本史B'])
  );
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('progress');

  if (!user) return <LoginScreen onLogin={setUser} />;

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'progress',  icon: '📈', label: '進捗' },
    { id: 'mockexam',  icon: '📊', label: '模試' },
    { id: 'resources', icon: '📚', label: '参考書' },
    { id: 'pastexam',  icon: '📝', label: '過去問' },
    { id: 'subjects',  icon: '📋', label: '受験科目' },
    { id: 'questions', icon: '🤖', label: 'AI問題' },
    { id: 'files',     icon: '📁', label: 'ファイル' },
    { id: 'settings',  icon: '⚙️', label: '設定' },
  ];

  return (
    <AppContext.Provider value={{ selectedSubjects, setSelectedSubjects, user, setUser, mockExams, setMockExams }}>
      <div className="min-h-screen bg-gray-50">
        <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }} className="text-white px-4 py-3 shadow-lg">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-lg font-black tracking-tight">🎓 大学受験対策ポータル</h1>
              <p className="text-blue-300 text-xs">{user.name} さん　受験科目 {selectedSubjects.size}科目選択中</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://flips.jp/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-black hover:opacity-80 transition-opacity border border-sky-400"
                style={{ background: '#0ea5e9' }}>
                🃏 FLIPS
              </a>
              <button onClick={() => setUser(null)} className="text-xs text-blue-300 hover:text-white px-2 py-1 rounded border border-blue-700 hover:border-blue-400 transition-colors">ログアウト</button>
            </div>
          </div>
        </header>

        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-3xl mx-auto px-2">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className="flex-shrink-0 flex flex-col items-center px-3 py-2.5 text-xs font-medium transition-all border-b-2"
                  style={{ borderBottomColor: activeTab===t.id ? '#1d4ed8' : 'transparent', color: activeTab===t.id ? '#1d4ed8' : '#6b7280' }}>
                  <span className="text-base mb-0.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {activeTab === 'progress'  && <ProgressTab />}
          {activeTab === 'mockexam'  && <MockExamTab />}
          {activeTab === 'resources' && <ResourceTab />}
          {activeTab === 'pastexam'  && <PastExamTab />}
          {activeTab === 'subjects'  && <SubjectsTab />}
          {activeTab === 'questions' && <QuestionTab />}
          {activeTab === 'files'     && <FileTab />}
          {activeTab === 'settings'  && <SettingsTab />}
        </main>
      </div>
    </AppContext.Provider>
  );
}
