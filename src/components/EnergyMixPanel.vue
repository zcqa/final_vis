<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { area, line } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import type { CountrySeriesGroup, Locale } from '../types'
import { formatNumber, formatShare, formatSignedNumber, formatSignedPercent, formatSignedPoints } from '../utils/formatters'

const props = defineProps<{
  seriesGroups: CountrySeriesGroup[]
  locale: Locale
}>()

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        title: '转折背后的机制',
        energyMode: '能源',
        gapMode: '消费差',
        intensityMode: '强度',
        compareMode: '并排',
        empty: '先选一个国家，再来看它背后的变化。',
        axisYear: '年份',
        axisShare: '占比 / 指标值',
        axisGap: '人均排放',
        axisIntensity: '吨 CO2 / 千美元 GDP',
        production: '生产端人均 CO2',
        consumption: '消费端人均 CO2',
        productionChange: '生产端变化',
        consumptionChange: '消费端变化',
        gap: '消费减生产',
        carbonIntensity: '碳强度水平',
        carbonIntensityChange: '碳强度变化',
        carbonIntensityUnit: '吨 CO2 / 千美元 GDP',
        lowCarbonElec: '低碳电力占比',
        intensityNote: '这条线衡量每创造 1,000 美元 GDP 需要排放多少 CO2。线往下，说明经济活动变得更低碳；线持平或上升，说明增长仍然依赖较高排放。',
        compareTitle: '几个信号',
        missingNote: 'N/A 表示该国家在当前年份范围内缺少能源结构、消费端排放或 GDP 字段。',
        headers: {
          country: '国家',
          renewables: '可再生能源',
          intensity: '碳强度',
          gap: '消费端差值',
        },
        seriesLabels: {
          renewables: '可再生能源',
          coal: '煤炭',
          lowCarbonElec: '低碳电力',
        },
      }
    : {
        title: 'What sits behind the turn',
        energyMode: 'Energy',
        gapMode: 'Trade gap',
        intensityMode: 'Intensity',
        compareMode: 'Compare',
        empty: 'Select a country first, then read what may be moving underneath the path.',
        axisYear: 'Year',
        axisShare: 'Share / value',
        axisGap: 'Emissions per capita',
        axisIntensity: 'tonnes CO2 / $1k GDP',
        production: 'Production CO2 / cap',
        consumption: 'Consumption CO2 / cap',
        productionChange: 'Production change',
        consumptionChange: 'Consumption change',
        gap: 'Consumption minus production',
        carbonIntensity: 'Carbon-intensity level',
        carbonIntensityChange: 'Carbon-intensity change',
        carbonIntensityUnit: 'tonnes CO2 / $1k GDP',
        lowCarbonElec: 'Low-carbon electricity',
        intensityNote: 'This line measures how many tonnes of CO2 are emitted for every $1,000 of GDP. A falling line means the economy is becoming less carbon-intensive.',
        compareTitle: 'Signals',
        missingNote: 'N/A means the selected country-year window lacks energy, consumption-emissions, or GDP fields.',
        headers: {
          country: 'Country',
          renewables: 'Renewables',
          intensity: 'Carbon intensity',
          gap: 'Consumption gap',
        },
        seriesLabels: {
          renewables: 'Renewables',
          coal: 'Coal',
          lowCarbonElec: 'Low-carbon electricity',
        },
      },
)

const mode = ref<'energy' | 'gap' | 'intensity' | 'compare'>('energy')

watch(
  () => props.seriesGroups.length,
  (count) => {
    if (count > 1) {
      mode.value = 'compare'
    } else if (count === 1 && mode.value === 'compare') {
      mode.value = 'energy'
    }
  },
  { immediate: true },
)

const primaryGroup = computed(() => props.seriesGroups[0] ?? null)
const primarySeries = computed(() => primaryGroup.value?.values ?? [])
const primaryCountryName = computed(() => primaryGroup.value?.country ?? '')

const width = 760
const height = 310
const margin = { top: 20, right: 18, bottom: 42, left: 54 }
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom

function domainWithPadding(values: number[], includeZero = false) {
  if (!values.length) {
    return includeZero ? [-1, 1] : [0, 1]
  }

  const min = includeZero ? Math.min(...values, 0) : Math.min(...values)
  const max = includeZero ? Math.max(...values, 0) : Math.max(...values)
  const span = max - min || Math.max(Math.abs(max), 1)
  const padding = span * 0.12
  return [min - padding, max + padding]
}

const yearDomain = computed(() => {
  const firstYear = primarySeries.value[0]?.year ?? 1990
  const lastYear = primarySeries.value.at(-1)?.year ?? 2022
  return [firstYear, lastYear]
})

const xScale = computed(() => scaleLinear().domain(yearDomain.value).range([0, innerWidth]))

const energyRows = computed(() => {
  const start = primarySeries.value[0] ?? null
  const end = primarySeries.value.at(-1) ?? null

  return [
    {
      key: 'renewables',
      label: copy.value.seriesLabels.renewables,
      color: '#1f8f6a',
      start: start?.renewablesShareEnergy ?? null,
      end: end?.renewablesShareEnergy ?? null,
      values: primarySeries.value
        .map((record) => ({ year: record.year, value: record.renewablesShareEnergy }))
        .filter((point): point is { year: number; value: number } => point.value !== null),
    },
    {
      key: 'coal',
      label: copy.value.seriesLabels.coal,
      color: '#334542',
      start: start?.coalShareEnergy ?? null,
      end: end?.coalShareEnergy ?? null,
      values: primarySeries.value
        .map((record) => ({ year: record.year, value: record.coalShareEnergy }))
        .filter((point): point is { year: number; value: number } => point.value !== null),
    },
    {
      key: 'lowCarbonElec',
      label: copy.value.seriesLabels.lowCarbonElec,
      color: '#6b58c3',
      start: start?.lowCarbonShareElec ?? null,
      end: end?.lowCarbonShareElec ?? null,
      values: primarySeries.value
        .map((record) => ({ year: record.year, value: record.lowCarbonShareElec }))
        .filter((point): point is { year: number; value: number } => point.value !== null),
    },
  ].map((row) => ({
    ...row,
    delta: row.start !== null && row.end !== null ? row.end - row.start : null,
  }))
})

const energyYScale = computed(() => scaleLinear().domain([0, 100]).range([innerHeight, 0]))
const energyLine = line<{ year: number; value: number }>()
  .x((point) => xScale.value(point.year))
  .y((point) => energyYScale.value(point.value))

const gapRows = computed(() =>
  primarySeries.value
    .map((record) => ({
      year: record.year,
      production: record.co2PerCapita,
      consumption: record.consumptionCo2PerCapita,
      gap: record.consumptionProductionGapPerCapita,
    }))
    .filter(
      (row): row is { year: number; production: number; consumption: number; gap: number } =>
        row.production !== null && row.consumption !== null && row.gap !== null,
    ),
)

const gapYScale = computed(() =>
  scaleLinear()
    .domain(domainWithPadding(gapRows.value.flatMap((row) => [row.production, row.consumption]), true))
    .range([innerHeight, 0]),
)

const gapArea = area<{ year: number; production: number; consumption: number }>()
  .x((point) => xScale.value(point.year))
  .y0((point) => gapYScale.value(point.production))
  .y1((point) => gapYScale.value(point.consumption))

const gapProductionLine = line<{ year: number; production: number }>()
  .x((point) => xScale.value(point.year))
  .y((point) => gapYScale.value(point.production))

const gapConsumptionLine = line<{ year: number; consumption: number }>()
  .x((point) => xScale.value(point.year))
  .y((point) => gapYScale.value(point.consumption))

const gapStart = computed(() => gapRows.value[0] ?? null)
const gapEnd = computed(() => gapRows.value.at(-1) ?? null)

function carbonIntensityValue(record: { carbonIntensity: number | null; co2: number | null; gdp: number | null }) {
  if (record.carbonIntensity !== null && record.carbonIntensity > 0) {
    return record.carbonIntensity
  }

  if (record.co2 === null || record.gdp === null || record.gdp === 0) {
    return null
  }

  return (record.co2 * 1_000_000) / (record.gdp / 1_000)
}

function percentChange(start: number | null, end: number | null) {
  if (start === null || end === null || start === 0) {
    return null
  }

  return ((end - start) / start) * 100
}

const intensityRows = computed(() =>
  primarySeries.value
    .map((record) => ({
      year: record.year,
      intensity: carbonIntensityValue(record),
    }))
    .filter((row): row is { year: number; intensity: number } => row.intensity !== null),
)

const intensityYScale = computed(() =>
  scaleLinear().domain(domainWithPadding(intensityRows.value.map((row) => row.intensity))).range([innerHeight, 0]),
)

const intensityLine = line<{ year: number; intensity: number }>()
  .x((point) => xScale.value(point.year))
  .y((point) => intensityYScale.value(point.intensity))

const intensityStart = computed(() => intensityRows.value[0] ?? null)
const intensityEnd = computed(() => intensityRows.value.at(-1) ?? null)
const lowCarbonElecStart = computed(() => primarySeries.value.find((point) => point.lowCarbonShareElec !== null) ?? null)
const lowCarbonElecEnd = computed(
  () => [...primarySeries.value].reverse().find((point) => point.lowCarbonShareElec !== null) ?? null,
)

const compareRows = computed(() =>
  [...props.seriesGroups]
    .map((group) => {
      const start = group.values[0] ?? null
      const end = group.values.at(-1) ?? null

      const renewablesDelta =
        start?.renewablesShareEnergy !== null && end?.renewablesShareEnergy !== null
          ? (end?.renewablesShareEnergy ?? 0) - start.renewablesShareEnergy
          : null
      const startIntensity = start ? carbonIntensityValue(start) : null
      const endIntensity = end ? carbonIntensityValue(end) : null
      const intensityChangePct =
        startIntensity !== null && endIntensity !== null && startIntensity !== 0
          ? ((endIntensity - startIntensity) / startIntensity) * 100
          : null
      const gapEndValue = end?.consumptionProductionGapPerCapita ?? null
      const productionChangePct = percentChange(start?.co2PerCapita ?? null, end?.co2PerCapita ?? null)
      const consumptionChangePct = percentChange(
        start?.consumptionCo2PerCapita ?? null,
        end?.consumptionCo2PerCapita ?? null,
      )

      return {
        country: group.country,
        isoCode: group.isoCode,
        renewablesDelta,
        intensityChangePct,
        gapEnd: gapEndValue,
        productionChangePct,
        consumptionChangePct,
      }
    })
    .sort((left, right) => (left.intensityChangePct ?? Infinity) - (right.intensityChangePct ?? Infinity)),
)

const dumbbellDomain = computed(() =>
  domainWithPadding(
    compareRows.value.flatMap((row) =>
      [row.productionChangePct, row.consumptionChangePct].filter(
        (value): value is number => value !== null && Number.isFinite(value),
      ),
    ),
    true,
  ),
)

const dumbbellScale = computed(() => scaleLinear().domain(dumbbellDomain.value).range([0, 100]))

const compareInsights = computed(() => {
  if (compareRows.value.length < 2) {
    return []
  }

  const strongestIntensityDrop = compareRows.value.find((row) => row.intensityChangePct !== null) ?? null
  const biggestGap = [...compareRows.value]
    .filter((row) => row.gapEnd !== null)
    .sort((left, right) => (right.gapEnd ?? -Infinity) - (left.gapEnd ?? -Infinity))[0]

  const insights = []
  if (strongestIntensityDrop) {
    insights.push(
      props.locale === 'zh'
        ? `${strongestIntensityDrop.country} 的碳强度下降最明显，为 ${formatSignedPercent(strongestIntensityDrop.intensityChangePct, 1, props.locale)}。`
        : `${strongestIntensityDrop.country} shows the sharpest carbon-intensity decline at ${formatSignedPercent(strongestIntensityDrop.intensityChangePct, 1, props.locale)}.`,
    )
  }
  if (biggestGap) {
    insights.push(
      props.locale === 'zh'
        ? `${biggestGap.country} 的消费端与生产端差值最高，为 ${formatSignedNumber(biggestGap.gapEnd, 2, props.locale)}。`
        : `${biggestGap.country} ends with the largest consumption-production gap at ${formatSignedNumber(biggestGap.gapEnd, 2, props.locale)}.`,
    )
  }

  return insights
})

const modeHeadline = computed(() => {
  if (mode.value === 'energy') {
    return props.locale === 'zh' ? '能源结构如何重排' : 'How the energy mix is being reordered'
  }

  if (mode.value === 'gap') {
    return props.locale === 'zh' ? '把消费端排放算回来' : 'What changes when consumption is counted back in'
  }

  if (mode.value === 'intensity') {
    return props.locale === 'zh' ? '单位 GDP 的排放负担' : 'How much carbon still rides on each unit of GDP'
  }

  return props.locale === 'zh' ? '几个机制并排看' : 'A side-by-side look at the mechanisms'
})

const modeSubtitle = computed(() => {
  if (mode.value === 'energy') {
    return props.locale === 'zh'
      ? `${primaryCountryName.value} 的煤炭、可再生能源与低碳电力占比变化。`
      : `${primaryCountryName.value}: coal, renewables, and low-carbon electricity over time.`
  }

  if (mode.value === 'gap') {
    return props.locale === 'zh'
      ? `${primaryCountryName.value} 的消费端与生产端人均排放差距。`
      : `${primaryCountryName.value}, comparing consumption-based and production-based emissions per capita.`
  }

  if (mode.value === 'intensity') {
    return props.locale === 'zh'
      ? `${primaryCountryName.value} 每创造 1,000 美元 GDP 对应的 CO2 排放，以及低碳电力是否同步抬升。`
      : `${primaryCountryName.value}, tracking tonnes of CO2 per $1,000 of GDP alongside low-carbon electricity.`
  }

  return props.locale === 'zh'
    ? '把可再生能源、碳强度和消费端差值放到一张并列表里。'
    : 'Renewables, carbon intensity, and the consumption gap on a single comparison table.'
})
</script>

<template>
  <div class="chart-card">
    <div class="panel-heading">
      <div>
        <h2>{{ modeHeadline }}</h2>
        <p class="panel-subtitle panel-subtitle--wide">{{ modeSubtitle }}</p>
      </div>

      <div class="mode-switch">
        <button
          type="button"
          :class="['mode-switch__button', { 'mode-switch__button--active': mode === 'energy' }]"
          :disabled="seriesGroups.length > 1"
          @click="mode = 'energy'"
        >
          {{ copy.energyMode }}
        </button>
        <button
          type="button"
          :class="['mode-switch__button', { 'mode-switch__button--active': mode === 'gap' }]"
          :disabled="seriesGroups.length > 1"
          @click="mode = 'gap'"
        >
          {{ copy.gapMode }}
        </button>
        <button
          type="button"
          :class="['mode-switch__button', { 'mode-switch__button--active': mode === 'intensity' }]"
          :disabled="seriesGroups.length > 1"
          @click="mode = 'intensity'"
        >
          {{ copy.intensityMode }}
        </button>
        <button
          type="button"
          :class="['mode-switch__button', { 'mode-switch__button--active': mode === 'compare' }]"
          :disabled="seriesGroups.length <= 1"
          @click="mode = 'compare'"
        >
          {{ copy.compareMode }}
        </button>
      </div>
    </div>

    <div v-if="!seriesGroups.length" class="empty-state">{{ copy.empty }}</div>

    <template v-else-if="mode === 'energy'">
      <svg :viewBox="`0 0 ${width} ${height}`" class="line-svg">
        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <line class="axis-line" :x1="0" :x2="innerWidth" :y1="innerHeight" :y2="innerHeight" />
          <line class="axis-line" :x1="0" :x2="0" :y1="0" :y2="innerHeight" />
          <line class="grid-line" :x1="0" :x2="innerWidth" :y1="energyYScale(50)" :y2="energyYScale(50)" />
          <text class="grid-label" x="8" :y="energyYScale(50) - 8">50%</text>

          <g v-for="row in energyRows" :key="row.key">
            <path
              v-if="row.values.length >= 2"
              :d="energyLine(row.values) ?? undefined"
              class="line"
              :stroke="row.color"
            />
          </g>

          <text class="axis-title" :x="innerWidth / 2" :y="innerHeight + 34">{{ copy.axisYear }}</text>
          <text class="axis-title axis-title--y" :x="-innerHeight / 2" :y="-34">{{ copy.axisShare }}</text>
        </g>
      </svg>

      <div class="trajectory-legend">
        <div v-for="row in energyRows" :key="row.key" class="legend-item mechanism-legend-item">
          <span class="legend-swatch" :style="{ backgroundColor: row.color }"></span>
          {{ row.label }}
          <strong>{{ formatSignedPoints(row.delta, 1, locale) }}</strong>
        </div>
      </div>
    </template>

    <template v-else-if="mode === 'gap'">
      <svg :viewBox="`0 0 ${width} ${height}`" class="line-svg">
        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <line class="axis-line" :x1="0" :x2="innerWidth" :y1="innerHeight" :y2="innerHeight" />
          <line class="axis-line" :x1="0" :x2="0" :y1="0" :y2="innerHeight" />
          <line class="grid-line" :x1="0" :x2="innerWidth" :y1="gapYScale(0)" :y2="gapYScale(0)" />

          <path
            v-if="gapRows.length >= 2"
            :d="gapArea(gapRows) ?? undefined"
            class="gap-area"
          />
          <path
            v-if="gapRows.length >= 2"
            :d="gapProductionLine(gapRows) ?? undefined"
            class="line"
            stroke="#245f8f"
          />
          <path
            v-if="gapRows.length >= 2"
            :d="gapConsumptionLine(gapRows) ?? undefined"
            class="line"
            stroke="#ca6d34"
          />

          <text class="axis-title" :x="innerWidth / 2" :y="innerHeight + 34">{{ copy.axisYear }}</text>
          <text class="axis-title axis-title--y" :x="-innerHeight / 2" :y="-34">{{ copy.axisGap }}</text>
        </g>
      </svg>

      <div class="mechanism-stats">
        <div class="mechanism-stat">
          <span>{{ copy.production }}</span>
          <strong>{{ formatNumber(gapEnd?.production ?? null, 2, locale) }}</strong>
        </div>
        <div class="mechanism-stat">
          <span>{{ copy.consumption }}</span>
          <strong>{{ formatNumber(gapEnd?.consumption ?? null, 2, locale) }}</strong>
        </div>
        <div class="mechanism-stat">
          <span>{{ copy.gap }}</span>
          <strong>{{ formatSignedNumber(gapEnd?.gap ?? null, 2, locale) }}</strong>
        </div>
        <div class="mechanism-stat">
          <span>{{ gapStart?.year }} → {{ gapEnd?.year }}</span>
          <strong>
            {{ formatSignedNumber(((gapEnd?.gap ?? 0) - (gapStart?.gap ?? 0)), 2, locale) }}
          </strong>
        </div>
      </div>
    </template>

    <template v-else-if="mode === 'intensity'">
      <svg :viewBox="`0 0 ${width} ${height}`" class="line-svg">
        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <line class="axis-line" :x1="0" :x2="innerWidth" :y1="innerHeight" :y2="innerHeight" />
          <line class="axis-line" :x1="0" :x2="0" :y1="0" :y2="innerHeight" />

          <path
            v-if="intensityRows.length >= 2"
            :d="intensityLine(intensityRows) ?? undefined"
            class="line"
            stroke="#245f8f"
          />

          <text class="axis-title" :x="innerWidth / 2" :y="innerHeight + 34">{{ copy.axisYear }}</text>
          <text class="axis-title axis-title--y" :x="-innerHeight / 2" :y="-34">{{ copy.axisIntensity }}</text>
        </g>
      </svg>

      <div class="mechanism-stats">
        <div class="mechanism-stat">
          <span>{{ copy.carbonIntensity }}</span>
          <strong>{{ formatNumber(intensityStart?.intensity ?? null, 3, locale) }} → {{ formatNumber(intensityEnd?.intensity ?? null, 3, locale) }}</strong>
          <small>{{ copy.carbonIntensityUnit }}</small>
        </div>
        <div class="mechanism-stat">
          <span>{{ copy.lowCarbonElec }}</span>
          <strong>{{ formatShare(lowCarbonElecStart?.lowCarbonShareElec ?? null, 1, locale) }} → {{ formatShare(lowCarbonElecEnd?.lowCarbonShareElec ?? null, 1, locale) }}</strong>
        </div>
        <div class="mechanism-stat">
          <span>{{ copy.seriesLabels.renewables }}</span>
          <strong>{{ formatShare(primarySeries[0]?.renewablesShareEnergy ?? null, 1, locale) }} → {{ formatShare(primarySeries.at(-1)?.renewablesShareEnergy ?? null, 1, locale) }}</strong>
        </div>
        <div class="mechanism-stat">
          <span>{{ copy.carbonIntensityChange }}</span>
          <strong>{{ formatSignedPercent(intensityStart && intensityEnd && intensityStart.intensity !== 0 ? ((intensityEnd.intensity - intensityStart.intensity) / intensityStart.intensity) * 100 : null, 1, locale) }}</strong>
        </div>
      </div>
      <p class="mechanism-missing-note">{{ copy.intensityNote }}</p>
    </template>

    <template v-else>
      <div class="dumbbell-panel">
        <div class="dumbbell-panel__header">
          <span>{{ copy.productionChange }}</span>
          <strong>{{ copy.consumptionChange }}</strong>
        </div>
        <div class="dumbbell-list">
          <div
            v-for="row in compareRows.filter((item) => item.productionChangePct !== null || item.consumptionChangePct !== null)"
            :key="`${row.isoCode}-dumbbell`"
            class="dumbbell-row"
          >
            <span class="dumbbell-row__country">{{ row.country }}</span>
            <div class="dumbbell-row__track">
              <span
                v-if="row.productionChangePct !== null && row.consumptionChangePct !== null"
                class="dumbbell-row__connector"
                :style="{
                  left: `${Math.min(dumbbellScale(row.productionChangePct), dumbbellScale(row.consumptionChangePct))}%`,
                  width: `${Math.abs(dumbbellScale(row.consumptionChangePct) - dumbbellScale(row.productionChangePct))}%`,
                }"
              ></span>
              <span
                v-if="row.productionChangePct !== null"
                class="dumbbell-row__dot dumbbell-row__dot--production"
                :style="{ left: `${dumbbellScale(row.productionChangePct)}%` }"
                :title="`${copy.productionChange}: ${formatSignedPercent(row.productionChangePct, 1, locale)}`"
              ></span>
              <span
                v-if="row.consumptionChangePct !== null"
                class="dumbbell-row__dot dumbbell-row__dot--consumption"
                :style="{ left: `${dumbbellScale(row.consumptionChangePct)}%` }"
                :title="`${copy.consumptionChange}: ${formatSignedPercent(row.consumptionChangePct, 1, locale)}`"
              ></span>
            </div>
            <span class="dumbbell-row__value">
              {{ formatSignedPercent(row.productionChangePct, 0, locale) }} / {{ formatSignedPercent(row.consumptionChangePct, 0, locale) }}
            </span>
          </div>
        </div>
      </div>

      <div class="compare-table">
        <div class="compare-table__header compare-table__row compare-table__row--mechanism">
          <span>{{ copy.headers.country }}</span>
          <span>{{ copy.headers.renewables }}</span>
          <span>{{ copy.headers.intensity }}</span>
          <span>{{ copy.headers.gap }}</span>
        </div>
        <div
          v-for="row in compareRows"
          :key="row.isoCode"
          class="compare-table__row compare-table__row--mechanism"
        >
          <strong>{{ row.country }}</strong>
          <div class="compare-cell">
            <strong>{{ formatSignedPoints(row.renewablesDelta, 1, locale) }}</strong>
          </div>
          <div class="compare-cell">
            <strong>{{ formatSignedPercent(row.intensityChangePct, 1, locale) }}</strong>
          </div>
          <div class="compare-cell">
            <strong>{{ formatSignedNumber(row.gapEnd, 2, locale) }}</strong>
          </div>
        </div>
      </div>

      <div v-if="compareInsights.length" class="compare-insights">
        <p class="selection-title">{{ copy.compareTitle }}</p>
        <ul>
          <li v-for="insight in compareInsights" :key="insight">{{ insight }}</li>
        </ul>
      </div>
      <p class="mechanism-missing-note">{{ copy.missingNote }}</p>
    </template>
  </div>
</template>
