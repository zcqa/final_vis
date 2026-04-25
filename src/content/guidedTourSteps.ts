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
      zh: '把各国放在同一张图上，关键不只是绝对排放量有多高，而是经济增长之后，人均排放还在上升还是已经回落。',
      en: 'Plotted on one chart, the key question is not only who emits most, but whether emissions per person still rise after growth.',
    },
    takeaway: {
      zh: '右下角的国家最值得关注：人均 GDP 增长，人均排放下降。',
      en: 'The lower-right is the region to watch: GDP per person rises while emissions per person fall.',
    },
    body: {
      zh: [
        '横轴是人均 GDP 的变化，纵轴是人均生产端 CO2 的变化。每个点代表一个国家从 1990 年到 2022 年的位置变化。',
        '右上角意味着增长仍伴随更高排放；右下角则代表更严格的脱钩：经济继续增长，人均排放已经下降。',
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
      zh: '谁已经把两条线拉开',
      en: 'Who has started to pull the two lines apart',
    },
    question: {
      zh: '绝对脱钩指的是经济继续增长，同时人均 CO2 排放下降。这比单纯低排放更难，因为它发生在增长之后。',
      en: 'Absolute decoupling means growth continues while CO2 emissions per person fall. It is harder than simply being low-emitting, because it happens after growth.',
    },
    takeaway: {
      zh: '同处右下象限，并不代表路径相同。煤炭退出、产业变化、能源结构和贸易分工都可能参与其中。',
      en: 'Sharing the lower-right does not mean sharing one path. Coal phaseout, industrial change, energy mix, and trade can all play a role.',
    },
    body: {
      zh: [
        '这些国家的共同点，是人均 GDP 在提高，人均排放却低于起点年份。',
        '但同一个象限下面仍然有不同机制。有些国家快速减少煤炭，有些国家依赖低碳电力，也有些国家需要进一步检查消费端排放。',
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
      zh: '英国与德国：同一个象限，两种路径',
      en: 'The UK and Germany: one quadrant, two paths',
    },
    question: {
      zh: '两国都越过了排放峰值，但轨迹并不一样。英国下降更陡，德国转向更平缓。',
      en: 'Both countries passed their emissions peaks, but their paths differ. The UK falls more sharply; Germany turns more gradually.',
    },
    takeaway: {
      zh: '英国的煤炭占比下降更快；德国的工业基础更重，曲线也更缓。',
      en: 'The UK’s coal share falls faster; Germany’s heavier industrial base is reflected in a slower curve.',
    },
    body: {
      zh: [
        '终点相似，过程不同。英国的轨迹更早向右下方折返，和煤炭退出、服务业占比提高等结构变化有关。',
        '德国同样下降，但幅度和速度更缓。保留较强制造业基础的同时推进能源转型，让它的路径更长也更复杂。',
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
      zh: '美国与印度：不在同一个发展阶段',
      en: 'The US and India: different stages of development',
    },
    question: {
      zh: '把成熟经济体和新兴经济体放在一起时，轨迹差异常常来自发展阶段，而不只是减排意愿。',
      en: 'When mature and emerging economies share a chart, the difference often comes from development stage, not only climate ambition.',
    },
    takeaway: {
      zh: '美国已经从高排放阶段回落；印度仍处于基础设施和工业化扩张期。',
      en: 'The US is moving down from a high-emissions phase; India is still expanding infrastructure and industry.',
    },
    body: {
      zh: [
        '美国的线条已经向右下方移动，说明经济增长与人均排放下降同时发生。',
        '印度仍在向右上方移动。对仍在建设电网、交通和工业体系的国家来说，排放增长往往与发展需求同时出现。',
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
      zh: '把进口商品里的碳算回来',
      en: 'Counting the carbon embedded in imports',
    },
    question: {
      zh: '生产端排放下降并不总等于消费端足迹同步下降。贸易会把一部分排放转移到国境之外。',
      en: 'Falling production emissions do not always mean the consumption footprint falls as much. Trade can move part of the footprint abroad.',
    },
    takeaway: {
      zh: '消费端口径会让一些高收入国家的下降曲线变得不那么陡。',
      en: 'The consumption lens makes some high-income declines look less steep.',
    },
    body: {
      zh: [
        '生产端口径只计算本国境内排放；消费端口径则把进口商品中隐含的排放也算回来。',
        '这不会否定所有脱钩进展，但会提醒读者：本土排放下降和消费足迹下降不是同一件事。',
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
  {
    id: 'tour-explore',
    order: 6,
    viewMode: 'explore',
    kicker: { zh: '06 · 数据探索', en: '06 · Data explorer' },
    title: {
      zh: '进入完整数据',
      en: 'Open the full data view',
    },
    question: {
      zh: '全球脱钩不是单一故事。不同年份、地区和排放口径会得到不同切片。',
      en: 'Global decoupling is not one story. Different years, regions, and emissions metrics produce different slices.',
    },
    takeaway: {
      zh: '探索页保留所有控件，用于比较国家、筛选区域和检查机制指标。',
      en: 'The explorer keeps the controls open for comparing countries, filtering regions, and checking mechanism indicators.',
    },
    body: {
      zh: [
        '时间范围、排放指标、地区和收入组都可以重新选择。',
        '框选一组国家后，可以查看它们的共同特征，包括主要地区、高收入占比、平均排放变化和消费端差值。',
      ],
      en: [
        'The time window, emissions metric, region, and income group can all be changed. The scatterplot supports zooming, clicking, and brushing.',
        'After brushing a set of countries, the page summarizes their shared traits, including main region, high-income share, average emissions change, and consumption gap.',
      ],
    },
    focusLabel: { zh: '切换到探索页', en: 'Move to the explorer' },
    atlasPrompt: { zh: '完整控件保留在数据探索页。', en: 'The full controls live in the data explorer.' },
    countries: ['GBR', 'DEU', 'USA', 'IND'],
    metric: 'co2PerCapita',
    startYear: 1990,
    endYear: 2022,
    annotationBullets: {
      zh: ['切换时间、指标与样本', '刷选国家集合', '查看机制指标'],
      en: ['Change time, metrics, and samples', 'Brush country groups', 'Inspect mechanism indicators'],
    },
  },
]
