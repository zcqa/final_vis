<script setup lang="ts">
import { computed } from 'vue'
import { line } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import type { CountrySummary, Locale } from '../types'
import { formatNumber, formatSignedPercent } from '../utils/formatters'

interface TypologyPreviewSeries {
  country: string
  isoCode: string
  values: Array<{ year: number; gdpPerCapita: number; co2PerCapita: number }>
}

interface TypologyCard {
  id: CountrySummary['trajectoryType']
  title: string
  description: string
  count: number
  medianGdpChangePct: number | null
  medianCo2PerCapitaChangePct: number | null
  representativeCountries: string[]
  representatives: TypologyPreviewSeries[]
}

const props = defineProps<{
  cards: TypologyCard[]
  locale: Locale
}>()

const emit = defineEmits<{
  'focus-type': [trajectoryType: CountrySummary['trajectoryType']]
}>()

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        eyebrow: 'Typology',
        title: '四种常见路径',
        description:
          '',
        sampleCount: '国家数',
        medianGdp: 'GDP 中位变化',
        medianCo2: '人均 CO2 中位变化',
        focusButton: '查看这组国家',
        ruleLabel: '规则',
      }
    : {
        eyebrow: 'Patterns',
        title: 'Four paths that keep showing up',
        description:
          'Once the countries are viewed together, many differences stop looking like isolated cases and start reading as recurring path types.',
        sampleCount: 'Cases',
        medianGdp: 'Median GDP change',
        medianCo2: 'Median CO2 / cap change',
        focusButton: 'Open this group',
        ruleLabel: 'Rule',
      },
)

const ruleText = computed<Record<CountrySummary['trajectoryType'], string>>(() =>
  props.locale === 'zh'
    ? {
        'absolute-decoupling': 'GDP > 0，且人均 CO2 < 0',
        'relative-decoupling': 'GDP > 0，CO2 增速低于 GDP',
        'growth-with-emissions': 'GDP > 0，CO2 同步或更快上升',
        'volatile-transition': '出现峰值或回落，但末端不稳定',
      }
    : {
        'absolute-decoupling': 'GDP > 0 and CO2 / cap < 0',
        'relative-decoupling': 'GDP > 0; CO2 rises slower than GDP',
        'growth-with-emissions': 'GDP > 0; CO2 rises with or faster than GDP',
        'volatile-transition': 'Peak or decline appears, but the end remains unstable',
      },
)

const previewWidth = 180
const previewHeight = 108
const previewMargin = { top: 8, right: 10, bottom: 10, left: 10 }
const previewInnerWidth = previewWidth - previewMargin.left - previewMargin.right
const previewInnerHeight = previewHeight - previewMargin.top - previewMargin.bottom

function domainWithPadding(values: number[]) {
  if (!values.length) {
    return [0, 1]
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || Math.max(Math.abs(max), 1)
  const padding = span * 0.14
  return [min - padding, max + padding]
}

function miniLinePath(values: TypologyPreviewSeries['values']) {
  const xScale = scaleLinear()
    .domain(domainWithPadding(values.map((point) => point.gdpPerCapita)))
    .range([0, previewInnerWidth])
  const yScale = scaleLinear()
    .domain(domainWithPadding(values.map((point) => point.co2PerCapita)))
    .range([previewInnerHeight, 0])

  return line<{ year: number; gdpPerCapita: number; co2PerCapita: number }>()
    .x((point) => xScale(point.gdpPerCapita))
    .y((point) => yScale(point.co2PerCapita))(values)
}

function miniPointX(values: TypologyPreviewSeries['values'], field: 'start' | 'end') {
  const point = field === 'start' ? values[0] : values.at(-1)
  if (!point) {
    return 0
  }

  const xScale = scaleLinear()
    .domain(domainWithPadding(values.map((entry) => entry.gdpPerCapita)))
    .range([0, previewInnerWidth])

  return xScale(point.gdpPerCapita)
}

function miniPointY(values: TypologyPreviewSeries['values'], field: 'start' | 'end') {
  const point = field === 'start' ? values[0] : values.at(-1)
  if (!point) {
    return 0
  }

  const yScale = scaleLinear()
    .domain(domainWithPadding(values.map((entry) => entry.co2PerCapita)))
    .range([previewInnerHeight, 0])

  return yScale(point.co2PerCapita)
}
</script>

<template>
  <section id="typology-section" class="typology-stage">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ copy.eyebrow }}</p>
        <h2>{{ copy.title }}</h2>
      </div>
      <p class="panel-copy panel-copy--wide">{{ copy.description }}</p>
    </div>

    <div class="typology-grid">
      <article v-for="card in cards" :key="card.id" class="typology-card">
        <div class="typology-card__header">
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
          <div class="typology-rule">
            <span>{{ copy.ruleLabel }}</span>
            <strong>{{ ruleText[card.id] }}</strong>
          </div>
        </div>

        <div class="typology-card__meta">
          <strong>{{ copy.sampleCount }} {{ formatNumber(card.count, 0, locale) }}</strong>
          <span>{{ copy.medianGdp }} {{ formatSignedPercent(card.medianGdpChangePct, 1, locale) }}</span>
          <span>{{ copy.medianCo2 }} {{ formatSignedPercent(card.medianCo2PerCapitaChangePct, 1, locale) }}</span>
        </div>

        <div class="typology-card__previews">
          <div v-for="series in card.representatives" :key="series.isoCode" class="typology-mini">
            <svg :viewBox="`0 0 ${previewWidth} ${previewHeight}`" class="typology-mini__svg">
              <g :transform="`translate(${previewMargin.left}, ${previewMargin.top})`">
                <path
                  v-if="series.values.length >= 2"
                  :d="miniLinePath(series.values) ?? undefined"
                  class="trajectory-path trajectory-path--scatter typology-mini__path"
                  stroke="#1f8f6a"
                />
                <circle
                  v-if="series.values.length"
                  class="trajectory-marker trajectory-marker--start"
                  :cx="miniPointX(series.values, 'start')"
                  :cy="miniPointY(series.values, 'start')"
                  r="3.8"
                  style="stroke: #1f8f6a"
                />
                <circle
                  v-if="series.values.length"
                  class="trajectory-marker trajectory-marker--end"
                  :cx="miniPointX(series.values, 'end')"
                  :cy="miniPointY(series.values, 'end')"
                  r="4"
                  style="fill: #1f8f6a"
                />
              </g>
            </svg>
            <span>{{ series.country }}</span>
          </div>
        </div>

        <button type="button" class="typology-link" @click="emit('focus-type', card.id)">
          {{ copy.focusButton }}
        </button>
      </article>
    </div>
  </section>
</template>
