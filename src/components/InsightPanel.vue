<script setup lang="ts">
import { computed } from 'vue'
import type { CountryOption, Locale, OverviewPoint } from '../types'
import { formatCompactNumber, formatSignedNumber, formatSignedPercent } from '../utils/formatters'

const props = defineProps<{
  point: OverviewPoint | null
  selectedCountries: CountryOption[]
  metricLabel: string
  locale: Locale
}>()

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        empty: '点一个国家，这里会出现一张简短的国家卡。',
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
</script>

<template>
  <div class="chart-card fact-box">
    <div v-if="point" class="fact-box__layout">
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
