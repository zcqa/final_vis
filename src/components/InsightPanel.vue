<script setup lang="ts">
import { computed } from 'vue'
import type { CountryOption, Locale, OverviewPoint } from '../types'
import { formatCompactNumber, formatSignedNumber, formatSignedPercent } from '../utils/formatters'

const props = defineProps<{
  point: OverviewPoint | null
  selectedCountries: CountryOption[]
  selectedPoints: OverviewPoint[]
  metricLabel: string
  locale: Locale
}>()

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        emptyTitle: '从散点图开始',
        emptyLead: '单击一个国家查看国家卡；按住鼠标拖拽可以框选一组国家。',
        emptySingle: '选 1 个国家',
        emptySingleBody: '查看 GDP、排放、消费端差值和人口。',
        emptyCompare: '选 2—4 个国家',
        emptyCompareBody: '并排比较几条路径的差异。',
        emptyGroup: '框选 5 个以上',
        emptyGroupBody: '自动汇总地区、收入水平和平均变化。',
        selectionTitle: '选择集合',
        selectionIntro: '这组国家的共同特征',
        selectedCount: '选中国家',
        topRegion: '主要地区',
        highIncomeShare: '高收入占比',
        avgGdp: '平均 GDP 变化',
        avgMetric: '平均排放变化',
        avgRenewables: '平均可再生能源变化',
        consumptionAboveProduction: '消费端高于生产端',
        countries: '个国家',
        period: '核心指标变化',
        compare: '正在比较',
        gdp: '人均 GDP',
        gap: '消费端碳差值',
        population: '人口',
        brief: '轨迹速写',
        gapUnit: '吨/人',
        status: '类型',
        region: '地区',
        renewables: '可再生能源',
      }
    : {
        emptyTitle: 'Start with the scatterplot',
        emptyLead: 'Click one country for a country card, or drag across the chart to select a group.',
        emptySingle: 'Select 1 country',
        emptySingleBody: 'Read GDP, emissions, consumption gap, and population.',
        emptyCompare: 'Select 2-4 countries',
        emptyCompareBody: 'Compare a few paths side by side.',
        emptyGroup: 'Brush 5 or more',
        emptyGroupBody: 'Summarize region, income level, and average change.',
        selectionTitle: 'Selection summary',
        selectionIntro: 'What this group has in common',
        selectedCount: 'Selected countries',
        topRegion: 'Main region',
        highIncomeShare: 'High-income share',
        avgGdp: 'Avg. GDP change',
        avgMetric: 'Avg. emissions change',
        avgRenewables: 'Avg. renewables change',
        consumptionAboveProduction: 'Consumption above production',
        countries: 'countries',
        period: 'Key changes',
        compare: 'Countries in view',
        gdp: 'GDP per capita',
        gap: 'Consumption gap',
        population: 'Population',
        brief: 'Trajectory sketch',
        gapUnit: 't / cap',
        status: 'Type',
        region: 'Region',
        renewables: 'Renewables',
      },
)

function arrowFor(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return ''
  }

  if (value > 0) {
    return '↗'
  }

  if (value < 0) {
    return '↘'
  }

  return '→'
}

function statusText(status: OverviewPoint['status']) {
  if (props.locale === 'zh') {
    if (status === 'decoupled') {
      return '脱钩样本'
    }

    if (status === 'growth-with-emissions') {
      return '增长伴随排放'
    }

    if (status === 'low-growth-lower-emissions') {
      return '低增长、低排放'
    }

    return '边界样本'
  }

  if (status === 'decoupled') {
    return 'Decoupling case'
  }

  if (status === 'growth-with-emissions') {
    return 'Growth with emissions'
  }

  if (status === 'low-growth-lower-emissions') {
    return 'Low growth, lower emissions'
  }

  return 'Boundary case'
}

const briefText = computed(() => {
  const point = primaryPoint.value
  if (!point) {
    return ''
  }

  const gap = point.endRecord.consumptionProductionGapPerCapita

  if (props.locale === 'zh') {
    if (point.status === 'decoupled') {
      return gap !== null && gap > 0
        ? `${point.country} 已经把增长与排放明显拉开，但消费端仍高于生产端，说明这条“成功曲线”里可能包含外部转移的成分。`
        : `${point.country} 已经把增长与排放明显拉开，轨迹更像建立在真实的能源与结构变化之上。`
    }

    if (point.status === 'growth-with-emissions') {
      return `${point.country} 仍处于经济与排放同步抬升的阶段，工业化与基础设施扩张仍是这条线的主要背景。`
    }

    if (point.status === 'low-growth-lower-emissions') {
      return `${point.country} 的排放和增长都偏弱，更像一个在低增速环境里收缩的样本，而不是典型的转型优等生。`
    }

    return `${point.country} 的轨迹还没有稳定地走向脱钩，更适合作为边界案例来读。`
  }

  if (point.status === 'decoupled') {
    return gap !== null && gap > 0
      ? `${point.country} separates growth from emissions, but consumption still exceeds production, hinting that part of the progress may rest on imported carbon.`
      : `${point.country} clearly separates growth from emissions, and the curve looks more rooted in a real domestic energy and structural shift.`
  }

  if (point.status === 'growth-with-emissions') {
    return `${point.country} is still in a phase where growth and emissions rise together, with industrialization and infrastructure expansion driving the path.`
  }

  if (point.status === 'low-growth-lower-emissions') {
    return `${point.country} shows weak growth alongside lower emissions, which reads more like a low-growth contraction case than a classic transition leader.`
  }

  return `${point.country} has not settled into a stable decoupling path yet, so it reads better as a boundary case.`
})

function average(values: Array<number | null>) {
  const numericValues = values.filter((value): value is number => value !== null && Number.isFinite(value))
  if (!numericValues.length) {
    return null
  }

  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
}

const displayMode = computed(() => {
  const count = props.selectedPoints.length

  if (count === 0) {
    return 'empty'
  }

  if (count === 1) {
    return 'single'
  }

  if (count <= 4) {
    return 'compare'
  }

  return 'summary'
})

const primaryPoint = computed(() => props.selectedPoints[0] ?? props.point)
const comparePoints = computed(() => props.selectedPoints.slice(0, 4))

const selectionSummary = computed(() => {
  const points = props.selectedPoints
  if (points.length <= 4) {
    return null
  }

  const regionCounts = new Map<string, number>()
  for (const point of points) {
    regionCounts.set(point.region, (regionCounts.get(point.region) ?? 0) + 1)
  }

  const topRegion = [...regionCounts.entries()].sort((left, right) => right[1] - left[1])[0] ?? null
  const highIncomeCount = points.filter((point) => point.incomeLevel === 'High income').length
  const consumptionAboveProductionCount = points.filter(
    (point) => (point.endRecord.consumptionProductionGapPerCapita ?? 0) > 0,
  ).length

  return {
    count: points.length,
    topRegionName: topRegion?.[0] ?? null,
    topRegionCount: topRegion?.[1] ?? 0,
    highIncomePct: (highIncomeCount / points.length) * 100,
    avgGdpChangePct: average(points.map((point) => point.gdpChangePct)),
    avgMetricChangePct: average(points.map((point) => point.metricChangePct)),
    avgRenewablesChangePts: average(points.map((point) => point.renewablesChangePts)),
    consumptionAboveProductionCount,
  }
})
</script>

<template>
  <div class="chart-card fact-box">
    <div v-if="displayMode === 'empty'" class="insight-empty">
      <div class="fact-box__identity">
        <div class="fact-box__meta">Data Explorer</div>
        <h2>{{ copy.emptyTitle }}</h2>
        <p class="fact-box__period">{{ copy.emptyLead }}</p>
      </div>

      <div class="insight-empty__grid">
        <div class="fact-box__metric">
          <span>{{ copy.emptySingle }}</span>
          <strong>{{ copy.emptySingleBody }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.emptyCompare }}</span>
          <strong>{{ copy.emptyCompareBody }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.emptyGroup }}</span>
          <strong>{{ copy.emptyGroupBody }}</strong>
        </div>
      </div>
    </div>

    <div v-else-if="displayMode === 'summary' && selectionSummary" class="selection-summary">
      <div class="fact-box__identity">
        <div class="fact-box__meta">{{ copy.selectionTitle }}</div>
        <h2>{{ selectionSummary.count }} {{ copy.countries }}</h2>
        <p class="fact-box__period">{{ copy.selectionIntro }}</p>
      </div>

      <div class="selection-summary__grid">
        <div class="fact-box__metric">
          <span>{{ copy.topRegion }}</span>
          <strong>{{ selectionSummary.topRegionName ?? 'N/A' }}</strong>
          <small>{{ selectionSummary.topRegionCount }} / {{ selectionSummary.count }}</small>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.highIncomeShare }}</span>
          <strong>{{ formatSignedPercent(selectionSummary.highIncomePct, 1, locale).replace('+', '') }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.avgGdp }}</span>
          <strong>{{ formatSignedPercent(selectionSummary.avgGdpChangePct, 1, locale) }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.avgMetric }}</span>
          <strong>{{ formatSignedPercent(selectionSummary.avgMetricChangePct, 1, locale) }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.avgRenewables }}</span>
          <strong>{{ formatSignedNumber(selectionSummary.avgRenewablesChangePts, 1, locale) }} pts</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.consumptionAboveProduction }}</span>
          <strong>{{ selectionSummary.consumptionAboveProductionCount }} / {{ selectionSummary.count }}</strong>
        </div>
      </div>
    </div>

    <div v-else-if="displayMode === 'compare'" class="selection-compare">
      <div class="fact-box__identity">
        <div class="fact-box__meta">{{ copy.compare }}</div>
        <h2>{{ comparePoints.length }} {{ copy.countries }}</h2>
        <p class="fact-box__period">{{ comparePoints[0]?.startYear }} — {{ comparePoints[0]?.endYear }}</p>
      </div>

      <div class="compare-table compare-table--insight">
        <div class="compare-table__row compare-table__header">
          <span>{{ copy.countries }}</span>
          <span>{{ copy.status }}</span>
          <span>{{ copy.gdp }}</span>
          <span>{{ metricLabel }}</span>
          <span>{{ copy.gap }}</span>
        </div>
        <div v-for="comparePoint in comparePoints" :key="comparePoint.isoCode" class="compare-table__row compare-table__row--insight">
          <div class="compare-cell">
            <strong>{{ comparePoint.country }}</strong>
            <span>{{ comparePoint.region }}</span>
          </div>
          <div class="compare-cell">
            <strong>{{ statusText(comparePoint.status) }}</strong>
            <span>{{ comparePoint.incomeLevel }}</span>
          </div>
          <div class="compare-cell">
            <strong>{{ arrowFor(comparePoint.gdpChangePct) }} {{ formatSignedPercent(comparePoint.gdpChangePct, 1, locale) }}</strong>
          </div>
          <div class="compare-cell">
            <strong>{{ arrowFor(comparePoint.metricChangePct) }} {{ formatSignedPercent(comparePoint.metricChangePct, 1, locale) }}</strong>
          </div>
          <div class="compare-cell">
            <strong>{{ formatSignedNumber(comparePoint.endRecord.consumptionProductionGapPerCapita, 2, locale) }}</strong>
            <span>{{ copy.gapUnit }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="primaryPoint" class="fact-box__layout">
      <div class="fact-box__identity">
        <div class="fact-box__meta">{{ primaryPoint.isoCode }}</div>
        <h2>{{ primaryPoint.country }}</h2>
        <div :class="['fact-box__status', `fact-box__status--${primaryPoint.status}`]">
          <span class="fact-box__status-dot"></span>
          {{ statusText(primaryPoint.status) }}
        </div>
        <p class="fact-box__period">{{ primaryPoint.startYear }} — {{ primaryPoint.endYear }} {{ copy.period }}</p>
      </div>

      <div class="fact-box__metrics">
        <div class="fact-box__metric">
          <span>{{ copy.gdp }}</span>
          <strong>{{ arrowFor(primaryPoint.gdpChangePct) }} {{ formatSignedPercent(primaryPoint.gdpChangePct, 1, locale) }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ metricLabel }}</span>
          <strong>{{ arrowFor(primaryPoint.metricChangePct) }} {{ formatSignedPercent(primaryPoint.metricChangePct, 1, locale) }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.gap }}</span>
          <strong>{{ formatSignedNumber(primaryPoint.endRecord.consumptionProductionGapPerCapita, 2, locale) }} {{ copy.gapUnit }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.population }}</span>
          <strong>{{ formatCompactNumber(primaryPoint.endRecord.population, 1, locale) }}</strong>
        </div>
      </div>

      <div class="fact-box__brief">
        <span class="fact-box__label">{{ copy.brief }}</span>
        <p>{{ briefText }}</p>
      </div>

    </div>
  </div>
</template>
