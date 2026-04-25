<script setup lang="ts">
import { computed, ref } from 'vue'
import { scaleLinear, scaleSqrt } from 'd3-scale'
import EvidenceStrip from './EvidenceStrip.vue'
import type { Locale, OverviewPoint, StoryChapterPreview } from '../types'
import { formatSignedPercent } from '../utils/formatters'

const props = defineProps<{
  preview: StoryChapterPreview
  locale: Locale
}>()

const width = 440
const height = 292
const margin = { top: 20, right: 28, bottom: 42, left: 48 }
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
const hoveredPoint = ref<OverviewPoint | null>(null)
const tooltipStyle = ref({ left: '0px', top: '0px' })
const previewRoot = ref<HTMLElement | null>(null)

const statusColor: Record<OverviewPoint['status'], string> = {
  decoupled: '#16805f',
  'growth-with-emissions': '#c8753c',
  'low-growth-lower-emissions': '#7c8a88',
  'low-growth-higher-emissions': '#9a6a6a',
}

const statusLabels: Record<OverviewPoint['status'], Record<Locale, string>> = {
  decoupled: { zh: '绝对脱钩', en: 'Absolute decoupling' },
  'growth-with-emissions': { zh: '增长伴随排放', en: 'Growth with emissions' },
  'low-growth-lower-emissions': { zh: '低增长 / 低排放', en: 'Low growth / lower emissions' },
  'low-growth-higher-emissions': { zh: '低增长 / 高排放', en: 'Low growth / higher emissions' },
}

const copy = computed(() => {
  const count = props.preview.overviewPoints?.length ?? 0
  const decoupledCount = props.preview.overviewPoints?.filter((point) => point.status === 'decoupled').length ?? 0

  if (props.preview.mode === 'explore') {
    return props.locale === 'zh'
      ? {
          headline: '接下来，把判断交还给数据',
          subtitle: '下方 Atlas 会保留完整控件。换年份、换指标、刷选国家，检查前面的故事是否仍然成立。',
          xLabel: '人均 GDP 变化',
          yLabel: props.preview.metricLabel,
          stat: '开放探索',
          hint: '点击“进入数据探索”后继续。',
          country: '国家/地区',
          status: '类型',
          gdp: 'GDP 变化',
          metric: '排放变化',
        }
      : {
          headline: 'Now hand the judgment back to the data',
          subtitle: 'The Atlas below keeps every control open. Change years, switch metrics, and brush countries to test the story.',
          xLabel: 'GDP per capita change',
          yLabel: props.preview.metricLabel,
          stat: 'Open exploration',
          hint: 'Continue with the data explorer below.',
          country: 'Country',
          status: 'Type',
          gdp: 'GDP change',
          metric: 'Emissions change',
        }
  }

  return props.locale === 'zh'
    ? {
        headline:
          props.preview.mode === 'absolute'
            ? '右下象限里，增长和排放开始分离'
            : '全球国家的增长与排放位移',
        subtitle: `${props.preview.startYear} 至 ${props.preview.endYear} 年，横轴为人均 GDP 变化，纵轴为 ${props.preview.metricLabel} 变化。`,
        xLabel: '人均 GDP 变化',
        yLabel: props.preview.metricLabel,
        stat:
          props.preview.mode === 'absolute'
            ? `${decoupledCount} 个国家进入右下象限`
            : `${count} 个国家/地区有完整数据`,
        hint:
          props.preview.mode === 'absolute'
            ? '绿色点是经济增长且人均排放下降的国家。'
            : '',
        country: '国家/地区',
        status: '类型',
        gdp: 'GDP 变化',
        metric: '排放变化',
      }
    : {
        headline:
          props.preview.mode === 'absolute'
            ? 'In the lower-right, growth and emissions split apart'
            : 'Global movement of growth and emissions',
        subtitle: `${props.preview.startYear} to ${props.preview.endYear}, x is GDP per capita change and y is ${props.preview.metricLabel} change.`,
        xLabel: 'GDP per capita change',
        yLabel: props.preview.metricLabel,
        stat:
          props.preview.mode === 'absolute'
            ? `${decoupledCount} countries enter the lower-right`
            : `${count} countries or regions have complete data`,
        hint:
          props.preview.mode === 'absolute'
            ? 'Green dots are countries with growth and falling emissions per person.'
            : 'The crosshair separates the four directions; the lower-right matters most.',
        country: 'Country',
        status: 'Type',
        gdp: 'GDP change',
        metric: 'Emissions change',
      }
})

function quantile(values: number[], p: number) {
  if (!values.length) {
    return 0
  }

  const sorted = [...values].sort((left, right) => left - right)
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower

  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

function clippedDomain(values: number[]) {
  if (!values.length) {
    return [-1, 1]
  }

  const lower = quantile(values, 0.05)
  const upper = quantile(values, 0.95)
  const span = upper - lower || Math.max(Math.abs(upper), 1)
  return [lower - span * 0.1, upper + span * 0.1]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

const points = computed(() => props.preview.overviewPoints ?? [])
const xScale = computed(() => scaleLinear().domain(clippedDomain(points.value.map((point) => point.gdpChangePct))).range([0, innerWidth]))
const yScale = computed(() => scaleLinear().domain(clippedDomain(points.value.map((point) => point.metricChangePct))).range([innerHeight, 0]))
const radiusScale = computed(() =>
  scaleSqrt()
    .domain([0, Math.max(...points.value.map((point) => point.endRecord.population ?? 0), 1)])
    .range([3, 12]),
)

const chartPoints = computed(() =>
  points.value.map((point) => {
    const clippedX = clamp(xScale.value(point.gdpChangePct), 0, innerWidth)
    const clippedY = clamp(yScale.value(point.metricChangePct), 0, innerHeight)
    const highlighted = !props.preview.highlightStatus || point.status === props.preview.highlightStatus

    return {
      point,
      x: clippedX,
      y: clippedY,
      radius: radiusScale.value(point.endRecord.population ?? 0),
      color: statusColor[point.status],
      highlighted,
      clipped: clippedX !== xScale.value(point.gdpChangePct) || clippedY !== yScale.value(point.metricChangePct),
    }
  }),
)

const zeroX = computed(() => clamp(xScale.value(0), 0, innerWidth))
const zeroY = computed(() => clamp(yScale.value(0), 0, innerHeight))

function updateTooltip(event: MouseEvent, point: OverviewPoint) {
  const rect = previewRoot.value?.getBoundingClientRect()
  if (!rect) {
    return
  }

  hoveredPoint.value = point
  tooltipStyle.value = {
    left: `${clamp(event.clientX - rect.left + 12, 12, Math.max(rect.width - 220, 12))}px`,
    top: `${clamp(event.clientY - rect.top - 8, 12, Math.max(rect.height - 116, 12))}px`,
  }
}
</script>

<template>
  <div ref="previewRoot" class="story-preview story-overview">
    <div class="story-preview__header">
      <h4 class="story-preview__headline">{{ copy.headline }}</h4>
      <p class="story-preview__subtitle">{{ copy.subtitle }}</p>
    </div>

    <div class="story-overview__stat">
      <strong>{{ copy.stat }}</strong>
      <span>{{ copy.hint }}</span>
    </div>

    <svg
      v-if="preview.mode !== 'explore'"
      :viewBox="`0 0 ${width} ${height}`"
      class="story-preview__svg story-overview__svg"
      @mouseleave="hoveredPoint = null"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <line class="story-overview__zero" :x1="zeroX" :x2="zeroX" :y1="0" :y2="innerHeight" />
        <line class="story-overview__zero" :x1="0" :x2="innerWidth" :y1="zeroY" :y2="zeroY" />
        <text class="story-overview__watermark" :x="innerWidth - 4" :y="innerHeight - 8" text-anchor="end">
          {{ locale === 'zh' ? '绝对脱钩' : 'Decoupling' }}
        </text>
        <text class="story-overview__watermark" :x="innerWidth - 4" :y="18" text-anchor="end">
          {{ locale === 'zh' ? '增长伴随排放' : 'Growth with emissions' }}
        </text>

        <circle
          v-for="item in chartPoints"
          :key="item.point.isoCode"
          class="story-overview__point"
          :class="{ 'story-overview__point--muted': !item.highlighted }"
          :cx="item.x"
          :cy="item.y"
          :r="item.radius"
          :fill="item.color"
          :stroke="item.color"
          @mouseenter="updateTooltip($event, item.point)"
          @mousemove="updateTooltip($event, item.point)"
        />

        <text class="axis-title" :x="innerWidth / 2" :y="innerHeight + 30">{{ copy.xLabel }}</text>
        <text class="axis-title axis-title--y" :x="-innerHeight / 2" :y="-32">{{ copy.yLabel }}</text>
      </g>
    </svg>

    <div v-else class="story-overview__explore-card">
      <span>{{ locale === 'zh' ? '可用操作' : 'Available actions' }}</span>
      <strong>{{ locale === 'zh' ? '缩放 · 框选 · 点击 · 切换指标 · 时间播放' : 'Zoom · Brush · Click · Switch metrics · Play time' }}</strong>
    </div>

    <div v-if="hoveredPoint" class="chart-tooltip story-preview__tooltip" :style="tooltipStyle">
      <div class="chart-tooltip__top">
        <strong>{{ hoveredPoint.country }}</strong>
        <span>{{ statusLabels[hoveredPoint.status][locale] }}</span>
      </div>
      <div class="chart-tooltip__comparison">
        <div>
          <span>{{ copy.gdp }}</span>
          <strong>{{ formatSignedPercent(hoveredPoint.gdpChangePct, 1, locale) }}</strong>
        </div>
        <div>
          <span>{{ copy.metric }}</span>
          <strong>{{ formatSignedPercent(hoveredPoint.metricChangePct, 1, locale) }}</strong>
        </div>
      </div>
    </div>

    <p class="story-preview__flow">
      <strong>{{ locale === 'zh' ? '时间窗口：' : 'Window: ' }}</strong>
      {{ preview.startYear }} → {{ preview.endYear }}
    </p>

    <EvidenceStrip v-if="preview.seriesGroups.length" :preview="preview" :locale="locale" />
  </div>
</template>
