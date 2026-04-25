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
        empty: '点一个国家，这里会出现一张简短的国家卡。',
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
      }
    : {
        empty: 'Click a country to load a compact country card here.',
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
  const point = props.point
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

const selectionSummary = computed(() => {
  const points = props.selectedPoints
  if (points.length <= 1) {
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
    <div v-if="selectionSummary" class="selection-summary">
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

    <div v-else-if="point" class="fact-box__layout">
      <div class="fact-box__identity">
        <div class="fact-box__meta">{{ point.isoCode }}</div>
        <h2>{{ point.country }}</h2>
        <div :class="['fact-box__status', `fact-box__status--${point.status}`]">
          <span class="fact-box__status-dot"></span>
          {{ statusText(point.status) }}
        </div>
        <p class="fact-box__period">{{ point.startYear }} — {{ point.endYear }} {{ copy.period }}</p>
      </div>

      <div class="fact-box__metrics">
        <div class="fact-box__metric">
          <span>{{ copy.gdp }}</span>
          <strong>{{ arrowFor(point.gdpChangePct) }} {{ formatSignedPercent(point.gdpChangePct, 1, locale) }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ metricLabel }}</span>
          <strong>{{ arrowFor(point.metricChangePct) }} {{ formatSignedPercent(point.metricChangePct, 1, locale) }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.gap }}</span>
          <strong>{{ formatSignedNumber(point.endRecord.consumptionProductionGapPerCapita, 2, locale) }} {{ copy.gapUnit }}</strong>
        </div>
        <div class="fact-box__metric">
          <span>{{ copy.population }}</span>
          <strong>{{ formatCompactNumber(point.endRecord.population, 1, locale) }}</strong>
        </div>
      </div>

      <div class="fact-box__brief">
        <span class="fact-box__label">{{ copy.brief }}</span>
        <p>{{ briefText }}</p>
      </div>

      <div v-if="selectedCountries.length > 1" class="fact-box__compare">
        <span class="fact-box__label">{{ copy.compare }}</span>
        <div class="fact-box__chips">
          <span v-for="country in selectedCountries" :key="country.isoCode" class="country-chip">
            {{ country.country }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      {{ copy.empty }}
    </div>
  </div>
</template>
