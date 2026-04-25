import type { StoryChapterScript } from '../types'

export const storyChapters: StoryChapterScript[] = [
  {
    id: 'uk-germany',
    order: 1,
    kicker: { zh: '欧洲样本', en: 'European cases' },
    title: {
      zh: '优等生的不同配方：英国与德国的“脱钩”镜像',
      en: 'Different recipes for the same prize: the UK and Germany as decoupling mirrors',
    },
    question: {
      zh: '在欧洲最常被拿来举例的两个样本里，真正值得比较的不是谁先进入理想象限，而是谁是靠什么转过去的。',
      en: 'In two of Europe’s most cited cases, the more revealing question is not who reaches the ideal quadrant first, but what kind of transition carries them there.',
    },
    takeaway: {
      zh: '同样是脱钩，一个是果断的结构剥离，另一个是沉重的工业转身。碳脱钩从来不存在一种通用模板。',
      en: 'Both are decoupling stories, but one is a rapid structural break while the other is a slower industrial turn. There is no single template for decoupling.',
    },
    body: {
      zh: [
        '在探讨经济增长如何摆脱碳排放的引力时，英国和德国几乎总会被一起提起。在图表上，它们的轨迹最终都落入了“增长继续、排放回落”的理想象限，但通往终点的路径却并不相同。',
        '代表英国的轨迹几乎像一次陡峭的“坠落”。这背后是激进的去煤炭化，以及向服务业倾斜的经济重组。相比之下，德国的曲线虽然也在向下弯折，却更平缓、更崎岖。作为保留了庞大重工业基础的国家，德国的转型不仅依赖淘汰化石燃料，也依赖艰难的能源系统重构。',
      ],
      en: [
        'When people ask how growth begins to break free from carbon emissions, the UK and Germany are among the first European examples to appear. On the chart, both eventually fall into the ideal zone where growth continues while emissions recede, but the path into that zone is not the same.',
        'The UK’s line looks almost like a drop. Behind it sits aggressive coal phaseout and a broader shift toward services. Germany bends downward too, but more slowly and with more friction. For a country that kept a large industrial base, the turn depends not only on phasing out fossil fuels, but on the harder work of rebuilding the energy system itself.',
      ],
    },
    focusLabel: { zh: '两个优等生，不同的转型配方', en: 'Two top students, two different recipes' },
    atlasPrompt: {
      zh: '继续往下看时，最值得比较的是谁先离开煤炭、谁的弯折更陡，以及这条线是不是建立在更深的结构性变化上。',
      en: 'Further down, the useful comparison is who exits coal earlier, whose turn is steeper, and whether the bend rests on a deeper structural shift.',
    },
    countries: ['GBR', 'DEU'],
    metric: 'co2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['英国更早退出煤炭', '德国路径更平缓', '同属脱钩，但机制并不完全相同'],
      en: [
        'The UK exits coal earlier',
        'Germany follows a steadier path',
        'Both decouple, but not through the same mechanism',
      ],
    },
  },
  {
    id: 'us-india',
    order: 2,
    kicker: { zh: '发展阶梯', en: 'Development ladder' },
    title: {
      zh: '历史时钟的错位：美国与印度的发展阶梯',
      en: 'Out of sync on the historical clock: the development ladder of the US and India',
    },
    question: {
      zh: '如果把成熟经济体和新兴经济体放在同一张图上，真正显眼的往往不是谁更努力减排，而是谁仍在不同的历史刻度上。',
      en: 'When a mature economy and an emerging one are placed on the same chart, what stands out is often not effort, but the fact that they still live on different historical clocks.',
    },
    takeaway: {
      zh: '这两条南辕北辙的轨迹并不是谁更环保的比较，而是一张全球发展阶梯图：发达国家正在下山，发展中国家仍在艰难登顶。',
      en: 'These opposing trajectories are less a contest over who is greener than a map of the global development ladder: rich economies are descending from the peak while emerging ones are still climbing toward it.',
    },
    body: {
      zh: [
        '如果强行把成熟经济体和新兴经济体放在同一个维度里比拼“减排努力”，就会忽略一个最残酷的现实：它们正处在历史时钟的不同刻度上。',
        '美国的轨迹已经越过工业化时代的排放巅峰，如今凭借能源替代和效率提升，线条开始确凿地向右下方掉头。另一端的印度，则仍在左下方奋力向右上角攀爬。对于一个人口庞大、仍需完成工业化和基础设施扩张的国家来说，排放绝对值的上升，在现阶段几乎是一种物理规律。',
      ],
      en: [
        'If a mature economy and an emerging one are forced into the same simple contest over climate effort, the most uncomfortable fact disappears: they are not living at the same point on the historical clock.',
        'The US has already passed the emissions peak of industrialization, and its line now bends down with the help of fuel switching and efficiency gains. India, by contrast, is still climbing toward the upper-right. For a country with vast population pressures and unfinished industrialization, a rising absolute emissions line is close to a structural rule of the phase it is in.',
      ],
    },
    focusLabel: { zh: '同一张图，不同的历史刻度', en: 'One chart, different historical clocks' },
    atlasPrompt: {
      zh: '再往下看时，可以继续比较两国的转折、碳强度和消费端差值，但不要忘记先把它们放回各自的发展阶段里理解。',
      en: 'Further down, compare turning points, carbon intensity, and the consumption gap, but keep each country anchored in its own stage of development.',
    },
    countries: ['USA', 'IND'],
    metric: 'co2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['美国排放强度回落更明显', '印度仍处于增长伴随排放阶段', '发展阶段是关键解释维度'],
      en: [
        'The US shows a clearer intensity decline',
        'India still grows with emissions',
        'Development stage is a key explanatory dimension',
      ],
    },
  },
  {
    id: 'china',
    order: 3,
    kicker: { zh: '复杂样本', en: 'A complex case' },
    title: {
      zh: '巨人的拐点：中国轨迹的平台期信号',
      en: 'A giant near the bend: plateau signals in China’s trajectory',
    },
    question: {
      zh: '面对全球体量最大、增长速度最快的经济体，真正值得追问的也许不是“是否已经脱钩”，而是“这条曲线是否终于露出了拐点”。',
      en: 'For the world’s largest and fastest-growing major economy, the more revealing question may not be whether it has decoupled, but whether the line has finally begun to reveal a bend.',
    },
    takeaway: {
      zh: '对于中国这样的复杂样本，终点坐标并不比线条顶部出现的弯折更重要。真正决定未来的，是平台期能否继续演化成清晰的掉头。',
      en: 'For a case as complex as China, the end point matters less than the slight bend appearing at the top of the line. What matters now is whether that plateau can turn into a clear descent.',
    },
    body: {
      zh: [
        '面对全球绝对体量最大、增长速度最快的经济体，非黑即白的“是否已经脱钩”并不是一个好问题。真正的悬念在于，这条庞大而陡峭的曲线，是否已经开始显露疲态，甚至准备掉头。',
        '过去二十年里，中国的轨迹几乎是一条势不可挡的右上斜线，那是“世界工厂”全速运转留下的碳足迹。但当目光落到曲线末端，变化正在悄悄出现。随着新能源投资、电动车扩张和重工业增速放缓，这条线正在经历微妙的平台化。',
      ],
      en: [
        'For the world’s largest and fastest-growing major economy, a binary question about whether it has already decoupled is a poor one. The more interesting suspense lies in whether this vast and steep trajectory is beginning to tire, flatten, and perhaps prepare to turn.',
        'For two decades, China’s path looked almost like an unstoppable march toward the upper-right, the carbon trace of a factory floor running at full speed. But at the very end of the curve, a subtler change begins to appear. With massive clean-energy investment, electric vehicle uptake, and slower heavy-industry growth, the line starts to show signs of a plateau.',
      ],
    },
    focusLabel: { zh: '先看平台期，再看是否掉头', en: 'First the plateau, then the turn' },
    atlasPrompt: {
      zh: '继续往下看时，最关键的是把峰值年份、平台期、低碳化信号放在一起观察，而不是只盯住一个终点坐标。',
      en: 'Further down, the key is to read the peak year, the plateau, and the low-carbon signals together instead of staring at a single end point.',
    },
    countries: ['CHN'],
    metric: 'co2PerCapita',
    startYear: 2000,
    endYear: 2022,
    annotationBullets: {
      zh: ['规模巨大仍处右上区域', '更重要的是观察转折点', '机制解释比简单分类更重要'],
      en: [
        'A very large right-upper-quadrant case',
        'The turning point matters more than the binary label',
        'Mechanism matters more than simple classification',
      ],
    },
  },
  {
    id: 'high-income',
    order: 4,
    kicker: { zh: '富裕国家', en: 'Affluent countries' },
    title: {
      zh: '幻象与实质：富裕国家真的“脱钩”了吗？',
      en: 'Illusion versus substance: have rich countries really decoupled?',
    },
    question: {
      zh: '进入高收入俱乐部之后，那枚“绿色转型成功”的勋章，究竟有多少是实打实的减排，又有多少只是把烟囱挪到了别处？',
      en: 'Inside the high-income club, how much of the green transition medal rests on real cuts at home, and how much simply comes from moving the smokestacks elsewhere?',
    },
    takeaway: {
      zh: '有些转弯来自真实的能源和技术革命，有些则只是把高碳制造业移出国境。分辨这两者，是读懂全球碳格局的最后一把钥匙。',
      en: 'Some turns are built on real technological and energy shifts, while others rely on moving carbon-intensive production abroad. Telling the difference is the final key to reading the global carbon map.',
    },
    body: {
      zh: [
        '进入高收入俱乐部，似乎就自动获得了一枚“绿色转型成功”的勋章。但当视角从单一的生产端排放移开，这张漂亮成绩单上立刻浮现出裂痕。',
        '在高收入国家纠缠交错的轨迹里，有些国家通过深度发展清洁能源，确实压低了本土排放；但也有一部分国家，其华丽的“脱钩”建立在将高耗能制造业外包给海外的基础之上。如果把满足国内消费所对应的隐藏碳排放也算进来，那条原本漂亮的脱钩弧线就会立刻显得没那么陡峭。',
      ],
      en: [
        'Entry into the high-income club often comes with an easy assumption of green success. But the moment the lens shifts away from production-based emissions alone, cracks begin to show in that neat report card.',
        'Among the tangled trajectories of rich countries, some really do suppress domestic emissions through deep clean-energy transitions. Others, however, owe part of their elegant-looking decoupling to outsourcing carbon-intensive production abroad. Once hidden emissions embodied in consumption are counted back in, some of the most graceful curves immediately look much less steep.',
      ],
    },
    focusLabel: { zh: '谁是真的转型，谁只是外包了排放', en: 'Real transition or outsourced emissions' },
    atlasPrompt: {
      zh: '继续往下看时，把消费端差值和路径分类放在一起读，往往最能看出一条“成功曲线”到底有多少是幻象。',
      en: 'Further down, the cleanest test is to read the consumption gap alongside the path types and ask how much of a successful curve is substance and how much is illusion.',
    },
    countries: ['DEU', 'GBR', 'SWE', 'DNK'],
    metric: 'consumptionCo2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['高收入不等于同一种脱钩', '消费端与生产端差值揭示质量差异', '需要从 typology 总结全球格局'],
      en: [
        'High income does not imply one single decoupling pattern',
        'Consumption-production gaps reveal quality differences',
        'Typology is needed to summarize the broader pattern',
      ],
    },
  },
]
