<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { line } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import type { CountrySeriesGroup, CountryYearRecord, Locale, MetricKey } from '../types'
import { formatNumber, formatShare } from '../utils/formatters'

interface TooltipRow {
  label: string
  value: string
}

const props = defineProps<{
  seriesGroups: CountrySeriesGroup[]
  metricKey: MetricKey
  metricLabel: string
  locale: Locale
}>()

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        title: '经济增长与碳排放的路径',
        pathMode: '轨迹',
        lineMode: '基线对照',
        empty: '先从总览里选一个国家，这里才会开始出现路径。',
        axisGdp: '人均 GDP',
        axisMetric: props.metricLabel,
        axisYear: '年份',
        baseLine: '100 = 起点年份',
        year: '年份',
        gdpValue: '人均 GDP',
        metricValue: props.metricLabel,
        indexValue: '指数值',
        renewables: '可再生能源占比',
        gdpIndex: '人均 GDP 指数',
        metricIndex: `${props.metricLabel} 指数`,
        flowLabel: '轨迹流向',
        turningLabel: '排放峰值',
        lineSingleLabel: '',
        lineMultiLabel: '',
      }
    : {
        title: 'The path from growth to carbon',
        pathMode: 'Trajectory',
        lineMode: 'Indexed lines',
        empty: 'Select a country in the overview before the path appears here.',
        axisGdp: 'GDP per capita',
        axisMetric: props.metricLabel,
        axisYear: 'Year',
        baseLine: '100 = start year',
        year: 'Year',
        gdpValue: 'GDP per capita',
        metricValue: props.metricLabel,
        indexValue: 'Index value',
        renewables: 'Renewables share',
        gdpIndex: 'GDP per capita index',
        metricIndex: `${props.metricLabel} index`,
        flowLabel: 'Direction',
        turningLabel: 'Emissions peak',
        lineSingleLabel: 'Once the baseline is set to 100, the split between growth and emissions becomes much easier to read.',
        lineMultiLabel: 'With a shared baseline, early turns and continued climbs stand out more clearly.',
      },
)

const mode = ref<'path' | 'line'>('path')
const hoveredSeriesKey = ref<string | null>(null)
const pinnedSeriesKey = ref<string | null>(null)
const tooltip = ref<{ title: string; subtitle: string; rows: TooltipRow[] } | null>(null)
const tooltipStyle = ref({ left: '0px', top: '0px' })

watch(
  () => props.seriesGroups.length,
  (count) => {
    if (count > 1) {
      mode.value = 'path'
    }
  },
  { immediate: true },
)

watch(mode, () => {
  tooltip.value = null
  hoveredSeriesKey.value = null
  pinnedSeriesKey.value = null
})

const width = 760
const height = 360
const margin = { top: 26, right: 20, bottom: 50, left: 64 }
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
const palette = ['#1f8f6a', '#245f8f', '#ca6d34', '#6b58c3']

function metricValue(record: CountryYearRecord, metricKey: MetricKey) {
  if (metricKey === 'co2') {
    return record.co2
  }

  if (metricKey === 'consumptionCo2PerCapita') {
    return record.consumptionCo2PerCapita
  }

  return record.co2PerCapita
}

function firstAvailable(values: Array<number | null>) {
  return values.find((value) => value !== null) ?? null
}

function normalize(value: number | null, base: number | null) {
  if (value === null || base === null || base === 0) {
    return null
  }

  return (value / base) * 100
}

function domainWithPadding(values: number[], paddingRatio = 0.12) {
  if (!values.length) {
    return [0, 1]
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || Math.max(Math.abs(max), 1)
  const padding = span * paddingRatio
  return [min - padding, max + padding]
}

const pathSeries = computed(() =>
  props.seriesGroups.map((group, index) => {
    const values = group.values
      .map((record) => ({
        year: record.year,
        gdpPerCapita: record.gdpPerCapita,
        metric: metricValue(record, props.metricKey),
      }))
      .filter(
        (
          point,
        ): point is {
          year: number
          gdpPerCapita: number
          metric: number
        } => point.gdpPerCapita !== null && point.metric !== null,
      )

    const peakPoint =
      values.length > 0
        ? [...values].sort((left, right) => right.metric - left.metric || left.year - right.year)[0]
        : null
    const endPoint = values.at(-1) ?? null
    const turningPoint =
      peakPoint && endPoint && peakPoint.year < endPoint.year && endPoint.metric < peakPoint.metric * 0.97
        ? peakPoint
        : null

    return {
      country: group.country,
      isoCode: group.isoCode,
      color: palette[index % palette.length],
      values,
      startPoint: values[0] ?? null,
      endPoint,
      turningPoint,
    }
  }),
)

const pathPoints = computed(() => pathSeries.value.flatMap((group) => group.values))

const pathXScale = computed(() =>
  scaleLinear().domain(domainWithPadding(pathPoints.value.map((point) => point.gdpPerCapita))).range([0, innerWidth]),
)

const pathYScale = computed(() =>
  scaleLinear().domain(domainWithPadding(pathPoints.value.map((point) => point.metric))).range([innerHeight, 0]),
)

const pathLine = line<{ year: number; gdpPerCapita: number; metric: number }>()
  .x((point) => pathXScale.value(point.gdpPerCapita))
  .y((point) => pathYScale.value(point.metric))

const lineModeSeries = computed(() => {
  if (!props.seriesGroups.length) {
    return []
  }

  if (props.seriesGroups.length === 1) {
    const [group] = props.seriesGroups
    const gdpBase = firstAvailable(group.values.map((record) => record.gdpPerCapita))
    const metricBase = firstAvailable(group.values.map((record) => metricValue(record, props.metricKey)))

    return [
      {
        key: 'gdp',
        label: copy.value.gdpIndex,
        color: '#245f8f',
        values: group.values
          .map((record) => ({ year: record.year, value: normalize(record.gdpPerCapita, gdpBase) }))
          .filter((point): point is { year: number; value: number } => point.value !== null),
      },
      {
        key: 'metric',
        label: copy.value.metricIndex,
        color: '#ca6d34',
        values: group.values
          .map((record) => ({
            year: record.year,
            value: normalize(metricValue(record, props.metricKey), metricBase),
          }))
          .filter((point): point is { year: number; value: number } => point.value !== null),
      },
    ]
  }

  return props.seriesGroups.map((group, index) => {
    const metricBase = firstAvailable(group.values.map((record) => metricValue(record, props.metricKey)))

    return {
      key: group.isoCode,
      label: group.country,
      color: palette[index % palette.length],
      values: group.values
        .map((record) => ({
          year: record.year,
          value: normalize(metricValue(record, props.metricKey), metricBase),
        }))
        .filter((point): point is { year: number; value: number } => point.value !== null),
    }
  })
})

const lineYears = computed(() => {
  const years = props.seriesGroups.flatMap((group) => group.values.map((record) => record.year))
  return [Math.min(...years, 1990), Math.max(...years, 2022)]
})

const yearRangeLabel = computed(() => `${lineYears.value[0]} → ${lineYears.value[1]}`)

const pathSubtitle = computed(
  () =>
    props.locale === 'zh'
      ? `${lineYears.value[0]} 至 ${lineYears.value[1]} 年，人均 GDP 与 ${props.metricLabel} 的历史轨迹。`
      : `${lineYears.value[0]} to ${lineYears.value[1]}, the historical path of GDP per capita and ${props.metricLabel}.`,
)

const lineSubtitle = computed(() => {
  if (props.seriesGroups.length === 1) {
    const country = props.seriesGroups[0]?.country ?? ''
    return props.locale === 'zh'
      ? `${country} 的增长与 ${props.metricLabel} 以起点为 100 的对照线。`
      : `${country}, with growth and ${props.metricLabel} indexed to a common base of 100.`
  }

  return props.locale === 'zh'
    ? `${lineYears.value[0]} 至 ${lineYears.value[1]} 年，把各国 ${props.metricLabel} 的起点统一设为 100。`
    : `${lineYears.value[0]} to ${lineYears.value[1]}, with each country’s ${props.metricLabel} rebased to 100.`
})

const pathLegendText = computed(() => {
  const separator = props.locale === 'zh' ? '：' : ': '
  return `${copy.value.flowLabel}${separator}${yearRangeLabel.value.replace('→', '◯ →')} ●`
})

const pathPeakLabel = computed(() => {
  if (mode.value !== 'path' || pathSeries.value.length !== 1 || !pathSeries.value[0]?.turningPoint) {
    return null
  }

  return `${copy.value.turningLabel} ${pathSeries.value[0].turningPoint.year}`
})

const lineXScale = computed(() => scaleLinear().domain(lineYears.value).range([0, innerWidth]))

const lineYScale = computed(() => {
  const values = lineModeSeries.value.flatMap((series) => series.values.map((point) => point.value))
  const maxValue = values.length ? Math.max(120, ...values.map((value) => Math.ceil(value / 10) * 10)) : 120
  return scaleLinear().domain([0, maxValue]).range([innerHeight, 0])
})

const lineBuilder = line<{ year: number; value: number }>()
  .x((point) => lineXScale.value(point.year))
  .y((point) => lineYScale.value(point.value))

const renewableStart = computed(() => {
  const [primaryGroup] = props.seriesGroups
  return primaryGroup?.values.find((point) => point.renewablesShareEnergy !== null) ?? null
})

const renewableEnd = computed(() => {
  const [primaryGroup] = props.seriesGroups
  return [...(primaryGroup?.values ?? [])].reverse().find((point) => point.renewablesShareEnergy !== null) ?? null
})

const activeSeriesKey = computed(() => pinnedSeriesKey.value ?? hoveredSeriesKey.value)

function seriesOpacity(key: string) {
  if (!activeSeriesKey.value) {
    return 1
  }

  return activeSeriesKey.value === key ? 1 : 0.14
}

function setTooltipPosition(event: MouseEvent) {
  const currentTarget = event.currentTarget as SVGElement | null
  const svg = currentTarget?.ownerSVGElement
  if (!svg) {
    return
  }

  const svgRect = svg.getBoundingClientRect()
  tooltipStyle.value = {
    left: `${event.clientX - svgRect.left + 14}px`,
    top: `${Math.max(event.clientY - svgRect.top - 12, 18)}px`,
  }
}

function showPathTooltip(
  event: MouseEvent,
  series: { country: string; isoCode: string },
  point: { year: number; gdpPerCapita: number; metric: number },
) {
  hoveredSeriesKey.value = series.isoCode
  setTooltipPosition(event)
  tooltip.value = {
    title: series.country,
    subtitle: `${copy.value.year} ${point.year}`,
    rows: [
      { label: copy.value.gdpValue, value: formatNumber(point.gdpPerCapita, 1, props.locale) },
      { label: copy.value.metricValue, value: formatNumber(point.metric, 2, props.locale) },
    ],
  }
}

function showLineTooltip(
  event: MouseEvent,
  series: { key: string; label: string },
  point: { year: number; value: number },
) {
  hoveredSeriesKey.value = series.key
  setTooltipPosition(event)
  tooltip.value = {
    title: series.label,
    subtitle: `${copy.value.year} ${point.year}`,
    rows: [{ label: copy.value.indexValue, value: formatNumber(point.value, 1, props.locale) }],
  }
}

function handleMove(event: MouseEvent) {
  if (!tooltip.value) {
    return
  }

  setTooltipPosition(event)
}

function clearTooltip() {
  tooltip.value = null
  if (!pinnedSeriesKey.value) {
    hoveredSeriesKey.value = null
  }
}

function hoverSeries(key: string | null) {
  if (!pinnedSeriesKey.value) {
    hoveredSeriesKey.value = key
  }
}

function togglePinnedSeries(key: string) {
  pinnedSeriesKey.value = pinnedSeriesKey.value === key ? null : key
  hoveredSeriesKey.value = pinnedSeriesKey.value
}
</script>

<template>
  <div class="chart-card chart-card--interactive">
    <div class="panel-heading">
      <div>
        <h2>{{ copy.title }}</h2>
        <p class="panel-subtitle panel-subtitle--wide">
          {{ mode === 'path' ? pathSubtitle : lineSubtitle }}
        </p>
      </div>

      <div class="mode-switch">
        <button
          type="button"
          :class="['mode-switch__button', { 'mode-switch__button--active': mode === 'path' }]"
          @click="mode = 'path'"
        >
          {{ copy.pathMode }}
        </button>
        <button
          type="button"
          :class="['mode-switch__button', { 'mode-switch__button--active': mode === 'line' }]"
          @click="mode = 'line'"
        >
          {{ copy.lineMode }}
        </button>
      </div>
    </div>

    <div v-if="!seriesGroups.length" class="empty-state">{{ copy.empty }}</div>

    <template v-else-if="mode === 'path'">
      <svg :viewBox="`0 0 ${width} ${height}`" class="line-svg">
        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <line class="axis-line" :x1="0" :x2="innerWidth" :y1="innerHeight" :y2="innerHeight" />
          <line class="axis-line" :x1="0" :x2="0" :y1="0" :y2="innerHeight" />

          <g
            v-for="series in pathSeries"
            :key="series.isoCode"
            @mouseenter="hoverSeries(series.isoCode)"
            @mouseleave="hoverSeries(null)"
          >
            <path
              v-if="series.values.length >= 2"
              :d="pathLine(series.values) ?? undefined"
              class="trajectory-path trajectory-path--scatter"
              :stroke="series.color"
              :style="{ opacity: seriesOpacity(series.isoCode) }"
            />

            <circle
              v-for="point in series.values"
              :key="`${series.isoCode}-${point.year}`"
              class="trajectory-node trajectory-node--scatter"
              :cx="pathXScale(point.gdpPerCapita)"
              :cy="pathYScale(point.metric)"
              r="3.2"
              :fill="series.color"
              :style="{ opacity: seriesOpacity(series.isoCode) }"
              @mouseenter="showPathTooltip($event, series, point)"
              @mousemove="handleMove($event)"
              @mouseleave="clearTooltip"
            />

            <template v-if="series.startPoint">
              <circle
                class="trajectory-marker trajectory-marker--start"
                :cx="pathXScale(series.startPoint.gdpPerCapita)"
                :cy="pathYScale(series.startPoint.metric)"
                r="5.2"
                :style="{ stroke: series.color, opacity: seriesOpacity(series.isoCode) }"
              />
            </template>

            <template v-if="series.turningPoint">
              <circle
                class="trajectory-marker trajectory-marker--turning"
                :cx="pathXScale(series.turningPoint.gdpPerCapita)"
                :cy="pathYScale(series.turningPoint.metric)"
                r="6.2"
                :style="{ stroke: series.color, opacity: seriesOpacity(series.isoCode) }"
              />
              <text
                v-if="seriesGroups.length === 1"
                class="trajectory-annotation"
                :x="pathXScale(series.turningPoint.gdpPerCapita) + 10"
                :y="pathYScale(series.turningPoint.metric) - 12"
              >
                {{ copy.turningLabel }} {{ series.turningPoint.year }}
              </text>
            </template>

            <template v-if="series.endPoint">
              <circle
                class="trajectory-marker trajectory-marker--end"
                :cx="pathXScale(series.endPoint.gdpPerCapita)"
                :cy="pathYScale(series.endPoint.metric)"
                r="6.4"
                :style="{ fill: series.color, opacity: seriesOpacity(series.isoCode) }"
              />
              <text
                class="point-label"
                :x="pathXScale(series.endPoint.gdpPerCapita) + 10"
                :y="pathYScale(series.endPoint.metric) - 10"
                :style="{ opacity: seriesOpacity(series.isoCode) }"
              >
                {{ series.country }}
              </text>
            </template>
          </g>

          <text class="axis-title" :x="innerWidth / 2" :y="innerHeight + 36">{{ copy.axisGdp }}</text>
          <text class="axis-title axis-title--y" :x="-innerHeight / 2" :y="-42">{{ copy.axisMetric }}</text>
        </g>
      </svg>

      <div class="trajectory-legend trajectory-legend--interactive">
        <button
          v-for="series in pathSeries"
          :key="series.isoCode"
          type="button"
          :class="[
            'legend-item',
            'legend-item--button',
            { 'legend-item--active': activeSeriesKey === series.isoCode || !activeSeriesKey },
          ]"
          @click="togglePinnedSeries(series.isoCode)"
        >
          <span class="legend-swatch" :style="{ backgroundColor: series.color }"></span>
          {{ series.country }}
        </button>
        <div class="legend-item legend-item--note trajectory-marker-note">
          <span class="trajectory-flow">{{ pathLegendText }}</span>
          <strong v-if="pathPeakLabel">{{ pathPeakLabel }}</strong>
        </div>
      </div>
    </template>

    <template v-else>
      <svg :viewBox="`0 0 ${width} ${height}`" class="line-svg">
        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <line class="axis-line" :x1="0" :x2="innerWidth" :y1="innerHeight" :y2="innerHeight" />
          <line class="axis-line" :x1="0" :x2="0" :y1="0" :y2="innerHeight" />
          <line class="grid-line" :x1="0" :x2="innerWidth" :y1="lineYScale(100)" :y2="lineYScale(100)" />
          <text class="grid-label" x="8" :y="lineYScale(100) - 8">{{ copy.baseLine }}</text>

          <g
            v-for="series in lineModeSeries"
            :key="series.key"
            @mouseenter="hoverSeries(series.key)"
            @mouseleave="hoverSeries(null)"
          >
            <path
              v-if="series.values.length >= 2"
              :d="lineBuilder(series.values) ?? undefined"
              class="line"
              :stroke="series.color"
              :style="{ opacity: seriesOpacity(series.key) }"
            />
            <circle
              v-for="point in series.values"
              :key="`${series.key}-${point.year}`"
              class="line-point"
              :fill="series.color"
              :cx="lineXScale(point.year)"
              :cy="lineYScale(point.value)"
              r="3.2"
              :style="{ opacity: seriesOpacity(series.key) }"
              @mouseenter="showLineTooltip($event, series, point)"
              @mousemove="handleMove($event)"
              @mouseleave="clearTooltip"
            />
          </g>

          <text class="axis-title" :x="innerWidth / 2" :y="innerHeight + 34">{{ copy.axisYear }}</text>
        </g>
      </svg>

      <div class="trajectory-legend trajectory-legend--interactive">
        <button
          v-for="series in lineModeSeries"
          :key="series.key"
          type="button"
          :class="[
            'legend-item',
            'legend-item--button',
            { 'legend-item--active': activeSeriesKey === series.key || !activeSeriesKey },
          ]"
          @click="togglePinnedSeries(series.key)"
        >
          <span class="legend-swatch" :style="{ backgroundColor: series.color }"></span>
          {{ series.label }}
        </button>
        <div v-if="seriesGroups.length === 1" class="legend-item legend-item--note">
          {{ copy.renewables }}:
          <strong>{{ formatShare(renewableStart?.renewablesShareEnergy ?? null, 1, locale) }}</strong>
          →
          <strong>{{ formatShare(renewableEnd?.renewablesShareEnergy ?? null, 1, locale) }}</strong>
        </div>
        <div class="legend-item legend-item--note trajectory-marker-note">
          <span class="trajectory-flow">
            {{ seriesGroups.length > 1 ? copy.lineMultiLabel : copy.lineSingleLabel }}
          </span>
        </div>
      </div>
    </template>

    <div v-if="tooltip" class="chart-tooltip" :style="tooltipStyle">
      <div class="chart-tooltip__top">
        <strong>{{ tooltip.title }}</strong>
        <span>{{ tooltip.subtitle }}</span>
      </div>
      <div class="chart-tooltip__comparison">
        <div v-for="row in tooltip.rows" :key="row.label">
          <span>{{ row.label }}</span>
          <strong>{{ row.value }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>
