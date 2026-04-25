import type { StoryChapterScript } from '../types'

export const guidedTourSteps: StoryChapterScript[] = [
  {
    id: 'tour-global',
    order: 1,
    viewMode: 'overview',
    kicker: { zh: 'Step 1 · 破除迷思', en: 'Step 1 · The Global Picture' },
    title: {
      zh: '经济增长，必须以排放为代价吗？',
      en: 'Myth-busting: Must economic growth cost the climate?',
    },
    question: {
      zh: '当全球经济体被置于同一坐标系下，真正的悬念不再是谁的绝对排放量最高，而是谁还在延续“高增长高排放”的老路，谁又率先迎来了历史性拐点。',
      en: 'When the world is plotted on a single coordinate system, the most pressing question isn’t who emits the most—it’s who is still climbing the carbon ladder, and who has finally bent the curve.',
    },
    takeaway: {
      zh: '脱钩并非单一的静态数据，而是一种趋势：财富曲线向右延伸的同时，碳足迹曲线正垂下高昂的头颅。',
      en: 'Decoupling is not a static number, but a dynamic divergence: the wealth curve stretches rightward, while the carbon footprint finally drops its head.',
    },
    body: {
      zh: [
        '横轴代表财富的积累（人均GDP），纵轴记录碳排放的增减。图表上的每一个点，都是一个国家过去三十余年跋涉的缩影。',
        '走向右上角，意味着繁荣依然附带着沉重的环境代价。而真正值得凝视的，是那些罕见跌入“右下角”的坐标——在那里，经济体仍在扩张，但人均碳排放已经开始实质性回落。',
      ],
      en: [
        'The horizontal axis measures wealth accumulation (GDP per capita), while the vertical axis tracks carbon footprints. Each dot encapsulates over three decades of a nation’s journey.',
        'Moving toward the upper-right implies that prosperity still carries a heavy environmental toll. The truly crucial data points lie in the elusive lower-right: economies that keep expanding, yet see their per capita emissions decidedly fall.',
      ],
    },
    focusLabel: { zh: '寻找历史性拐点', en: 'Locating the historical turning point' },
    atlasPrompt: { zh: '越过代表传统的右上角，寻找跌入右下的破局者。', en: 'Look past the traditional upper-right to find the rule-breakers in the lower-right.' },
    countries: [],
    metric: 'co2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['右下方：增长与排放的绝对脱钩', '右上方：繁荣仍伴随环境代价', '轨迹方向比当前位置更重要'],
      en: ['Lower-right: Absolute decoupling', 'Upper-right: Growth fueled by emissions', 'Trajectory matters more than position'],
    },
  },
  {
    id: 'tour-absolute',
    order: 2,
    viewMode: 'absolute',
    kicker: { zh: 'Step 2 · 筛选样本', en: 'Step 2 · The Rare Breed' },
    title: {
      zh: '进入气候经济学的严苛门槛',
      en: 'Entering the strictest threshold of climate economics',
    },
    question: {
      zh: '当经济引擎持续轰鸣，碳排放却逆势下行，这些国家便跨入了气候治理中最难企及的领域：绝对脱钩。',
      en: 'When the economic engine roars but emissions fall, a country crosses the most rigorous threshold in climate governance: absolute decoupling.',
    },
    takeaway: {
      zh: '站在同一个象限，并不意味着手握同一份图纸。接下来的核心命题是：他们究竟是如何走入这片区域的？',
      en: 'Sharing a quadrant does not mean sharing a playbook. The core question now is: how exactly did they navigate their way here?',
    },
    body: {
      zh: [
        '在这片被高亮的右下象限中，国家不再单纯因为“贫穷”而低排，而是在经历增长后，主动拉低了排放底线。',
        '穿透数据表象，英国、德国与北欧诸国虽在此集结，但路径大相径庭。是果断的能源革命？经历了阵痛的产业空心化？抑或是悄然完成了高耗能环节的转移？',
      ],
      en: [
        'In this highlighted lower-right quadrant, countries are not low-emitters due to poverty. Instead, they have actively forced their emissions down after periods of growth.',
        'Beneath the surface, while the UK, Germany, and Nordic countries cluster here, their paths vary wildly. Are we looking at a clean energy revolution, painful deindustrialization, or simply the offshoring of heavy industry?',
      ],
    },
    focusLabel: { zh: '锁定绝对脱钩的先行者', en: 'Isolate the absolute decouplers' },
    atlasPrompt: { zh: '右下象限只是入口，转型背后的机制分歧才刚刚展开。', en: 'The lower-right is merely the entrance; the divergence in mechanisms is just beginning.' },
    countries: ['GBR', 'DEU', 'SWE', 'DNK'],
    metric: 'co2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['锁定人均GDP升、碳排降的样本', '识别不同经济体的集结区', '追问同象限背后的不同机制'],
      en: ['Filter for GDP rise & CO2 fall', 'Identify clusters of economies', 'Question the differing mechanisms'],
    },
  },
  {
    id: 'uk-germany',
    order: 3,
    viewMode: 'trajectory',
    kicker: { zh: 'Step 3 · 欧洲双擎', en: 'Step 3 · European Powerhouses' },
    title: {
      zh: '英国与德国：殊途同归背后的不同代价',
      en: 'The UK and Germany: Different prices paid for the same destination',
    },
    question: {
      zh: '同为越过碳达峰的欧洲老牌工业国，两国在图表上留下的轨迹截然不同：一条是凌厉的急转弯，另一条则是带着惯性的沉重转身。',
      en: 'Both European industrial veterans have passed their emission peaks, yet their trajectories tell contrasting stories: one is a sharp U-turn, the other a heavy, lumbering pivot.',
    },
    takeaway: {
      zh: '英国凭借决绝的“去煤化”压低了曲线，而背负庞大制造业底盘的德国，其脱碳步伐更为步履维艰。',
      en: 'The UK drove its curve down steeply by aggressively phasing out coal, while Germany, burdened by its massive manufacturing core, shows a much more agonizing descent.',
    },
    body: {
      zh: [
        '终点的一致，掩盖了过程的剧烈反差。英国的轨迹在图表上呈现出陡峭的向右下方折返，这背后是撒切尔时代以来对煤炭产业的彻底剥离。',
        '相比之下，德国的下行曲线显得平缓而胶着。要在保全庞大重工业体系的同时推进能源转型，意味着它必须背负更沉重的结构性包袱。脱钩，从来不存在一张普适的图纸。',
      ],
      en: [
        'A shared destination masks a starkly different journey. The UK’s trajectory folds sharply downward and to the right, reflecting the thorough dismantling of its coal industry since the Thatcher era.',
        'In contrast, Germany’s downward slope is flatter and more stubborn. Pushing an energy transition while preserving a massive heavy-industry base means carrying a much heavier structural burden. Decoupling has no universal blueprint.',
      ],
    },
    focusLabel: { zh: '透视不同质的脱钩曲线', en: 'Deconstruct heterogeneous curves' },
    atlasPrompt: { zh: '对比两者的折返角度：谁的转身更凌厉？谁的下行更胶着？', en: 'Compare their angles of return: whose turn is sharper, whose descent more stubborn?' },
    countries: ['GBR', 'DEU'],
    metric: 'co2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['英国呈现陡峭的去煤化急转', '德国带着重工业底盘缓慢下行', '脱钩不存在单一模板'],
      en: ['UK shows a sharp post-coal U-turn', 'Germany descends slowly with heavy industry', 'No single blueprint for decoupling'],
    },
  },
  {
    id: 'us-india',
    order: 4,
    viewMode: 'trajectory',
    kicker: { zh: 'Step 4 · 气候博弈', en: 'Step 4 · The Climate Arena' },
    title: {
      zh: '时差与鸿沟：被折叠的发展阶段',
      en: 'The time gap: Development stages in the climate arena',
    },
    question: {
      zh: '将成熟经济体与新兴国家并置，图表上最刺眼的不再是单向的减排意愿，而是巨大的历史“时差”。',
      en: 'Juxtaposing a mature economy with an emerging one exposes the starkest reality of climate politics: not just a difference in will, but a massive historical time gap.',
    },
    takeaway: {
      zh: '美国在享尽高碳红利后步入下行通道，而印度正处于陡峭的工业化爬坡期。抛开发展阶段谈脱钩，往往会陷入道德陷阱。',
      en: 'The US retreats after decades of high-carbon prosperity, while India scales the steep cliffs of industrialization. Judging decoupling without acknowledging development stages invites a moral trap.',
    },
    body: {
      zh: [
        '美国的轨迹已完成历史性的折返，经济增长终于开始与人均排放脱绑。但这一转身，建立在其早已完成高度工业化和基础设施建设的基础之上。',
        '视线转向印度，它仍在该坐标系的左下方向右上方用力攀爬。对于亟待让数亿人脱贫、构建现代电网的国家而言，温室气体排放的攀升，往往是通向现代化的必经阵痛。',
      ],
      en: [
        'The US trajectory has made its historic pivot, unbinding economic growth from per capita emissions. Yet this turn builds upon a foundation of fully realized industrialization and infrastructure.',
        'Shift the focus to India, still climbing forcefully from the lower-left to the upper-right. For a nation racing to build power grids and lift millions out of poverty, rising emissions are often the unavoidable toll of modernization.',
      ],
    },
    focusLabel: { zh: '直面发展阶段的错位', en: 'Confront the misalignment of stages' },
    atlasPrompt: { zh: '审视工业化爬坡期与后工业化时期的轨迹落差。', en: 'Examine the gap between an industrial climb and a post-industrial retreat.' },
    countries: ['USA', 'IND'],
    metric: 'co2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['美国越过峰值步入下行', '印度正处于陡峭的工业化爬坡期', '历史责任与发展权的博弈'],
      en: ['US retreats past its peak', 'India is in a steep industrial climb', 'The clash of historical duty and right to develop'],
    },
  },
  {
    id: 'high-income',
    order: 5,
    viewMode: 'consumption',
    kicker: { zh: 'Step 5 · 隐形账本', en: 'Step 5 · The Hidden Ledger' },
    title: {
      zh: '戳破幻象：追踪被“外包”的碳足迹',
      en: 'Piercing the illusion: Tracking outsourced carbon',
    },
    question: {
      zh: '发达国家光鲜的“脱钩”成绩单背后，有多少是本土的真实减排，又有多少仅仅是把冒烟的烟囱搬到了发展中国家？',
      en: 'How much of the rich world’s decoupling is a genuine green triumph, and how much is merely an illusion created by offshoring smokestacks to the developing world?',
    },
    takeaway: {
      zh: '当审视的标尺从“生产”切换为“消费”，把进口商品中的碳加回富裕国家账本时，一些原本陡峭的下降曲线变得平缓了。',
      en: 'When the lens shifts from "production" to "consumption"—billing rich nations for the carbon embedded in imports—some of the most impressive downward curves suddenly flatten out.',
    },
    body: {
      zh: [
        '这是一次视角的重置。当我们把指标从生产端切换至消费端 CO2 时，隐藏在国际贸易背后的碳转移浮出水面。',
        '这并非全盘否定高收入国家的脱钩努力，而是为了还原一个更冷酷的真相：本土工厂的关闭不等于消费欲望的降低。碳排放可以被离岸外包，但全球变暖的代价无人能免。',
      ],
      en: [
        'This is a reset of perspective. When we switch the metric from production to consumption-based CO2, the carbon transfers hidden behind global trade emerge from the shadows.',
        'This does not erase the progress made by high-income nations, but it forces a more honest accounting: closing a domestic factory does not extinguish consumer appetite. Carbon can be outsourced, but global warming cannot.',
      ],
    },
    focusLabel: { zh: '算一笔包含国际贸易的碳排放账', en: 'Calculate the carbon toll of global trade' },
    atlasPrompt: { zh: '留意指标切换瞬间，富裕国家曲线的微妙回弹。', en: 'Watch for the subtle upward bounce in rich-country curves when the metric switches.' },
    countries: ['GBR', 'DEU', 'SWE', 'DNK'],
    metric: 'consumptionCo2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['引入消费端 CO2 视角', '揭开国际贸易中的碳转移', '重新评估脱钩的真实含金量'],
      en: ['Introduce consumption-based CO2', 'Reveal carbon transferred via trade', 'Reassess the true weight of decoupling'],
    },
  },
  {
    id: 'tour-explore',
    order: 6,
    viewMode: 'explore',
    kicker: { zh: 'Step 6 · 开放档案', en: 'Step 6 · Open Archive' },
    title: {
      zh: '在庞杂的数据中，寻找你的答案',
      en: 'Interrogate the data to find your own answers',
    },
    question: {
      zh: '任何宏大的气候叙事都不应止步于单向的陈述。全球碳脱钩的版图过于错综复杂，无法用单一逻辑概括。',
      en: 'No grand climate narrative should end as a one-way lecture. The map of global decoupling is far too intricate for a single storyline.',
    },
    takeaway: {
      zh: '现在，图表交回你的手中。真正坚实的结论，永远诞生于反复的交叉印证之中。',
      en: 'Now, the dashboard is yours. The most robust truths are found not in guided tours, but in rigorous, independent cross-examination.',
    },
    body: {
      zh: [
        '你可以拨动时间轴审视历史，切换排放口径追踪碳转移，或是圈选特定的经济体进行比对。',
        '带着记者的怀疑精神去探索吧：或许你会发现，某些在生产端看似完美的环保模范，在消费端依然是贪婪的碳消耗者。去伪存真，用数据测算这个世界的真实温度。',
      ],
      en: [
        'Slide through the decades to examine history, toggle metrics to track carbon leakage, or brush specific economies to contrast their fates.',
        'Explore with a journalist’s skepticism: you might discover that a nation celebrated for domestic greening remains a voracious carbon consumer. Sift the truth from the noise, and use the data to take the real temperature of our world.',
      ],
    },
    focusLabel: { zh: '把提问的权利交还给你', en: 'Handing the power of inquiry back to you' },
    atlasPrompt: { zh: '打破预设路径，运用所有维度去证伪或证实你的猜想。', en: 'Break the guided path. Use every dimension to test your own hypotheses.' },
    countries: ['GBR', 'DEU', 'USA', 'IND'],
    metric: 'co2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['自由调度时间、指标与样本', '寻找常规叙事之外的反面案例', '用数据交叉验证现实'],
      en: ['Freely toggle time, metrics, and samples', 'Look for anomalies outside the official narrative', 'Cross-examine reality with data'],
    },
  },
]