const asPoem = (poem, index) => ({
  id: poem.id || `demo-${index + 1}`,
  title: poem.title || "无题",
  author: poem.author || "佚名",
  category: poem.category || "古诗",
  paragraph: poem.paragraph || "",
  tags: poem.tags || [poem.category || "古诗"],
  paragraphs: poem.paragraphs || (poem.paragraph ? [poem.paragraph] : []),
  textBody: poem.textBody || poem.paragraph || (poem.paragraphs || []).join(""),
  poemName: poem.poemName || poem.title || "无题",
  origin: poem.origin || poem.title || "无题",
  content: poem.content || (poem.paragraphs || []).join("\n"),
  rhythmic: poem.rhythmic || "",
  titleNote: poem.titleNote || "",
  type: poem.type || "tangshi300",
});

export const demoPoems = Object.freeze([
  {
    id: "demo-jingyesi",
    title: "静夜思",
    author: "李白",
    category: "唐诗",
    paragraph: "床前明月光，疑是地上霜。",
    paragraphs: [
      "床前明月光，疑是地上霜。",
      "举头望明月，低头思故乡。",
    ],
    tags: ["唐诗", "思乡", "李白"],
    type: "tangshi300",
  },
  {
    id: "demo-chunxiao",
    title: "春晓",
    author: "孟浩然",
    category: "唐诗",
    paragraph: "春眠不觉晓，处处闻啼鸟。",
    paragraphs: [
      "春眠不觉晓，处处闻啼鸟。",
      "夜来风雨声，花落知多少。",
    ],
    tags: ["唐诗", "春天", "孟浩然"],
    type: "tangshi300",
  },
  {
    id: "demo-dengguanelou",
    title: "登鹳雀楼",
    author: "王之涣",
    category: "唐诗",
    paragraph: "白日依山尽，黄河入海流。",
    paragraphs: [
      "白日依山尽，黄河入海流。",
      "欲穷千里目，更上一层楼。",
    ],
    tags: ["唐诗", "登高", "王之涣"],
    type: "tangshi300",
  },
  {
    id: "demo-shuidiaoge",
    title: "水调歌头·明月几时有",
    author: "苏轼",
    category: "宋词",
    paragraph: "明月几时有？把酒问青天。",
    paragraphs: [
      "明月几时有？把酒问青天。",
      "不知天上宫阙，今夕是何年。",
      "人有悲欢离合，月有阴晴圆缺，此事古难全。",
      "但愿人长久，千里共婵娟。",
    ],
    tags: ["宋词", "中秋", "苏轼"],
    type: "songci300",
  },
  {
    id: "demo-rumengling",
    title: "如梦令·常记溪亭日暮",
    author: "李清照",
    category: "宋词",
    paragraph: "常记溪亭日暮，沉醉不知归路。",
    paragraphs: [
      "常记溪亭日暮，沉醉不知归路。",
      "兴尽晚回舟，误入藕花深处。",
      "争渡，争渡，惊起一滩鸥鹭。",
    ],
    tags: ["宋词", "李清照"],
    type: "songci300",
  },
  {
    id: "demo-guanju",
    title: "关雎",
    author: "佚名",
    category: "诗经",
    paragraph: "关关雎鸠，在河之洲。",
    paragraphs: [
      "关关雎鸠，在河之洲。",
      "窈窕淑女，君子好逑。",
    ],
    tags: ["诗经", "先秦"],
    type: "shijing",
  },
  {
    id: "demo-lisao",
    title: "离骚（节选）",
    author: "屈原",
    category: "楚辞",
    paragraph: "路漫漫其修远兮，吾将上下而求索。",
    paragraphs: [
      "路漫漫其修远兮，",
      "吾将上下而求索。",
    ],
    tags: ["楚辞", "屈原"],
    type: "chuci",
  },
  {
    id: "demo-duangexing",
    title: "短歌行（节选）",
    author: "曹操",
    category: "建安",
    paragraph: "对酒当歌，人生几何！",
    paragraphs: [
      "对酒当歌，人生几何！",
      "譬如朝露，去日苦多。",
      "周公吐哺，天下归心。",
    ],
    tags: ["建安", "曹操"],
    type: "caocao",
  },
  {
    id: "demo-huajianji",
    title: "花间集·其一",
    author: "温庭筠",
    category: "花间集",
    paragraph: "小山重叠金明灭，鬓云欲度香腮雪。",
    paragraphs: [
      "小山重叠金明灭，鬓云欲度香腮雪。",
      "懒起画蛾眉，弄妆梳洗迟。",
    ],
    tags: ["花间集", "温庭筠"],
    type: "huajianji",
  },
  {
    id: "demo-yuanqu",
    title: "天净沙·秋思",
    author: "马致远",
    category: "元曲",
    paragraph: "枯藤老树昏鸦，小桥流水人家。",
    paragraphs: [
      "枯藤老树昏鸦，小桥流水人家，",
      "古道西风瘦马。夕阳西下，断肠人在天涯。",
    ],
    tags: ["元曲", "马致远"],
    type: "yuanqu",
  },
  {
    id: "demo-nantang",
    title: "虞美人·春花秋月何时了",
    author: "李煜",
    category: "南唐词",
    paragraph: "春花秋月何时了？往事知多少。",
    paragraphs: [
      "春花秋月何时了？往事知多少。",
      "问君能有几多愁？恰似一江春水向东流。",
    ],
    tags: ["南唐", "李煜"],
    type: "nantang",
  },
  {
    id: "demo-user-work",
    title: "兰泽即兴",
    author: "兰泽演示用户",
    category: "用户作品",
    paragraph: "一池清露承新月，半卷诗书待晓风。",
    paragraphs: [
      "一池清露承新月，",
      "半卷诗书待晓风。",
    ],
    tags: ["用户作品", "演示"],
    type: "customgushici",
  },
  {
    id: "demo-wanglushan",
    title: "望庐山瀑布",
    author: "李白",
    category: "唐诗",
    paragraph: "日照香炉生紫烟，遥看瀑布挂前川。",
    paragraphs: [
      "日照香炉生紫烟，遥看瀑布挂前川。",
      "飞流直下三千尺，疑是银河落九天。",
    ],
    tags: ["唐诗", "山水", "李白"],
    type: "tangshi300",
  },
  {
    id: "demo-jiangxue",
    title: "江雪",
    author: "柳宗元",
    category: "唐诗",
    paragraph: "千山鸟飞绝，万径人踪灭。",
    paragraphs: [
      "千山鸟飞绝，万径人踪灭。",
      "孤舟蓑笠翁，独钓寒江雪。",
    ],
    tags: ["唐诗", "冬天", "柳宗元"],
    type: "tangshi300",
  },
  {
    id: "demo-xiangsi",
    title: "相思",
    author: "王维",
    category: "唐诗",
    paragraph: "红豆生南国，春来发几枝。",
    paragraphs: [
      "红豆生南国，春来发几枝。",
      "愿君多采撷，此物最相思。",
    ],
    tags: ["唐诗", "思念", "王维"],
    type: "tangshi300",
  },
  {
    id: "demo-chunyexiyu",
    title: "春夜喜雨",
    author: "杜甫",
    category: "唐诗",
    paragraph: "好雨知时节，当春乃发生。",
    paragraphs: [
      "好雨知时节，当春乃发生。",
      "随风潜入夜，润物细无声。",
      "野径云俱黑，江船火独明。",
      "晓看红湿处，花重锦官城。",
    ],
    tags: ["唐诗", "春雨", "杜甫"],
    type: "tangshi300",
  },
  {
    id: "demo-yinshi",
    title: "饮酒·其五",
    author: "陶渊明",
    category: "魏晋",
    paragraph: "结庐在人境，而无车马喧。",
    paragraphs: [
      "结庐在人境，而无车马喧。",
      "问君何能尔？心远地自偏。",
      "采菊东篱下，悠然见南山。",
      "山气日夕佳，飞鸟相与还。",
      "此中有真意，欲辨已忘言。",
    ],
    tags: ["魏晋", "田园", "陶渊明"],
    type: "caocao",
  },
  {
    id: "demo-jianjia",
    title: "蒹葭",
    author: "佚名",
    category: "诗经",
    paragraph: "蒹葭苍苍，白露为霜。",
    paragraphs: [
      "蒹葭苍苍，白露为霜。",
      "所谓伊人，在水一方。",
      "溯洄从之，道阻且长。",
      "溯游从之，宛在水中央。",
    ],
    tags: ["诗经", "思念", "先秦"],
    type: "shijing",
  },
  {
    id: "demo-pozhenzi",
    title: "破阵子·为陈同甫赋壮词以寄之",
    author: "辛弃疾",
    category: "宋词",
    paragraph: "醉里挑灯看剑，梦回吹角连营。",
    paragraphs: [
      "醉里挑灯看剑，梦回吹角连营。",
      "八百里分麾下炙，五十弦翻塞外声。",
      "沙场秋点兵。",
      "马作的卢飞快，弓如霹雳弦惊。",
      "了却君王天下事，赢得生前身后名。",
      "可怜白发生！",
    ],
    tags: ["宋词", "豪放", "辛弃疾"],
    type: "songci300",
  },
  {
    id: "demo-yijianmei",
    title: "一剪梅·红藕香残玉簟秋",
    author: "李清照",
    category: "宋词",
    paragraph: "红藕香残玉簟秋。轻解罗裳，独上兰舟。",
    paragraphs: [
      "红藕香残玉簟秋。轻解罗裳，独上兰舟。",
      "云中谁寄锦书来？雁字回时，月满西楼。",
      "花自飘零水自流。一种相思，两处闲愁。",
      "此情无计可消除，才下眉头，却上心头。",
    ],
    tags: ["宋词", "相思", "李清照"],
    type: "songci300",
  },
  {
    id: "demo-xiangjianhuan",
    title: "相见欢·无言独上西楼",
    author: "李煜",
    category: "南唐词",
    paragraph: "无言独上西楼，月如钩。",
    paragraphs: [
      "无言独上西楼，月如钩。",
      "寂寞梧桐深院锁清秋。",
      "剪不断，理还乱，是离愁。",
      "别是一般滋味在心头。",
    ],
    tags: ["南唐", "离愁", "李煜"],
    type: "nantang",
  },
  {
    id: "demo-tianjingsha",
    title: "天净沙·春",
    author: "白朴",
    category: "元曲",
    paragraph: "春山暖日和风，阑干楼阁帘栊。",
    paragraphs: [
      "春山暖日和风，阑干楼阁帘栊。",
      "杨柳秋千院中。",
      "啼莺舞燕，小桥流水飞红。",
    ],
    tags: ["元曲", "春天", "白朴"],
    type: "yuanqu",
  },
].map(asPoem));

export const demoExcerpts = Object.freeze([
  {
    content: "山有木兮木有枝，心悦君兮君不知。",
    author: "《越人歌》",
    category: "先秦",
    origin: "越人歌",
  },
  {
    content: "愿得一心人，白头不相离。",
    author: "卓文君",
    category: "汉",
    origin: "白头吟",
  },
  {
    content: "海上生明月，天涯共此时。",
    author: "张九龄",
    category: "唐诗",
    origin: "望月怀远",
  },
  {
    content: "行到水穷处，坐看云起时。",
    author: "王维",
    category: "唐诗",
    origin: "终南别业",
  },
  {
    content: "疏影横斜水清浅，暗香浮动月黄昏。",
    author: "林逋",
    category: "宋诗",
    origin: "山园小梅",
  },
  {
    content: "众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。",
    author: "辛弃疾",
    category: "宋词",
    origin: "青玉案·元夕",
  },
]);

export const poemClassMap = Object.freeze({
  1: "tangshi300",
  2: "songci300",
  tangshi300: "tangshi300",
  songci300: "songci300",
  chuci: "chuci",
  shijing: "shijing",
  caocao: "caocao",
  huajianji: "huajianji",
  nantang: "nantang",
  yuanqu: "yuanqu",
  customgushici: "customgushici",
});

export const normalizePoem = (poem, index = 0) => asPoem(poem || {}, index);

export const normalizePoemList = (items) =>
  (Array.isArray(items) ? items : []).map(normalizePoem);

export const searchPoems = (items, keyword = "") => {
  const normalized = String(keyword || "").trim().toLowerCase();
  const poems = normalizePoemList(items);
  if (!normalized) return poems;
  return poems.filter((poem) =>
    [
      poem.title,
      poem.author,
      poem.category,
      poem.poemName,
      poem.origin,
      poem.content,
      poem.textBody,
      ...(poem.tags || []),
      ...(poem.paragraphs || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
};

export const getPoemsByClass = (items, type) => {
  const classType = poemClassMap[type] || String(type || "").trim();
  const poems = normalizePoemList(items);
  if (!classType) return poems;
  return poems.filter(
    (poem) =>
      poem.type === classType ||
      poem.category === classType ||
      String(poem.id).includes(classType),
  );
};

export const getRandomExcerpt = (items = demoExcerpts, random = Math.random) => {
  const list = Array.isArray(items) && items.length ? items : demoExcerpts;
  return list[Math.floor(random() * list.length) % list.length];
};
