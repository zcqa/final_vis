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
        intro:
          '这一部分整理数据来源、设计决策和局限性，用来补足正文之外的方法说明。',
        sections: [
          {
            title: '研究问题',
            paragraphs: [
              '核心问题是：哪些国家已经把经济增长和排放拉开，哪些还没有，差别又是从什么时候开始出现的。',
              '所以这里不只看一个象限，而是把总览、路径、机制和分型放在一起看。',
            ],
          },
          {
            title: '设计决策',
            paragraphs: [
              '最上面先用四个章节把读者带进来，再把控制权交给 Atlas。前一部分负责讲清楚，后一部分负责让人自己验证。',
              '总览散点图回答“谁在哪”；connected scatter 回答“它是怎么走过去的”；机制视图再补一句“这条路径背后可能发生了什么”。',
            ],
          },
          {
            title: '备选方案',
            paragraphs: [
              '如果只用普通折线图，看得见时间变化，却不容易一眼看出“GDP 还在往右走，但排放已经往下掉头”这件事。',
              '如果只做成 dashboard，读者又很容易在一堆控件里迷路。所以最终还是保留了“先读，再自己看”的顺序。',
            ],
          },
          {
            title: '数据来源',
            paragraphs: [
              '主要使用 Our World in Data 的 CO2 和 Energy 数据，再用 World Bank 的国家元数据补地区与收入分组。',
              '预处理时把国家和年份对齐，并补了碳强度、消费端与生产端差值、转折点和路径类型这些派生字段。',
            ],
          },
          {
            title: '适用范围',
            paragraphs: [
              '它比较适合回答国家尺度上的模式问题，比如谁更早转弯、谁的低碳化更明显、谁的“脱钩”可能带着更大的外包成分。',
              '但它不能直接替代行业研究，也不能把每次政策变化都做成严格因果解释。',
            ],
          },
          {
            title: '局限性',
            paragraphs: [
              '国家尺度的数据太粗，很多内部差异会被平均掉；消费端数据也更适合拿来做线索，而不是直接下结论。',
              '所以这里尽量避免把可视化写成“证明”，而是把它当成一个可以不断交叉核对的阅读界面。',
            ],
          },
        ],
      }
    : {
        eyebrow: 'Methodology',
        title: 'Data sources and design decisions',
        intro:
          'This section gathers the sources, design choices, and limitations that sit behind the narrative and exploratory views above.',
        sections: [
          {
            title: 'Research questions',
            paragraphs: [
              'The main question is which countries have started to pull economic growth away from emissions, which ones have not, and when those differences start to appear.',
              'That is why the page does not stop at one quadrant view. It also needs trajectories, mechanism views, and a final typology.',
            ],
          },
          {
            title: 'Design decisions',
            paragraphs: [
              'The opening chapters bring readers into the subject first, then the Atlas hands control back for open inspection. One part explains, the other part lets people check for themselves.',
              'The overview scatter answers who sits where. The connected scatter shows how a country got there. The mechanism views ask what may be happening behind that path.',
            ],
          },
          {
            title: 'Alternatives considered',
            paragraphs: [
              'A standard line chart shows time well, but it is weaker at exposing the moment when GDP keeps moving right while emissions start bending downward.',
              'A dashboard-only layout was also possible, but it tends to push readers straight into controls before they know what to look for. The final structure keeps a clearer read-then-explore rhythm.',
            ],
          },
          {
            title: 'Data sources',
            paragraphs: [
              'The main sources are Our World in Data CO2, Our World in Data Energy, and World Bank country metadata for region and income group context.',
              'The preprocessing aligns country-year records and adds derived fields such as carbon intensity, the consumption-production gap, turning points, and trajectory types.',
            ],
          },
          {
            title: 'Scope',
            paragraphs: [
              'This page works best for country-scale pattern questions: who turns earlier, who decarbonizes more deeply, and whose success looks more exposed to outsourcing through trade.',
              'It is less suited to sector-level explanation and it should not be treated as a strict causal model for every policy change.',
            ],
          },
          {
            title: 'Limitations',
            paragraphs: [
              'Country-level data smooths over a lot of internal variation, and consumption-based emissions are better treated as evidence to inspect than as a final verdict.',
              'So the visualizations are framed as a way to compare and cross-check patterns, not as a proof machine.',
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
      <p class="panel-copy panel-copy--wide">{{ content.intro }}</p>
    </div>

    <div class="method-list">
      <article v-for="section in content.sections" :key="section.title" class="method-row">
        <h3 class="method-row__title">{{ section.title }}</h3>
        <div class="method-row__body">
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
