<script setup lang="ts">
import { computed } from 'vue'
import type { Locale } from '../types'

const props = defineProps<{
  locale: Locale
}>()

const content = computed(() =>
  props.locale === 'zh'
    ? {
        eyebrow: 'Methodology',
        title: '数据来源与设计说明',
        intro: '',
        writeupLabel: '',
        sections: [
          {
            title: '1. 旨在解答什么问题',
            paragraphs: [
              '该项目主要关注哪些国家真正实现了碳脱钩，在继续变富的同时减少碳排放？',
            ],
            items: [
              '哪些国家已经实现了经济增长与人均碳排放下降同时发生的绝对脱钩？',
              '这种脱钩从什么时候开始出现，轨迹上是否能看到明确的转折点？',
              '脱钩背后的机制是什么，是能源结构变化、产业结构调整、效率提升，还是把高碳生产转移到了海外？',
              '不同发展阶段的国家是否应当被放在同一个标准下比较，还是需要区分成熟经济体、新兴工业化国家与高收入消费型国家？',
            ],
          },
          {
            title: '2. 数据与处理方式',
            paragraphs: [
              '主要数据来自 Our World in Data CO2 and Greenhouse Gas Emissions dataset、Our World in Data Energy dataset 和 World Bank country metadata。',
              '前两者提供国家年度 CO2 排放、生产端排放、人均排放、消费端排放、GDP、人口、一次能源消费、化石能源占比、低碳能源占比、可再生能源占比、煤炭占比等字段；World Bank 元数据用于补充国家代码、地区和收入组。',
              '项目在原始字段基础上计算了若干派生指标：',
            ],
            items: [
              '`gdpPerCapita`：人均 GDP，用于衡量经济增长。',
              '`co2PerCapita`：人均生产端 CO2 排放，用于衡量本土生产活动产生的碳排放。',
              '`consumptionCo2PerCapita`：人均消费端 CO2 排放，用于观察进口商品中隐含的碳排放。',
              '`carbonIntensity`：每 1,000 美元 GDP 对应的 CO2 排放吨数，用于衡量经济活动的碳效率。',
              '`consumptionProductionGap`：消费端与生产端排放差值，用于判断一个国家是否可能通过外包高碳生产获得“表面脱钩”。',
              '`decouplingStartYear`：连续出现 GDP 增长且人均 CO2 下降的起始年份。',
              '`turningPointYear`：排放峰值或轨迹转向发生的年份。',
              '`trajectoryType`：根据 GDP 与排放变化将国家划分为绝对脱钩、相对脱钩、增长伴随排放、波动/数据不足等类型。',
            ],
          },
          {
            title: '3. 设计决策',
            paragraphs: [
              '项目采用阅读 + 探索的双页面结构。',
              '阅读页是一条六步 guided tour。读者向下阅读时，右侧图表会自动切换到对应步骤的国家、年份和指标：先看全球象限，再突出真正进入右下象限的绝对脱钩国家，然后比较英国与德国、美国与印度，接着切换到消费端排放，最后进入数据探索。',
              '探索页延续上次作业的设计，保留完整控件。读者可以在全球散点图中缩放、悬停、点击和框选国家，再进入国家路径、机制解释与类型总结。这部分保留了分析工具的自由度，让读者在读完故事后继续比较不同国家和指标。',
            ],
          },
          {
            title: '4. 交互决策',
            paragraphs: ['交互上，项目重点实现了几类操作：'],
            items: [
              '滚动驱动图表切换：guided tour 步骤进入视口时，右侧图表自动更新。',
              '章节点击跳转：用户也可以直接点击章节标题切换到对应图表。',
              '悬停高亮：在故事图和探索图中，鼠标靠近国家轨迹或点位时会高亮并显示关键信息。',
              '语义缩放：散点图可以放大，但点的半径不会跟着无限变大，避免放大后仍然拥挤。',
              '框选与取消选择：用户可以刷选一组国家，也可以再次点击已选国家取消选择。刷选后，信息面板会计算集合特征，包括主要地区、高收入占比、平均 GDP 变化、平均排放变化、平均可再生能源变化和消费端高于生产端的国家数。',
              '聚光灯模式：选中国家时，其他国家弱化，帮助读者把注意力集中到当前对象。',
            ],
          },
          {
            title: '5. 被考虑但没有采用的方案',
            paragraphs: [
              '最初方案更接近传统 Dashboard：顶部放置几个按钮，点击后切换图表状态。这个方案实现简单，但阅读体验较割裂，用户需要先理解按钮含义，再主动决定看什么。最终改为滚动叙事，是因为项目的核心目标不是展示所有数据，而是先带读者理解“脱钩”的判断逻辑。',
              '项目也考虑过只使用折线图展示 GDP 与 CO2 的时间变化。但折线图需要读者在两条曲线之间来回比较，难以直接看到“经济继续增长、排放开始下降”的转向。因此最终选择“总览散点图 + 连线散点图”的组合：前者建立象限判断，后者解释国家路径如何进入这些象限。',
              '在全球总览中，如果完整展示所有极端值，大多数国家会被压缩在图表一角，无法辨认。直接删除极端值会损害数据完整性，因此最终采用坐标轴截断与边缘标记的折中方案。',
            ],
          },
          {
            title: '6. 开发过程与分工',
            paragraphs: [
              '在上次作业的基础上，尝试完整讲述碳脱钩这一现象，而不是只有可视化图表，所以构建了阅读页面，结合可视化工具向读者阐释什么是碳脱钩，又有哪些国家实现了碳脱钩。',
              '该项目为个人项目，所有工作由一人完成，大概用时 2 周。',
              '最耗时的部分是滚动叙事与图表联动以及叙事语言。相比静态图表，滚动叙事需要同时处理章节定位、图表状态切换、图表高度、移动端布局和用户手动点击跳转。如果这些细节处理不好，读者会感到文字和图表对不上。另一个耗时点是拥挤散点图的可读性优化，包括坐标轴截断、气泡半径限制、悬停命中区域和选中后的视觉层级。',
            ],
          },
        ],
      }
    : {
        eyebrow: 'Methodology',
        title: 'Data sources and design decisions',
        intro: 'This section mirrors the project write-up: research questions, data processing, design choices, interaction decisions, and development process.',
        writeupLabel: 'Full project write-up (Markdown)',
        sections: [
          {
            title: '1. Research questions',
            paragraphs: [
              'The project asks which countries have really decoupled carbon from growth: continuing to become richer while reducing carbon emissions.',
            ],
            items: [
              'Which countries have achieved absolute decoupling, with GDP growth and falling CO2 emissions per capita happening at the same time?',
              'When does that decoupling begin, and can the trajectory reveal a clear turning point?',
              'What mechanisms may sit behind the change: energy mix, industrial structure, efficiency gains, or shifting carbon-intensive production overseas?',
              'Should countries at different development stages be compared by one standard, or separated into mature economies, emerging industrial economies, and high-income consumer economies?',
            ],
          },
          {
            title: '2. Data and processing',
            paragraphs: [
              'The main datasets are Our World in Data CO2 and Greenhouse Gas Emissions, Our World in Data Energy, and World Bank country metadata.',
              'The first two provide annual CO2 emissions, production-based emissions, per-capita emissions, consumption-based emissions, GDP, population, energy consumption, fossil fuel share, low-carbon share, renewable share, and coal share. World Bank metadata adds country codes, regions, and income groups.',
              'The project calculates several derived fields from the raw data:',
            ],
            items: [
              '`gdpPerCapita`: GDP per capita, used to measure economic growth.',
              '`co2PerCapita`: production-based CO2 emissions per capita.',
              '`consumptionCo2PerCapita`: consumption-based CO2 emissions per capita.',
              '`carbonIntensity`: tonnes of CO2 per $1,000 of GDP, used as a measure of carbon efficiency.',
              '`consumptionProductionGap`: the gap between consumption-based and production-based emissions.',
              '`decouplingStartYear`: the first year in a run of GDP growth with falling CO2 per capita.',
              '`turningPointYear`: the year of an emissions peak or trajectory turn.',
              '`trajectoryType`: a classification based on GDP and emissions change.',
            ],
          },
          {
            title: '3. Design decisions',
            paragraphs: [
              'The project uses a two-page structure: reading plus exploration.',
              'The reading page is a six-step guided tour. As the reader scrolls, the chart switches to the relevant countries, years, and metrics: a global quadrant view, absolute decoupling cases, the United Kingdom and Germany, the United States and India, consumption-based emissions, and finally open exploration.',
              'The exploration page keeps the full set of controls. Readers can zoom, hover, click, and brush countries in the global scatterplot, then move into country trajectories, mechanism views, and typology summaries.',
            ],
          },
          {
            title: '4. Interaction decisions',
            paragraphs: ['The project focuses on several interaction patterns:'],
            items: [
              'Scroll-driven chart changes in the guided tour.',
              'Chapter click navigation for direct jumps.',
              'Hover highlighting in both story and exploration charts.',
              'Semantic zooming in the scatterplot, keeping point radius under control.',
              'Brush selection and deselection, with a summary panel for selected groups.',
              'Focus-and-context mode, where selected countries stay prominent while others fade back.',
            ],
          },
          {
            title: '5. Alternatives considered',
            paragraphs: [
              'The initial plan was closer to a traditional dashboard, with several buttons at the top for switching chart states. It was simpler to implement, but it made the reading experience fragmented. The final version uses scrollytelling because the goal is to teach the logic of decoupling before exposing the full dataset.',
              'The project also considered using only line charts for GDP and CO2 over time. Line charts show temporal change, but they make it harder to see the moment when GDP continues to rise while emissions turn downward. The final design combines an overview scatterplot with connected scatterplots.',
              'For the global overview, showing all outliers at full scale compressed most countries into one corner. Removing outliers would damage data integrity, so the final chart uses axis clipping with edge markers.',
            ],
          },
          {
            title: '6. Development process and division of work',
            paragraphs: [
              'Building on the previous assignment, this project tries to tell a complete story about carbon decoupling instead of presenting charts alone. The reading page explains what decoupling means and which countries appear to have achieved it.',
              'This is an individual project. All work was completed by one person over roughly two weeks.',
              'The most time-consuming parts were the scroll-driven narrative, chart synchronization, and writing. Scrollytelling required handling chapter detection, chart state changes, chart height, mobile layout, and manual chapter jumps. Another major effort was improving the readability of a crowded scatterplot through axis clipping, radius limits, hover targeting, and visual focus states.',
            ],
          },
        ],
      },
)
</script>

<template>
  <section id="method-section" class="method-stage">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h2>{{ content.title }}</h2>
      </div>
      <div class="method-stage__summary">
        <p class="panel-copy panel-copy--wide">{{ content.intro }}</p>
        <a class="method-doc-link" href="final_project_writeup.md" target="_blank" rel="noreferrer">
          {{ content.writeupLabel }}
        </a>
      </div>
    </div>

    <div class="method-list">
      <article v-for="section in content.sections" :key="section.title" class="method-row">
        <h3 class="method-row__title">{{ section.title }}</h3>
        <div class="method-row__body">
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          <ul v-if="'items' in section && section.items?.length" class="method-row__list">
            <li v-for="item in section.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>
