import type { StoryChapterScript } from '../types'

export const guidedTourSteps: StoryChapterScript[] = [
  {
    id: 'tour-global',
    order: 1,
    viewMode: 'overview',
    kicker: { zh: '01 · 全局', en: '01 · Global picture' },
    title: {
      zh: '经济增长，必须以排放为代价吗？',
      en: 'Does economic growth still have to raise emissions?',
    },
    question: {
      zh: '衡量各国减排成效的核心维度，不仅在于绝对排放量的削减，更在于经济增长与碳排放趋势的动态关系。',
      en: 'Plotted on one chart, the key question is not only who emits most, but whether emissions per person still rise after growth.',
    },
    takeaway: {
      zh: '右上角意味着经济增长依然与较高的人均排放深度绑定；右下角意味着经济保持正向增长，但人均排放已呈现下降趋势。',
      en: 'The lower-right is the region to watch: GDP per person rises while emissions per person fall.',
    },
    body: {
      zh: [
        '图中展示了 1990 年至 2022 年间各国的演化轨迹。',
        '右上角：经济增长依然与较高的人均排放深度绑定。',
        '右下角：经济保持正向增长，但人均排放已呈现下降趋势。',
      ],
      en: [
        'The horizontal axis shows the change in GDP per capita, while the vertical axis shows the change in production-based CO2 per capita. Each dot is a country’s movement from 1990 to 2022.',
        'The upper-right means growth still comes with higher emissions. The lower-right marks a stricter form of decoupling: growth continues while emissions per person fall.',
      ],
    },
    focusLabel: { zh: '先看四个象限', en: 'Start with the four quadrants' },
    atlasPrompt: { zh: '右下角代表经济增长与人均排放下降同时出现。', en: 'The lower-right shows growth with falling emissions per person.' },
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
    kicker: { zh: '02 · 绝对脱钩', en: '02 · Absolute decoupling' },
    title: {
      zh: '谁真正实现了经济与排放的绝对脱钩',
      en: 'Who has started to pull the two lines apart',
    },
    question: {
      zh: '“绝对脱钩”的达成，要求在维持经济正向扩张的同时，实现人均二氧化碳排放的实质性下降。',
      en: 'Absolute decoupling means growth continues while CO2 emissions per person fall. It is harder than simply being low-emitting, because it happens after growth.',
    },
    takeaway: {
      zh: '同象限并不等于同方法。能源替代、产业升级与全球贸易分工，都可能参与塑造一条脱钩曲线。',
      en: 'Sharing the lower-right does not mean sharing one path. Coal phaseout, industrial change, energy mix, and trade can all play a role.',
    },
    body: {
      zh: [
        '相较于低发展阶段的“原生性低排放”，这种在跨越经济增长临界点后实现的逆转，具有更高的转型壁垒与指标价值。',
        '在右下象限区域的样本国家展现出一个核心共性：人均 GDP 持续攀升，而人均排放规模已成功回落至 1990 年之下。',
        '然而，同象限并不等于同方法。部分国家得益于激进的能源替代战略，如加速推进煤炭产能退出，或构建以清洁电力为主导的能源网络。',
        '伴随工业升级与服务业扩张，经济增长对高耗能产业的依赖度显著降低。部分国家在生产端实现脱钩，也可能与高碳排放产业的跨境转移有关。',
      ],
      en: [
        'These countries share one fact: GDP per person rose while emissions per person ended below the starting year.',
        'But the mechanism can differ. Some reduced coal quickly, some leaned on low-carbon power, and some need to be checked against consumption-based emissions.',
      ],
    },
    focusLabel: { zh: '右下象限里的国家', en: 'Countries in the lower-right' },
    atlasPrompt: { zh: '右下象限说明结果，机制还需要继续看。', en: 'The lower-right shows the outcome; the mechanism still needs checking.' },
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
    kicker: { zh: '03 · 欧洲样本', en: '03 · European cases' },
    title: {
      zh: '英国与德国',
      en: 'The UK and Germany: one quadrant, two paths',
    },
    question: {
      zh: '英国与德国均已成功跨越碳排放峰值，实现了经济增长与碳排放的绝对脱钩。然而，两国在坐标系中的演化轨迹却呈现出显著的形态差异，脱钩曲线截然不同。',
      en: 'Both countries passed their emissions peaks, but their paths differ. The UK falls more sharply; Germany turns more gradually.',
    },
    takeaway: {
      zh: '英国更像快速剥离煤炭与高碳产业后的陡峭折返；德国则是在保留制造业基础的同时推进转型，路径更长也更复杂。',
      en: 'The UK’s coal share falls faster; Germany’s heavier industrial base is reflected in a slower curve.',
    },
    body: {
      zh: [
        '英国模式：从图可见，英国的轨迹在较早阶段便向右下方果断折返，曲线下行更为陡峭。这一快速脱钩的形态，主要归因于其深度的经济结构重塑。',
        '随着服务业在国民经济中占比的显著攀升，叠加能源供给端激进的“煤炭退出”进程，英国得以在相对较短的周期内实现了碳排放的迅速剥离。',
        '德国模式：相比之下，德国虽然同样保持下行趋势，但其降碳的幅度和速率更为平缓。',
        '作为传统工业强国，德国在推进能源系统绿色转型的同时，依然固守了较高比重的重资产制造业基础。这种“保制造业+促转型”的双线并行约束，使其脱钩路径显得更为漫长且复杂。',
      ],
      en: [
        'The end point looks similar, but the process does not. The UK bends earlier toward the lower-right, alongside coal phaseout and broader structural change.',
        'Germany also declines, but more slowly. Keeping a stronger manufacturing base while changing the energy system makes the path longer and more complicated.',
      ],
    },
    focusLabel: { zh: '比较转弯的速度', en: 'Compare the speed of the turn' },
    atlasPrompt: { zh: '英国更陡，德国更缓。', en: 'The UK bends sharply; Germany bends more gradually.' },
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
    kicker: { zh: '04 · 发展阶段', en: '04 · Development stage' },
    title: {
      zh: '美国与印度',
      en: 'The US and India: different stages of development',
    },
    question: {
      zh: '还需注意的一个关键结构性变量是发展阶段。成熟经济体与新兴经济体在图表中的轨迹差异，往往源于其所处的经济周期，而不仅是减排政策或意愿的直接体现。',
      en: 'When mature and emerging economies share a chart, the difference often comes from development stage, not only climate ambition.',
    },
    takeaway: {
      zh: '美国处于后工业化脱钩阶段，印度仍处于工业化爬升阶段。两条轨迹背后，是不同发展阶段对能源与基础设施的不同需求。',
      en: 'The US is moving down from a high-emissions phase; India is still expanding infrastructure and industry.',
    },
    body: {
      zh: [
        '美国，后工业化脱钩阶段：其轨迹已明确转向右下方，进入了“人均 GDP 增长”与“人均排放下降”并行的“绝对脱钩”通道。',
        '这标志着一个经济体在完成大规模工业化和基础设施建设后，其增长动能更多源自技术创新、服务业扩张和能源效率提升，从而具备了与碳排放解绑的结构性条件。',
        '印度，工业化爬升阶段：其轨迹仍坚定地指向右上方。对于一个正处于大规模基础设施建设、工业化进程和能源普及阶段的国家而言，人均排放的增长与满足基础发展需求紧密耦合。',
        '在此阶段，排放增长是经济扩张的伴生结果，而非孤立的环境议题。',
      ],
      en: [
        'The US line has moved toward the lower-right, showing growth together with falling emissions per person.',
        'India still moves toward the upper-right. For a country still building power grids, transport, and industry, rising emissions often arrive with development needs.',
      ],
    },
    focusLabel: { zh: '发展阶段影响轨迹', en: 'Development stage shapes the path' },
    atlasPrompt: { zh: '一个在回落，一个仍在爬坡。', en: 'One is falling back; the other is still climbing.' },
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
    kicker: { zh: '05 · 消费端', en: '05 · Consumption view' },
    title: {
      zh: '生产端与消费端的博弈',
      en: 'Counting the carbon embedded in imports',
    },
    question: {
      zh: '本土生产端排放的下降，并不等同于真实消费碳足迹的同步缩减。在全球化贸易分工的背景下，高碳排放产业的跨境转移往往将污染“外包”，形成显著的“碳泄漏”效应。',
      en: 'Falling production emissions do not always mean the consumption footprint falls as much. Trade can move part of the footprint abroad.',
    },
    takeaway: {
      zh: '引入消费端视角，并非全盘否定高收入经济体已取得的绝对脱钩进展，而是建立一个更严苛的评估基准。',
      en: 'The consumption lens makes some high-income declines look less steep.',
    },
    body: {
      zh: [
        '为了更精准地评估一国的真实减排力度，必须厘清两种统计口径的根本差异。',
        '生产端口径：仅核查一国地理边界内发生的直接物理排放。这也是本图表当前采用的基础维度。',
        '消费端口径：实施全生命周期的穿透式核算，将该国进口商品和服务流转链条中的“隐含碳排放”重新计入本国碳账本。',
        '本土制造业的去碳化，与国民整体消费足迹的缩减，实质上是两个不同维度的命题。',
        '若将纵轴切换为“消费端人均 CO2 排放”，原图表右下象限的格局将发生微调：部分依赖高碳商品进口的高收入国家，其原本陡峭的“下行脱钩曲线”将被显著平滑化。',
        '这意味着，其表面上的急速减排成效中，有一部分实质上是利用全球贸易体系实现的“排放转移”。',
      ],
      en: [
        'Production-based accounting counts emissions within national borders; consumption-based accounting adds back emissions embodied in imported goods.',
        'This does not erase decoupling progress, but it separates domestic emissions from the footprint attached to consumption.',
      ],
    },
    focusLabel: { zh: '生产端之外的消费足迹', en: 'The footprint beyond production' },
    atlasPrompt: { zh: '生产端和消费端的差距会改变脱钩质量的判断。', en: 'The production-consumption gap changes how decoupling quality is read.' },
    countries: ['GBR', 'DEU', 'SWE', 'DNK'],
    metric: 'consumptionCo2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['引入消费端 CO2 视角', '揭开国际贸易中的碳转移', '重新评估脱钩的真实含金量'],
      en: ['Introduce consumption-based CO2', 'Reveal carbon transferred via trade', 'Reassess the true weight of decoupling'],
    },
  },
]
