<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
const animatedYear = ref(props.preview.endYear)
let playbackTimer: number | null = null

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
  if (props.preview.mode === 'explore') {
    return props.locale === 'zh'
      ? {
          headline: '接下来，把判断交还给数据',
          subtitle: '探索模式中有完整控件。',
          xLabel: '人均 GDP 变化',
          yLabel: props.preview.metricLabel,
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
  const min = Math.min(lower, 0)
  const max = Math.max(upper, 0)
  const span = max - min || Math.max(Math.abs(max), 1)
  return [min - span * 0.1, max + span * 0.1]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

const isAnimatedGlobal = computed(
  () => props.preview.chapterId === 'tour-global' && (props.preview.overviewTimelinePoints?.length ?? 0) > 0,
)
const animationYears = computed(() =>
  [...new Set((props.preview.overviewTimelinePoints ?? []).map((point) => point.endYear))].sort(
    (left, right) => left - right,
  ),
)
const points = computed(() => props.preview.overviewPoints ?? [])
const displayPoints = computed(() =>
  isAnimatedGlobal.value
    ? (props.preview.overviewTimelinePoints ?? []).filter((point) => point.endYear === animatedYear.value)
    : points.value,
)
const xScale = computed(() => scaleLinear().domain(clippedDomain(points.value.map((point) => point.gdpChangePct))).range([0, innerWidth]))
const yScale = computed(() => scaleLinear().domain(clippedDomain(points.value.map((point) => point.metricChangePct))).range([innerHeight, 0]))
const radiusScale = computed(() =>
  scaleSqrt()
    .domain([0, Math.max(...points.value.map((point) => point.endRecord.population ?? 0), 1)])
    .range([3, 12]),
)

const chartPoints = computed(() =>
  displayPoints.value.map((point) => {
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

const currentPointByIso = computed(() => new Map(chartPoints.value.map((item) => [item.point.isoCode, item])))

const motionTrails = computed(() => {
  if (!isAnimatedGlobal.value) {
    return []
  }

  const groupedPoints = new Map<string, OverviewPoint[]>()

  for (const point of props.preview.overviewTimelinePoints ?? []) {
    if (point.endYear > animatedYear.value) {
      continue
    }

    const history = groupedPoints.get(point.isoCode) ?? []
    history.push(point)
    groupedPoints.set(point.isoCode, history)
  }

  return Array.from(groupedPoints.entries()).flatMap(([isoCode, history]) => {
    if (history.length < 2) {
      return []
    }

    const currentPoint = currentPointByIso.value.get(isoCode)
    if (!currentPoint) {
      return []
    }

    const nodes = history
      .sort((left, right) => left.endYear - right.endYear)
      .map((point) => ({
        x: clamp(xScale.value(point.gdpChangePct), 0, innerWidth),
        y: clamp(yScale.value(point.metricChangePct), 0, innerHeight),
      }))

    return [
      {
        isoCode,
        path: nodes.map((node, index) => `${index === 0 ? 'M' : 'L'} ${node.x} ${node.y}`).join(' '),
        color: currentPoint.color,
        highlighted: currentPoint.highlighted,
      },
    ]
  })
})

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

function stopPlayback() {
  if (playbackTimer !== null) {
    window.clearInterval(playbackTimer)
    playbackTimer = null
  }
}

function startPlayback() {
  stopPlayback()

  if (!isAnimatedGlobal.value || animationYears.value.length < 2) {
    animatedYear.value = props.preview.endYear
    return
  }

  animatedYear.value = animationYears.value[0]
  playbackTimer = window.setInterval(() => {
    const currentIndex = animationYears.value.indexOf(animatedYear.value)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % animationYears.value.length : 0
    animatedYear.value = animationYears.value[nextIndex]
  }, 620)
}

watch(
  () => props.preview.chapterId,
  () => {
    startPlayback()
  },
  { immediate: true },
)

watch(
  () => props.preview.overviewTimelinePoints,
  () => {
    startPlayback()
  },
)

onBeforeUnmount(stopPlayback)
</script>

<template>
  <div ref="previewRoot" class="story-preview story-overview">
    <div class="story-preview__header">
      <h4 class="story-preview__headline">{{ copy.headline }}</h4>
      <p class="story-preview__subtitle">{{ copy.subtitle }}</p>
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
        <text v-if="isAnimatedGlobal" class="story-overview__year" :x="innerWidth - 4" y="36" text-anchor="end">
          {{ preview.startYear }} → {{ animatedYear }}
        </text>

        <path
          v-for="trail in motionTrails"
          :key="`${trail.isoCode}-trail`"
          class="story-overview__trail"
          :class="{ 'story-overview__trail--muted': !trail.highlighted }"
          :d="trail.path"
          :stroke="trail.color"
        />

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

    <EvidenceStrip v-if="preview.seriesGroups.length" :preview="preview" :locale="locale" />
  </div>
</template>
