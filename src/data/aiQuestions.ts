export const aiQuestions = {
  数学: [
    {
      id: 'm1',
      difficulty: '標準',
      question: '関数 $f(x) = x^3 - 3x^2 + 2$ の極値を求めよ。',
      answer: '極大値 2 (x=0のとき)、極小値 -2 (x=2のとき)',
      explanation: '微分すると $f\'(x) = 3x^2 - 6x = 3x(x - 2)$。$f\'(x) = 0$ となるのは $x = 0, 2$。増減表を書くと、$x=0$ で極大値 $f(0)=2$、$x=2$ で極小値 $f(2)=-2$ をとる。'
    },
    {
      id: 'm2',
      difficulty: 'やや難',
      question: '定積分 $\\int_0^1 x e^x dx$ を求めよ。',
      answer: '1',
      explanation: '部分積分法を用いる。$\\int_0^1 x (e^x)\' dx = [x e^x]_0^1 - \\int_0^1 1 \\cdot e^x dx = e - [e^x]_0^1 = e - (e - 1) = 1$。'
    },
    {
      id: 'm3',
      difficulty: '標準',
      question: '円 $x^2 + y^2 = 5$ と直線 $y = 2x + k$ が接するとき、定数 $k$ の値を求めよ。',
      answer: '$k = \\pm 5$',
      explanation: '円の中心 $(0,0)$ と直線 $2x - y + k = 0$ の距離が半径 $\\sqrt{5}$ に等しい。$\\frac{|k|}{\\sqrt{2^2 + (-1)^2}} = \\sqrt{5}$ より $|k| = 5$。よって $k = \\pm 5$。'
    },
    {
      id: 'm4',
      difficulty: '難',
      question: '数列 $\\{a_n\\}$ が $a_1 = 1, a_{n+1} = 2a_n + 3$ を満たすとき、一般項 $a_n$ を求めよ。',
      answer: '$a_n = 2^{n+1} - 3$',
      explanation: '特性方程式 $\\alpha = 2\\alpha + 3$ より $\\alpha = -3$。漸化式は $a_{n+1} + 3 = 2(a_n + 3)$ と変形できる。数列 $\\{a_n + 3\\}$ は初項 $a_1 + 3 = 4$、公比 $2$ の等比数列なので、$a_n + 3 = 4 \\cdot 2^{n-1} = 2^{n+1}$。よって $a_n = 2^{n+1} - 3$。'
    },
    {
      id: 'm5',
      difficulty: '標準',
      question: 'サイコロを3回投げるとき、出る目の和が10になる確率を求めよ。',
      answer: '1/8',
      explanation: '目の和が10になる組み合わせは、(1,3,6)×6通り、(1,4,5)×6通り、(2,2,6)×3通り、(2,3,5)×6通り、(2,4,4)×3通り、(3,3,4)×3通り。合計27通り。確率は $27 / 6^3 = 27 / 216 = 1/8$。'
    }
  ],
  英語: [
    {
      id: 'e1',
      difficulty: '標準',
      question: '次の日本語を英語に訳しなさい。「彼がその試験に合格したという知らせに、私たちは皆驚いた。」',
      answer: 'The news that he had passed the exam surprised us all. (We were all surprised at the news that he had passed the exam.)',
      explanation: '「〜という知らせ」は同格のthatを用いて the news that... と表現する。時制の一致に注意（had passed）。'
    },
    {
      id: 'e2',
      difficulty: 'やや難',
      question: '空所に入る適切な語を選びなさい。He is the last person ( ) a lie.\n1. telling\n2. to tell\n3. tells\n4. told',
      answer: '2. to tell',
      explanation: '「the last person to do」で「最も〜しそうにない人、決して〜しない人」という定型表現。'
    },
    {
      id: 'e3',
      difficulty: '標準',
      question: '次の文を仮定法を用いて書き換えなさい。As I don\'t have enough money, I can\'t buy the car.',
      answer: 'If I had enough money, I could buy the car.',
      explanation: '現在の事実に反する仮定なので、仮定法過去（If S 過去形, S would/could 原形）を用いる。'
    },
    {
      id: 'e4',
      difficulty: '難',
      question: '文法的に誤りがある箇所を指摘し、訂正しなさい。「Hardly he had arrived home when it began to rain.」',
      answer: 'he had arrived -> had he arrived',
      explanation: '否定の副詞（Hardly）が文頭に出ると、後ろは疑問文の語順（倒置）になる。「Hardly had S Vp.p. when...」の構文。'
    },
    {
      id: 'e5',
      difficulty: '標準',
      question: '次の単語のアクセントの位置が他と異なるものを1つ選べ。\n1. e-con-o-my\n2. de-moc-ra-cy\n3. pho-tog-ra-phy\n4. pol-i-ti-cian',
      answer: '4. pol-i-ti-cian',
      explanation: '1, 2, 3は第2音節にアクセントがあるが、4の politician は -cian の直前（第3音節）にアクセントがある。'
    }
  ],
  国語: [
    {
      id: 'j1',
      difficulty: '標準',
      question: '【古文】次の助動詞「る」の意味を答えよ。「（源氏が）都へ下らる。」',
      answer: '尊敬',
      explanation: '主語が高貴な人物（源氏）であり、自発・可能・受身の文脈ではないため「尊敬（〜なさる）」となる。'
    },
    {
      id: 'j2',
      difficulty: 'やや難',
      question: '【漢文】「不者」の読みと意味を答えよ。',
      answer: '読み：しからずんば。意味：そうしなければ。',
      explanation: '仮定条件の否定を表す重要句法。「もしそうでなければ」と訳す。'
    },
    {
      id: 'j3',
      difficulty: '標準',
      question: '【現代文】「パラダイムシフト」の意味を簡潔に説明せよ。',
      answer: 'ある時代や分野において当然と考えられていた認識や思想、社会全体の価値観などが劇的に変化すること。',
      explanation: '評論文で頻出のカタカナ語。科学史家トーマス・クーンの提唱した概念。'
    },
    {
      id: 'j4',
      difficulty: '難',
      question: '【古文】「いとほし」の現代語訳として最も適切なものを選べ。\n1. かわいらしい\n2. 気の毒だ\n3. 恐ろしい\n4. 素晴らしい',
      answer: '2. 気の毒だ',
      explanation: '古文単語の「いとほし」は、相手をかわいそうに思う気持ち「気の毒だ、かわいそうだ」が原義。後に「かわいい」の意味も生じたが、受験古文ではまず「気の毒だ」を疑う。'
    },
    {
      id: 'j5',
      difficulty: '標準',
      question: '【現代文】「演繹（えんえき）」の対義語を漢字2文字で答えよ。',
      answer: '帰納（きのう）',
      explanation: '演繹は「普遍的な前提から個別の結論を導く」こと。帰納は「個別の事象から普遍的な法則を導く」こと。'
    }
  ],
  理科: [
    {
      id: 's1',
      difficulty: '標準',
      question: '【物理】質量 $m$ の物体が、高さ $h$ から自由落下した。地面に衝突する直前の速さ $v$ を求めよ。ただし重力加速度を $g$ とし、空気抵抗は無視する。',
      answer: '$v = \\sqrt{2gh}$',
      explanation: '力学的エネルギー保存則より、$mgh = \\frac{1}{2}mv^2$。これを $v$ について解くと $v = \\sqrt{2gh}$ となる。'
    },
    {
      id: 's2',
      difficulty: 'やや難',
      question: '【化学】0.10 mol/L の酢酸水溶液のpHを求めよ。ただし、酢酸の電離定数 $K_a = 2.7 \\times 10^{-5}$ mol/L、$\\log_{10} 3 = 0.48$ とし、電離度は1より十分に小さいとする。',
      answer: 'pH = 2.78',
      explanation: '$[H^+] = \\sqrt{cK_a} = \\sqrt{0.10 \\times 2.7 \\times 10^{-5}} = \\sqrt{27 \\times 10^{-7}} = 3\\sqrt{3} \\times 10^{-3}$。pH = $-\\log_{10}(3\\sqrt{3} \\times 10^{-3}) = 3 - 1.5 \\log_{10} 3 = 3 - 1.5 \\times 0.48 = 3 - 0.72 = 2.28$。(※計算訂正: $\\sqrt{2.7 \\times 10^{-6}} = \\sqrt{270 \\times 10^{-8}}$... 解答例の数値は概算。正確には $[H^+] = 1.64 \\times 10^{-3}$ で pH≒2.78)'
    },
    {
      id: 's3',
      difficulty: '標準',
      question: '【生物】DNAを構成する4種類の塩基の名称を答えよ。',
      answer: 'アデニン、チミン、グアニン、シトシン',
      explanation: 'DNAの塩基はアデニン(A)、チミン(T)、グアニン(G)、シトシン(C)。RNAの場合はチミンがウラシル(U)になる。'
    },
    {
      id: 's4',
      difficulty: '難',
      question: '【物理】波長 $\\lambda$ の単色光を用いたヤングの干渉実験で、スリット間隔を $d$、スリットからスクリーンまでの距離を $L$ としたとき、隣り合う明線の間隔 $\\Delta x$ を求めよ。',
      answer: '$\\Delta x = \\frac{L\\lambda}{d}$',
      explanation: 'スクリーン上の位置 $x$ における経路差は $dx/L$ と近似できる。明線の条件は $dx/L = m\\lambda$ ($m$は整数) なので、$x = mL\\lambda/d$。隣り合う明線の間隔は $\\Delta x = (m+1)L\\lambda/d - mL\\lambda/d = L\\lambda/d$。'
    },
    {
      id: 's5',
      difficulty: '標準',
      question: '【化学】アルカリ金属を原子番号の小さい順に3つ答えよ。',
      answer: 'リチウム(Li)、ナトリウム(Na)、カリウム(K)',
      explanation: '第1族元素のうち、水素を除いたものがアルカリ金属。Li, Na, K, Rb, Cs, Fr の順。'
    }
  ],
  社会: [
    {
      id: 'h1',
      difficulty: '標準',
      question: '【日本史】1192年に源頼朝が任命された役職名を答えよ。',
      answer: '征夷大将軍',
      explanation: '建久3年（1192年）、後白河法皇の死後に朝廷から征夷大将軍に任命され、名実ともに鎌倉幕府が成立したとされる（諸説あり）。'
    },
    {
      id: 'h2',
      difficulty: 'やや難',
      question: '【世界史】1555年、神聖ローマ帝国でルター派の信仰が公認された和議の名称を答えよ。',
      answer: 'アウクスブルクの宗教和議',
      explanation: '諸侯にカトリックかルター派かの選択権が与えられたが、個人の信仰の自由やカルヴァン派は認められなかった。'
    },
    {
      id: 'h3',
      difficulty: '標準',
      question: '【地理】赤道付近で上昇気流が生じ、年中降水量が多い気候帯をケッペンの気候区分で何というか。',
      answer: '熱帯雨林気候 (Af)',
      explanation: '赤道低圧帯の影響を一年中受けるため、高温多雨となる。'
    },
    {
      id: 'h4',
      difficulty: '難',
      question: '【日本史】江戸時代の三大改革のうち、株仲間の解散を命じた改革の名称と、その中心となった老中の名前を答えよ。',
      answer: '天保の改革、水野忠邦',
      explanation: '物価下落を狙って株仲間の解散（株仲間解散令）を出したが、かえって流通が混乱し失敗に終わった。'
    },
    {
      id: 'h5',
      difficulty: '標準',
      question: '【世界史】フランス革命期に「人権宣言」の起草に中心的な役割を果たした、アメリカ独立戦争にも参加した貴族は誰か。',
      answer: 'ラファイエット',
      explanation: '自由主義貴族の代表格であり、国民軍司令官としても活躍した。'
    }
  ]
};
