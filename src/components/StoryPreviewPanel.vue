<script setup lang="ts">
import { computed, ref } from 'vue'
import { line } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import type { CountryYearRecord, Locale, MetricKey, StoryChapterPreview } from '../types'
import { formatNumber } from '../utils/formatters'

const props = defineProps<{
  preview: StoryChapterPreview
  locale: Locale
}>()

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        headline: '经济增长与碳足迹的历史轨迹',
        xLabel: '人均 GDP',
        yLabel: props.preview.metricLabel,
        subtitle:
          `${props.preview.startYear} 至 ${props.preview.endYear} 年，人均 GDP 与 ${props.preview.metricLabel} 的演变。`,
        flowLabel: '轨迹流向',
        flowText: `${props.preview.startYear} ◯ → ${props.preview.endYear} ●`,
        year: '年份',
        gdp: '人均 GDP',
      }
    : {
        headline: 'Historical trajectories of growth and carbon',
        xLabel: 'GDP per capita',
        yLabel: props.preview.metricLabel,
        subtitle:
          `${props.preview.startYear} to ${props.preview.endYear}, the evolution of GDP per capita and ${props.preview.metricLabel}.`,
        flowLabel: 'Flow',
        flowText: `${props.preview.startYear} ◯ → ${props.preview.endYear} ●`,
        year: 'Year',
        gdp: 'GDP per capita',
      },
)

const width = 440
const height = 292
const margin = { top: 18, right: 78, bottom: 42, left: 54 }
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
const palette = ['#1f8f6a', '#245f8f', '#ca6d34', '#6b58c3']
const hoveredSeriesKey = ref<string | null>(null)
const tooltip = ref<{
  country: string
  year: number
  gdpPerCapita: number
  metric: number
} | null>(null)
const tooltipStyle = ref({ left: '0px', top: '0px' })
const previewRoot = ref<HTMLElement | null>(null)

interface AnnotationTemplate {
  isoCode: string
  point: 'turningPoint' | 'endPoint'
  title: string
  body: string[]
  dx: number
  dy: number
  width: number
}

const annotationTemplates: Record<Locale, Record<string, AnnotationTemplate[]>> = {
  zh: {
    'uk-germany': [
      {
        isoCode: 'GBR',
        point: 'turningPoint',
        title: '英国',
        body: ['2015年后煤电加速退出', '线条明显向右下折返'],
        dx: -170,
        dy: -82,
        width: 142,
      },
      {
        isoCode: 'DEU',
        point: 'endPoint',
        title: '德国',
        body: ['同样下降，但转身更慢', '工业包袱也更重'],
        dx: 16,
        dy: -18,
        width: 142,
      },
    ],
    'us-india': [
      {
        isoCode: 'USA',
        point: 'turningPoint',
        title: '美国',
        body: ['越过工业化峰值之后', '排放强度开始回落'],
        dx: -176,
        dy: 18,
        width: 146,
      },
      {
        isoCode: 'IND',
        point: 'endPoint',
        title: '印度',
        body: ['仍在向右上攀升', '增长与排放基本同步'],
        dx: 18,
        dy: 26,
        width: 136,
      },
    ],
    china: [
      {
        isoCode: 'CHN',
        point: 'turningPoint',
        title: '中国',
        body: ['新能源投资激增之后', '曲线末端开始显露平台期'],
        dx: -188,
        dy: -82,
        width: 158,
      },
    ],
    'high-income': [
      {
        isoCode: 'GBR',
        point: 'endPoint',
        title: '英国',
        body: ['消费端算回来后', '脱钩弧线没有表面上那么陡'],
        dx: -178,
        dy: -68,
        width: 152,
      },
      {
        isoCode: 'SWE',
        point: 'endPoint',
        title: '瑞典',
        body: ['同属高收入国家', '低碳结构却更稳定'],
        dx: 18,
        dy: -18,
        width: 136,
      },
    ],
  },
  en: {
    'uk-germany': [
      {
        isoCode: 'GBR',
        point: 'turningPoint',
        title: 'United Kingdom',
        body: ['After 2015, coal falls fast', 'and the line bends downward'],
        dx: -202,
        dy: -82,
        width: 174,
      },
      {
        isoCode: 'DEU',
        point: 'endPoint',
        title: 'Germany',
        body: ['It declines too, but on a', 'slower and heavier track'],
        dx: 16,
        dy: -18,
        width: 162,
      },
    ],
    'us-india': [
      {
        isoCode: 'USA',
        point: 'turningPoint',
        title: 'United States',
        body: ['After the industrial peak,', 'emissions intensity eases back'],
        dx: -212,
        dy: 18,
        width: 178,
      },
      {
        isoCode: 'IND',
        point: 'endPoint',
        title: 'India',
        body: ['Still climbing toward the', 'upper-right with growth'],
        dx: 18,
        dy: 26,
        width: 158,
      },
    ],
    china: [
      {
        isoCode: 'CHN',
        point: 'turningPoint',
        title: 'China',
        body: ['Heavy clean-energy investment', 'is beginning to flatten the line'],
        dx: -210,
        dy: -82,
        width: 182,
      },
    ],
    'high-income': [
      {
        isoCode: 'GBR',
        point: 'endPoint',
        title: 'United Kingdom',
        body: ['Once consumption is counted,', 'the curve looks less dramatic'],
        dx: -210,
        dy: -68,
        width: 182,
      },
      {
        isoCode: 'SWE',
        point: 'endPoint',
        title: 'Sweden',
        body: ['Another rich-country case,', 'but with steadier low-carbon depth'],
        dx: 18,
        dy: -18,
        width: 174,
      },
    ],
  },
}

function metricValue(record: CountryYearRecord, metricKey: MetricKey) {
  if (metricKey === 'co2') {
    return record.co2
  }

  if (metricKey === 'consumptionCo2PerCapita') {
    return record.consumptionCo2PerCapita
  }

  return record.co2PerCapita
}

function domainWithPadding(values: number[]) {
  if (!values.length) {
    return [0, 1]
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || Math.max(Math.abs(max), 1)
  const padding = span * 0.12
  return [min - padding, max + padding]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

const previewSeries = computed(() =>
  props.preview.seriesGroups
    .map((group, index) => {
      const values = group.values
        .map((record) => ({
          year: record.year,
          gdpPerCapita: record.gdpPerCapita,
          metric: metricValue(record, props.preview.metricKey),
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
    })
    .filter((series) => series.values.length > 0),
)

const previewPoints = computed(() => previewSeries.value.flatMap((series) => series.values))

const xScale = computed(() =>
  scaleLinear().domain(domainWithPadding(previewPoints.value.map((point) => point.gdpPerCapita))).range([0, innerWidth]),
)

const yScale = computed(() =>
  scaleLinear().domain(domainWithPadding(previewPoints.value.map((point) => point.metric))).range([innerHeight, 0]),
)

const previewLine = line<{ year: number; gdpPerCapita: number; metric: number }>()
  .x((point) => xScale.value(point.gdpPerCapita))
  .y((point) => yScale.value(point.metric))

const interactivePoints = computed(() =>
  previewSeries.value.flatMap((series) =>
    series.values.map((point) => ({
      series,
      point,
      x: xScale.value(point.gdpPerCapita),
      y: yScale.value(point.metric),
    })),
  ),
)

const previewAnnotations = computed(() =>
  (annotationTemplates[props.locale][props.preview.chapterId] ?? [])
    .map((annotation) => {
      const series = previewSeries.value.find((candidate) => candidate.isoCode === annotation.isoCode)
      const point =
        (annotation.point === 'turningPoint' ? series?.turningPoint : series?.endPoint) ??
        series?.endPoint ??
        series?.turningPoint ??
        series?.startPoint

      if (!series || !point) {
        return null
      }

      const targetX = xScale.value(point.gdpPerCapita)
      const targetY = yScale.value(point.metric)
      const boxHeight = 26 + annotation.body.length * 12
      const boxX = clamp(targetX + annotation.dx, 8, innerWidth - annotation.width - 8)
      const boxY = clamp(targetY + annotation.dy, 8, innerHeight - boxHeight - 8)
      const lineX = annotation.dx < 0 ? boxX + annotation.width : boxX
      const lineY = boxY + boxHeight / 2

      return {
        ...annotation,
        boxHeight,
        boxX,
        boxY,
        lineX,
        lineY,
        targetX,
        targetY,
      }
    })
    .filter(
      (
        annotation,
      ): annotation is AnnotationTemplate & {
        boxHeight: number
        boxX: number
        boxY: number
        lineX: number
        lineY: number
        targetX: number
        targetY: number
      } => annotation !== null,
    ),
)

const activeSeriesKey = computed(() => hoveredSeriesKey.value)

function seriesOpacity(isoCode: string) {
  if (!activeSeriesKey.value) {
    return 1
  }

  return activeSeriesKey.value === isoCode ? 1 : 0.16
}

function nearestPointForEvent(
  event: MouseEvent,
  series: {
    values: Array<{ year: number; gdpPerCapita: number; metric: number }>
  },
) {
  const svg = (event.currentTarget as SVGElement | null)?.ownerSVGElement
  const svgRect = svg?.getBoundingClientRect()
  if (!svgRect || !series.values.length) {
    return series.values[0] ?? null
  }

  const mouseX = ((event.clientX - svgRect.left) / svgRect.width) * width - margin.left
  const mouseY = ((event.clientY - svgRect.top) / svgRect.height) * height - margin.top

  return [...series.values].sort((left, right) => {
    const leftDistance = Math.hypot(xScale.value(left.gdpPerCapita) - mouseX, yScale.value(left.metric) - mouseY)
    const rightDistance = Math.hypot(xScale.value(right.gdpPerCapita) - mouseX, yScale.value(right.metric) - mouseY)
    return leftDistance - rightDistance
  })[0]
}

function updateTooltipPosition(event: MouseEvent) {
  const rect = previewRoot.value?.getBoundingClientRect()
  if (!rect) {
    return
  }

  const tooltipWidth = 220
  const tooltipHeight = 118
  const rawLeft = event.clientX - rect.left + 12
  const rawTop = event.clientY - rect.top - 10

  tooltipStyle.value = {
    left: `${clamp(rawLeft, 12, Math.max(rect.width - tooltipWidth - 12, 12))}px`,
    top: `${clamp(rawTop, 12, Math.max(rect.height - tooltipHeight - 12, 12))}px`,
  }
}

function showSeriesTooltip(
  event: MouseEvent,
  series: {
    country: string
    isoCode: string
    values: Array<{ year: number; gdpPerCapita: number; metric: number }>
  },
) {
  const point = nearestPointForEvent(event, series)
  if (!point) {
    return
  }

  hoveredSeriesKey.value = series.isoCode
  tooltip.value = {
    country: series.country,
    year: point.year,
    gdpPerCapita: point.gdpPerCapita,
    metric: point.metric,
  }
  updateTooltipPosition(event)
}

function handleSvgMove(event: MouseEvent) {
  const target = event.currentTarget as SVGElement
  const svg = target instanceof SVGSVGElement ? target : target.ownerSVGElement
  const svgRect = svg?.getBoundingClientRect()
  if (!svgRect) {
    return
  }

  const mouseX = ((event.clientX - svgRect.left) / svgRect.width) * width - margin.left
  const mouseY = ((event.clientY - svgRect.top) / svgRect.height) * height - margin.top

  const nearest = [...interactivePoints.value].sort((left, right) => {
    const leftDistance = Math.hypot(left.x - mouseX, left.y - mouseY)
    const rightDistance = Math.hypot(right.x - mouseX, right.y - mouseY)
    return leftDistance - rightDistance
  })[0]

  if (!nearest || Math.hypot(nearest.x - mouseX, nearest.y - mouseY) > 24) {
    clearTooltip()
    return
  }

  hoveredSeriesKey.value = nearest.series.isoCode
  tooltip.value = {
    country: nearest.series.country,
    year: nearest.point.year,
    gdpPerCapita: nearest.point.gdpPerCapita,
    metric: nearest.point.metric,
  }
  updateTooltipPosition(event)
}

function clearTooltip() {
  hoveredSeriesKey.value = null
  tooltip.value = null
}
</script>

<template>
  <div ref="previewRoot" class="story-preview">
    <div class="story-preview__header">
      <h4 class="story-preview__headline">{{ copy.headline }}</h4>
      <p class="story-preview__subtitle">{{ copy.subtitle }}</p>
    </div>

    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="story-preview__svg"
      @mousemove="handleSvgMove"
      @mouseleave="clearTooltip"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <line class="axis-line" :x1="0" :x2="innerWidth" :y1="innerHeight" :y2="innerHeight" />
        <line class="axis-line" :x1="0" :x2="0" :y1="0" :y2="innerHeight" />

        <g
          v-for="series in previewSeries"
          :key="series.isoCode"
          @mouseenter="hoveredSeriesKey = series.isoCode"
          @mouseleave="clearTooltip"
        >
          <path
            v-if="series.values.length >= 2"
            :d="previewLine(series.values) ?? undefined"
            class="trajectory-path trajectory-path--scatter story-preview__path"
            :stroke="series.color"
            :style="{ opacity: seriesOpacity(series.isoCode) }"
          />
          <path
            v-if="series.values.length >= 2"
            :d="previewLine(series.values) ?? undefined"
            class="story-preview__path-hit"
            @mouseenter="showSeriesTooltip($event, series)"
            @mousemove="showSeriesTooltip($event, series)"
          />

          <circle
            v-for="point in series.values"
            :key="`${series.isoCode}-${point.year}`"
            class="trajectory-node trajectory-node--scatter story-preview__node"
            :cx="xScale(point.gdpPerCapita)"
            :cy="yScale(point.metric)"
            r="2.8"
            :fill="series.color"
            :style="{ opacity: seriesOpacity(series.isoCode) }"
            @mouseenter="showSeriesTooltip($event, series)"
            @mousemove="showSeriesTooltip($event, series)"
          />

          <circle
            v-for="point in series.values"
            :key="`${series.isoCode}-${point.year}-hit`"
            class="story-preview__node-hit"
            :cx="xScale(point.gdpPerCapita)"
            :cy="yScale(point.metric)"
            r="8"
            @mouseenter="showSeriesTooltip($event, series)"
            @mousemove="showSeriesTooltip($event, series)"
          />

          <circle
            v-if="series.startPoint"
            class="trajectory-marker trajectory-marker--start"
            :cx="xScale(series.startPoint.gdpPerCapita)"
            :cy="yScale(series.startPoint.metric)"
            r="4.7"
            :style="{ stroke: series.color, opacity: seriesOpacity(series.isoCode) }"
          />

          <circle
            v-if="series.turningPoint"
            class="trajectory-marker trajectory-marker--turning"
            :cx="xScale(series.turningPoint.gdpPerCapita)"
            :cy="yScale(series.turningPoint.metric)"
            r="5.4"
            :style="{ stroke: series.color, opacity: seriesOpacity(series.isoCode) }"
          />

          <circle
            v-if="series.endPoint"
            class="trajectory-marker trajectory-marker--end"
            :cx="xScale(series.endPoint.gdpPerCapita)"
            :cy="yScale(series.endPoint.metric)"
            r="5.5"
            :style="{ fill: series.color, opacity: seriesOpacity(series.isoCode) }"
          />

          <text
            v-if="series.endPoint"
            class="point-label story-preview__label"
            :x="xScale(series.endPoint.gdpPerCapita) + 8"
            :y="yScale(series.endPoint.metric) - 8"
            :style="{ opacity: seriesOpacity(series.isoCode) }"
          >
            {{ series.country }}
          </text>
        </g>

        <g v-for="annotation in previewAnnotations" :key="`${annotation.isoCode}-${annotation.title}`">
          <line
            class="story-preview__annotation-line"
            :x1="annotation.targetX"
            :y1="annotation.targetY"
            :x2="annotation.lineX"
            :y2="annotation.lineY"
          />
          <rect
            class="story-preview__annotation-box"
            :x="annotation.boxX"
            :y="annotation.boxY"
            :width="annotation.width"
            :height="annotation.boxHeight"
            rx="8"
          />
          <text>
            <tspan
              class="story-preview__annotation-title"
              :x="annotation.boxX + 10"
              :y="annotation.boxY + 15"
            >
              {{ annotation.title }}
            </tspan>
            <tspan
              v-for="(lineText, index) in annotation.body"
              :key="`${annotation.isoCode}-${index}`"
              class="story-preview__annotation-body"
              :x="annotation.boxX + 10"
              :y="annotation.boxY + 30 + index * 11"
            >
              {{ lineText }}
            </tspan>
          </text>
        </g>

        <text class="axis-title" :x="innerWidth / 2" :y="innerHeight + 32">{{ copy.xLabel }}</text>
        <text class="axis-title axis-title--y" :x="-innerHeight / 2" :y="-36">{{ copy.yLabel }}</text>

        <rect
          class="story-preview__hit-area"
          :x="0"
          :y="0"
          :width="innerWidth"
          :height="innerHeight"
          @pointermove="handleSvgMove"
          @mouseleave="clearTooltip"
        />
      </g>
    </svg>

    <p class="story-preview__flow"><strong>{{ copy.flowLabel }}：</strong>{{ copy.flowText }}</p>

    <div v-if="tooltip" class="chart-tooltip story-preview__tooltip" :style="tooltipStyle">
      <div class="chart-tooltip__top">
        <strong>{{ tooltip.country }}</strong>
        <span>{{ copy.year }} {{ tooltip.year }}</span>
      </div>
      <div class="chart-tooltip__comparison">
        <div>
          <span>{{ copy.gdp }}</span>
          <strong>{{ formatNumber(tooltip.gdpPerCapita, 1, locale) }}</strong>
        </div>
        <div>
          <span>{{ preview.metricLabel }}</span>
          <strong>{{ formatNumber(tooltip.metric, 2, locale) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>
