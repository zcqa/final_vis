<script setup lang="ts">
import { computed, ref } from 'vue'
import { extent } from 'd3-array'
import { Delaunay } from 'd3-delaunay'
import { scaleLinear, scaleSqrt } from 'd3-scale'
import type { Locale, OverviewPoint } from '../types'
import { formatCompactNumber, formatNumber, formatSignedPercent, formatSignedPoints } from '../utils/formatters'

const props = defineProps<{
  points: OverviewPoint[]
  selectedCountries: string[]
  hoveredCountry: string | null
  metricLabel: string
  startYear: number
  endYear: number
  locale: Locale
  annotations: Array<{
    isoCode: string
    title: string
    body: string
    dx: number
    dy: number
  }>
}>()

const emit = defineEmits<{
  select: [isoCode: string]
  brush: [isoCodes: string[]]
  hover: [isoCode: string | null]
}>()

interface ZoomState {
  k: number
  x: number
  y: number
}

interface BrushState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
}

interface DisplayPoint {
  point: OverviewPoint
  isoCode: string
  country: string
  status: OverviewPoint['status']
  featured: boolean
  radius: number
  baseX: number
  baseY: number
  screenX: number
  screenY: number
  clippedLeft: boolean
  clippedRight: boolean
  clippedTop: boolean
  clippedBottom: boolean
  isClipped: boolean
  isGhost: boolean
  isSelected: boolean
  isHovered: boolean
  priority: number
}

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        eyebrow: '先看全局',
        title: '谁已经开始把两条线拉开',
        subtitle:
          '横轴是人均 GDP 变化，纵轴是排放指标变化。只放大大多数国家所在的核心区域，极端值贴边保留。',
        empty: '当前筛选条件下没有足够数据的国家。请放宽筛选条件或调整年份范围。',
        q1: '低增长 / 低排放',
        q2: '增长伴随排放',
        q3: '低增长 / 高排放',
        q4: '绝对脱钩',
        axisX: '人均 GDP 变化',
        axisY: '排放指标变化',
        tooltipRange: '时间范围',
        tooltipPopulation: '人口',
        tooltipGdp: '人均 GDP',
        tooltipMetric: '排放指标',
        tooltipRenewables: '可再生能源',
        tooltipGdpValues: '人均 GDP 起终值',
        tooltipMetricValues: '排放指标起终值',
        tooltipRenewablesValues: '可再生能源占比',
        statusDecoupled: '长期脱钩',
        statusGrowth: '增长伴随排放',
        statusLowLow: '低增长 / 低排放',
        statusLowHigh: '低增长 / 高排放',
        legendTitle: '颜色',
        legendPopulation:
          '点面积已做上限约束；超出核心范围的国家会贴边显示。拖拽可框选，单击已选国家可取消，比较组最多保留 4 个。',
        zoomIn: '放大',
        zoomOut: '缩小',
        zoomReset: '还原',
        zoomHint: '滚轮缩放',
      }
    : {
        eyebrow: 'Start wide',
        title: 'Who is already pulling the two lines apart',
        subtitle:
          'GDP change on the x-axis, emissions change on the y-axis. The chart zooms into the dense core while keeping outliers pinned to the edge.',
        empty: 'No countries have enough data under the current filters. Try widening the filters or adjusting the year range.',
        q1: 'Low growth / lower emissions',
        q2: 'Growth with emissions',
        q3: 'Low growth / higher emissions',
        q4: 'Absolute decoupling',
        axisX: 'GDP per capita change',
        axisY: 'Emissions metric change',
        tooltipRange: 'Time range',
        tooltipPopulation: 'Population',
        tooltipGdp: 'GDP / cap',
        tooltipMetric: 'Metric',
        tooltipRenewables: 'Renewables',
        tooltipGdpValues: 'GDP / cap values',
        tooltipMetricValues: 'Metric values',
        tooltipRenewablesValues: 'Renewables share',
        statusDecoupled: 'Long-run decoupling',
        statusGrowth: 'Growth with emissions',
        statusLowLow: 'Low growth / lower emissions',
        statusLowHigh: 'Low growth / higher emissions',
        legendTitle: 'Color',
        legendPopulation:
          'Bubble size is capped; countries outside the core range stay pinned to the edge. Drag to brush, click a selected country again to remove it, and keep up to four comparison cases.',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        zoomReset: 'Reset',
        zoomHint: 'Scroll to zoom',
      },
)

const width = 980
const height = 540
const margin = { top: 44, right: 26, bottom: 64, left: 84 }
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
const minZoom = 1
const maxZoom = 4.5

const zoom = ref<ZoomState>({ k: 1, x: 0, y: 0 })
const tooltipPoint = ref<OverviewPoint | null>(null)
const tooltipStyle = ref({ left: '0px', top: '0px' })
const localHoverIso = ref<string | null>(null)
const brush = ref<BrushState | null>(null)

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function quantile(values: number[], ratio: number) {
  if (!values.length) {
    return 0
  }

  const sorted = [...values].sort((left, right) => left - right)
  const position = (sorted.length - 1) * ratio
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  const weight = position - lower

  if (lower === upper) {
    return sorted[lower]
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

function clippedDomain(values: number[]) {
  if (!values.length) {
    return [-20, 20]
  }

  const low = quantile(values, 0.05)
  const high = quantile(values, 0.95)
  const min = Math.min(low, 0)
  const max = Math.max(high, 0)
  const span = max - min || Math.max(Math.abs(max), 20)
  const padding = span * 0.08
  return [min - padding, max + padding]
}

function transformX(baseX: number) {
  return zoom.value.x + baseX * zoom.value.k
}

function transformY(baseY: number) {
  return zoom.value.y + baseY * zoom.value.k
}

function applyZoom(nextK: number, anchorX = innerWidth / 2, anchorY = innerHeight / 2) {
  const safeK = clampNumber(nextK, minZoom, maxZoom)
  const current = zoom.value
  const nextX = anchorX - ((anchorX - current.x) / current.k) * safeK
  const nextY = anchorY - ((anchorY - current.y) / current.k) * safeK

  zoom.value = {
    k: safeK,
    x: clampNumber(nextX, innerWidth - innerWidth * safeK, 0),
    y: clampNumber(nextY, innerHeight - innerHeight * safeK, 0),
  }
}

function resetZoom() {
  zoom.value = { k: 1, x: 0, y: 0 }
}

function scaleFromRadius(radius: number, directionX: number, directionY: number, x: number, y: number) {
  if (directionX !== 0 && directionY !== 0) {
    const apexX = x + directionX * radius
    const apexY = y + directionY * radius
    const baseX = x - directionX * radius * 0.42
    const baseY = y - directionY * radius * 0.42
    const orthogonalX = directionY * radius * 0.55
    const orthogonalY = -directionX * radius * 0.55
    return `M ${apexX} ${apexY} L ${baseX + orthogonalX} ${baseY + orthogonalY} L ${baseX - orthogonalX} ${baseY - orthogonalY} Z`
  }

  if (directionX !== 0) {
    const apexX = x + directionX * radius
    const baseX = x - directionX * radius * 0.55
    return `M ${apexX} ${y} L ${baseX} ${y - radius * 0.82} L ${baseX} ${y + radius * 0.82} Z`
  }

  const apexY = y + directionY * radius
  const baseY = y - directionY * radius * 0.55
  return `M ${x} ${apexY} L ${x - radius * 0.82} ${baseY} L ${x + radius * 0.82} ${baseY} Z`
}

function wrapAnnotationBody(text: string) {
  const separator = text.includes('，') ? '，' : text.includes(', ') ? ', ' : null
  if (separator) {
    const [first, ...rest] = text.split(separator)
    if (rest.length) {
      return [first + separator.trimEnd(), rest.join(separator)]
    }
  }

  if (text.length <= 14) {
    return [text]
  }

  const midpoint = Math.ceil(text.length / 2)
  return [text.slice(0, midpoint), text.slice(midpoint)]
}

const selectedSet = computed(() => new Set(props.selectedCountries))
const activeHoverIso = computed(() => props.hoveredCountry ?? localHoverIso.value)
const focusSet = computed(() =>
  activeHoverIso.value ? new Set([activeHoverIso.value]) : new Set(props.selectedCountries),
)

const xDomain = computed(() => clippedDomain(props.points.map((point) => point.gdpChangePct)))
const yDomain = computed(() => clippedDomain(props.points.map((point) => point.metricChangePct)))

const xScale = computed(() => scaleLinear().domain(xDomain.value).range([0, innerWidth]))
const yScale = computed(() => scaleLinear().domain(yDomain.value).range([innerHeight, 0]))

const radiusScale = computed(() => {
  const values = props.points
    .map((point) => point.endRecord.population)
    .filter((value): value is number => value !== null)

  if (!values.length) {
    return () => 5
  }

  const [minValue, maxValue] = extent(values) as [number, number]
  return scaleSqrt().domain([minValue, maxValue]).range([3.8, 10])
})

const zeroX = computed(() => transformX(xScale.value(0)))
const zeroY = computed(() => transformY(yScale.value(0)))

const displayPoints = computed<DisplayPoint[]>(() =>
  [...props.points]
    .map((point) => {
      const clippedLeft = point.gdpChangePct < xDomain.value[0]
      const clippedRight = point.gdpChangePct > xDomain.value[1]
      const clippedTop = point.metricChangePct > yDomain.value[1]
      const clippedBottom = point.metricChangePct < yDomain.value[0]
      const clampedX = clampNumber(point.gdpChangePct, xDomain.value[0], xDomain.value[1])
      const clampedY = clampNumber(point.metricChangePct, yDomain.value[0], yDomain.value[1])
      const baseX = xScale.value(clampedX)
      const baseY = yScale.value(clampedY)
      const isSelected = selectedSet.value.has(point.isoCode)
      const isHovered = activeHoverIso.value === point.isoCode
      const radius = radiusScale.value(point.endRecord.population ?? 0) + (isSelected || isHovered ? 1.4 : 0)
      const hasFocus = focusSet.value.size > 0
      const isGhost = hasFocus && !focusSet.value.has(point.isoCode)
      const priority = isHovered ? 4 : isSelected ? 3 : point.featured ? 2 : 1

      return {
        point,
        isoCode: point.isoCode,
        country: point.country,
        status: point.status,
        featured: point.featured,
        radius,
        baseX,
        baseY,
        screenX: transformX(baseX),
        screenY: transformY(baseY),
        clippedLeft,
        clippedRight,
        clippedTop,
        clippedBottom,
        isClipped: clippedLeft || clippedRight || clippedTop || clippedBottom,
        isGhost,
        isSelected,
        isHovered,
        priority,
      }
    })
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority
      }

      return (left.point.endRecord.population ?? 0) - (right.point.endRecord.population ?? 0)
    }),
)

const visibleHoverPoints = computed(() =>
  displayPoints.value.filter(
    (point) =>
      point.screenX >= -30 &&
      point.screenX <= innerWidth + 30 &&
      point.screenY >= -30 &&
      point.screenY <= innerHeight + 30,
  ),
)

const hoverMesh = computed(() => {
  if (!visibleHoverPoints.value.length) {
    return null
  }

  return {
    points: visibleHoverPoints.value,
    delaunay: Delaunay.from(
      visibleHoverPoints.value,
      (point) => point.screenX,
      (point) => point.screenY,
    ),
  }
})

const plottedAnnotations = computed(() =>
  props.annotations
    .map((annotation) => {
      const point = displayPoints.value.find((candidate) => candidate.isoCode === annotation.isoCode)
      if (!point) {
        return null
      }

      const textX = point.screenX + annotation.dx
      const textY = point.screenY + annotation.dy
      const bendX = point.screenX + annotation.dx * 0.42
      const bendY = point.screenY + annotation.dy * 0.18
      const anchor = annotation.dx >= 0 ? 'start' : 'end'

      return {
        ...annotation,
        point,
        bodyLines: wrapAnnotationBody(annotation.body),
        textX,
        textY,
        bendX,
        bendY,
        anchor,
      }
    })
    .filter(
      (
        annotation,
      ): annotation is {
        isoCode: string
        title: string
        body: string
        dx: number
        dy: number
        point: DisplayPoint
        bodyLines: string[]
        textX: number
        textY: number
        bendX: number
        bendY: number
        anchor: 'start' | 'end'
      } => annotation !== null,
    ),
)

const annotatedCountrySet = computed(() => new Set(plottedAnnotations.value.map((annotation) => annotation.isoCode)))

const legendItems = computed(() => [
  { key: 'decoupled', label: copy.value.statusDecoupled },
  { key: 'growth', label: copy.value.statusGrowth },
  { key: 'boundary', label: props.locale === 'zh' ? '其他边界样本' : 'Other boundary cases' },
])

function pointClass(point: DisplayPoint) {
  const classes = ['point', `point--${point.status}`]

  if (point.isGhost) {
    classes.push('point--ghost')
  }

  if (point.featured) {
    classes.push('point--featured')
  }

  if (point.isHovered) {
    classes.push('point--hovered')
  } else if (point.isSelected) {
    classes.push('point--selected')
  }

  return classes.join(' ')
}

function statusLabel(point: OverviewPoint) {
  if (point.status === 'decoupled') {
    return copy.value.statusDecoupled
  }

  if (point.status === 'growth-with-emissions') {
    return copy.value.statusGrowth
  }

  if (point.status === 'low-growth-lower-emissions') {
    return copy.value.statusLowLow
  }

  return copy.value.statusLowHigh
}

function labelAnchor(point: DisplayPoint) {
  return point.screenX > innerWidth - 66 ? 'end' : 'start'
}

function labelX(point: DisplayPoint) {
  return point.screenX > innerWidth - 66 ? point.screenX - 10 : point.screenX + 10
}

function shouldShowLabel(point: DisplayPoint) {
  if (annotatedCountrySet.value.has(point.isoCode) && !point.isHovered) {
    return false
  }

  if (point.isHovered || point.isSelected) {
    return true
  }

  if (zoom.value.k >= 2.2 && !point.isGhost && !point.isClipped) {
    return point.featured || point.radius >= 7.3
  }

  return false
}

function edgeMarkerPath(point: DisplayPoint) {
  const directionX = point.clippedRight ? 1 : point.clippedLeft ? -1 : 0
  const directionY = point.clippedBottom ? 1 : point.clippedTop ? -1 : 0
  return scaleFromRadius(point.radius + 1.2, directionX, directionY, point.screenX, point.screenY)
}

function plotCoordinates(event: MouseEvent | PointerEvent) {
  const target = event.currentTarget as SVGRectElement
  const rect = target.getBoundingClientRect()
  return {
    target,
    rect,
    x: ((event.clientX - rect.left) / rect.width) * innerWidth,
    y: ((event.clientY - rect.top) / rect.height) * innerHeight,
  }
}

function updateTooltipPosition(event: MouseEvent, rect: DOMRect) {
  tooltipStyle.value = {
    left: `${event.clientX - rect.left + 16}px`,
    top: `${Math.max(event.clientY - rect.top - 12, 18)}px`,
  }
}

function nearestDisplayPoint(x: number, y: number) {
  if (!hoverMesh.value) {
    return null
  }

  const index = hoverMesh.value.delaunay.find(x, y)
  const point = hoverMesh.value.points[index]
  if (!point) {
    return null
  }

  const distance = Math.hypot(point.screenX - x, point.screenY - y)
  return distance <= Math.max(point.radius + 16, 20) ? point : null
}

function handlePlotMove(event: MouseEvent) {
  if (brush.value) {
    const { x, y } = plotCoordinates(event)
    const nextBrush = brush.value
    nextBrush.currentX = x
    nextBrush.currentY = y
    if (Math.abs(nextBrush.currentX - nextBrush.startX) > 6 || Math.abs(nextBrush.currentY - nextBrush.startY) > 6) {
      nextBrush.isDragging = true
    }
    tooltipPoint.value = null
    if (localHoverIso.value !== null) {
      localHoverIso.value = null
      emit('hover', null)
    }
    return
  }

  const { rect, x, y } = plotCoordinates(event)
  const nearest = nearestDisplayPoint(x, y)

  if (!nearest) {
    tooltipPoint.value = null
    if (localHoverIso.value !== null) {
      localHoverIso.value = null
      emit('hover', null)
    }
    return
  }

  tooltipPoint.value = nearest.point
  updateTooltipPosition(event, rect)

  if (localHoverIso.value !== nearest.isoCode) {
    localHoverIso.value = nearest.isoCode
    emit('hover', nearest.isoCode)
  }
}

function handlePlotLeave() {
  if (brush.value?.isDragging) {
    return
  }

  tooltipPoint.value = null
  if (localHoverIso.value !== null) {
    localHoverIso.value = null
    emit('hover', null)
  }
}

const brushRect = computed(() => {
  if (!brush.value?.isDragging) {
    return null
  }

  const x = Math.min(brush.value.startX, brush.value.currentX)
  const y = Math.min(brush.value.startY, brush.value.currentY)
  const width = Math.abs(brush.value.currentX - brush.value.startX)
  const height = Math.abs(brush.value.currentY - brush.value.startY)

  return { x, y, width, height }
})

function clearBrush() {
  brush.value = null
}

function brushedCountryCodes() {
  if (!brushRect.value) {
    return []
  }

  const { x, y, width, height } = brushRect.value
  const right = x + width
  const bottom = y + height

  return displayPoints.value
    .filter(
      (point) =>
        point.screenX >= x &&
        point.screenX <= right &&
        point.screenY >= y &&
        point.screenY <= bottom,
    )
    .sort((left, rightPoint) => {
      const leftPopulation = left.point.endRecord.population ?? 0
      const rightPopulation = rightPoint.point.endRecord.population ?? 0
      return rightPopulation - leftPopulation
    })
    .map((point) => point.isoCode)
}

function handlePlotPointerDown(event: PointerEvent) {
  if (event.button !== 0) {
    return
  }

  const { x, y, target } = plotCoordinates(event)
  target.setPointerCapture?.(event.pointerId)
  brush.value = {
    startX: x,
    startY: y,
    currentX: x,
    currentY: y,
    isDragging: false,
  }
}

function handlePlotPointerUp(event: PointerEvent) {
  const { x, y, target } = plotCoordinates(event)
  const activeBrush = brush.value

  target.releasePointerCapture?.(event.pointerId)

  if (!activeBrush) {
    return
  }

  if (activeBrush.isDragging) {
    const isoCodes = brushedCountryCodes()
    clearBrush()
    if (isoCodes.length) {
      emit('brush', isoCodes)
    }
    return
  }

  clearBrush()
  const nearest = nearestDisplayPoint(x, y)
  if (nearest) {
    emit('select', nearest.isoCode)
  }
}

function handleWheel(event: WheelEvent) {
  const { x, y } = plotCoordinates(event as unknown as MouseEvent)
  const factor = event.deltaY < 0 ? 1.18 : 1 / 1.18
  applyZoom(zoom.value.k * factor, x, y)
}
</script>

<template>
  <div class="chart-card chart-card--scatter">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">{{ copy.eyebrow }}</p>
        <h2>{{ copy.title }}</h2>
        <p class="panel-subtitle panel-subtitle--wide">{{ copy.subtitle }}</p>
      </div>

      <div class="scatter-toolbar">
        <div class="scatter-toolbar__buttons">
          <button type="button" class="hero-button hero-button--ghost scatter-toolbar__button" @click="applyZoom(zoom.k * 1.18)">
            +
          </button>
          <button type="button" class="hero-button hero-button--ghost scatter-toolbar__button" @click="applyZoom(zoom.k / 1.18)">
            −
          </button>
          <button type="button" class="hero-button hero-button--ghost" @click="resetZoom">
            {{ copy.zoomReset }}
          </button>
        </div>
        <p class="scatter-toolbar__hint">{{ copy.zoomHint }}</p>
      </div>
    </div>

    <div v-if="!points.length" class="empty-state">
      {{ copy.empty }}
    </div>

    <template v-else>
      <svg :viewBox="`0 0 ${width} ${height}`" class="scatter-svg" role="img">
        <defs>
          <clipPath id="overview-scatter-clip">
            <rect :x="0" :y="0" :width="innerWidth" :height="innerHeight" />
          </clipPath>
        </defs>

        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <line class="axis-line axis-line--cross axis-line--strong" :x1="0" :x2="innerWidth" :y1="zeroY" :y2="zeroY" />
          <line class="axis-line axis-line--cross axis-line--strong" :x1="zeroX" :x2="zeroX" :y1="0" :y2="innerHeight" />
          <line class="axis-line" :x1="0" :x2="innerWidth" :y1="innerHeight" :y2="innerHeight" />
          <line class="axis-line" :x1="0" :x2="0" :y1="0" :y2="innerHeight" />

          <text class="quadrant-watermark" x="18" y="34">{{ copy.q1 }}</text>
          <text class="quadrant-watermark" :x="innerWidth - 18" y="34" text-anchor="end">{{ copy.q2 }}</text>
          <text class="quadrant-watermark" x="18" :y="innerHeight - 16">{{ copy.q3 }}</text>
          <text class="quadrant-watermark quadrant-watermark--focus" :x="innerWidth - 18" :y="innerHeight - 16" text-anchor="end">
            {{ copy.q4 }}
          </text>

          <g clip-path="url(#overview-scatter-clip)">
            <g v-for="point in displayPoints" :key="point.isoCode">
              <path
                v-if="point.isClipped"
                :class="pointClass(point)"
                :d="edgeMarkerPath(point)"
              />
              <circle
                v-else
                :class="pointClass(point)"
                :cx="point.screenX"
                :cy="point.screenY"
                :r="point.radius"
              />

              <text
                v-if="shouldShowLabel(point)"
                class="point-label"
                :x="labelX(point)"
                :y="point.screenY - 10"
                :text-anchor="labelAnchor(point)"
              >
                {{ point.country }}
              </text>
            </g>

            <g v-for="annotation in plottedAnnotations" :key="annotation.isoCode" class="annotation-text-group">
              <path
                class="annotation-line annotation-line--curve"
                :d="`M ${annotation.point.screenX} ${annotation.point.screenY} Q ${annotation.bendX} ${annotation.bendY} ${annotation.textX} ${annotation.textY}`"
              />
              <text
                class="annotation-text"
                :x="annotation.textX"
                :y="annotation.textY"
                :text-anchor="annotation.anchor"
              >
                <tspan class="annotation-text__title" :x="annotation.textX" :dy="0">{{ annotation.title }}</tspan>
                <tspan
                  v-for="(line, index) in annotation.bodyLines"
                  :key="`${annotation.isoCode}-${index}`"
                  class="annotation-text__body"
                  :x="annotation.textX"
                  :dy="index === 0 ? 16 : 13"
                >
                  {{ line }}
                </tspan>
              </text>
            </g>

            <rect
              v-if="brushRect"
              class="scatter-brush"
              :x="brushRect.x"
              :y="brushRect.y"
              :width="brushRect.width"
              :height="brushRect.height"
            />
          </g>

          <rect
            class="scatter-hit-area"
            :x="0"
            :y="0"
            :width="innerWidth"
            :height="innerHeight"
            @pointermove="handlePlotMove"
            @pointerleave="handlePlotLeave"
            @pointerdown="handlePlotPointerDown"
            @pointerup="handlePlotPointerUp"
            @wheel.prevent="handleWheel"
          />

          <text class="axis-title" :x="innerWidth / 2" :y="innerHeight + 44">
            {{ copy.axisX }} ({{ startYear }} → {{ endYear }})
          </text>
          <text class="axis-title axis-title--y" :x="-innerHeight / 2" :y="-54">
            {{ metricLabel }} ({{ startYear }} → {{ endYear }})
          </text>
        </g>
      </svg>

      <div class="scatter-footer">
        <div class="scatter-legend">
          <span class="scatter-legend__title">{{ copy.legendTitle }}</span>
          <span
            v-for="item in legendItems"
            :key="item.key"
            class="scatter-legend__item"
          >
            <span :class="['scatter-legend__dot', `scatter-legend__dot--${item.key}`]"></span>
            {{ item.label }}
          </span>
        </div>
        <p class="scatter-note">{{ copy.legendPopulation }}</p>
      </div>
    </template>

    <div v-if="tooltipPoint" class="chart-tooltip chart-tooltip--wide" :style="tooltipStyle">
      <div class="chart-tooltip__top">
        <strong>{{ tooltipPoint.country }}</strong>
        <span>{{ statusLabel(tooltipPoint) }}</span>
      </div>
      <p class="chart-tooltip__range">{{ copy.tooltipRange }}: {{ startYear }} → {{ endYear }}</p>
      <div class="chart-tooltip__grid">
        <div>
          <span>{{ copy.tooltipGdp }}</span>
          <strong>{{ formatSignedPercent(tooltipPoint.gdpChangePct, 1, locale) }}</strong>
        </div>
        <div>
          <span>{{ copy.tooltipMetric }}</span>
          <strong>{{ formatSignedPercent(tooltipPoint.metricChangePct, 1, locale) }}</strong>
        </div>
        <div>
          <span>{{ copy.tooltipRenewables }}</span>
          <strong>{{ formatSignedPoints(tooltipPoint.renewablesChangePts, 1, locale) }}</strong>
        </div>
        <div>
          <span>{{ copy.tooltipPopulation }}</span>
          <strong>{{ formatCompactNumber(tooltipPoint.endRecord.population, 1, locale) }}</strong>
        </div>
      </div>
      <div class="chart-tooltip__comparison">
        <div>
          <span>{{ copy.tooltipGdpValues }}</span>
          <strong>
            {{ formatNumber(tooltipPoint.startRecord.gdpPerCapita, 1, locale) }} →
            {{ formatNumber(tooltipPoint.endRecord.gdpPerCapita, 1, locale) }}
          </strong>
        </div>
        <div>
          <span>{{ copy.tooltipMetricValues }}</span>
          <strong>
            {{ formatNumber(tooltipPoint.metricStart, 2, locale) }} →
            {{ formatNumber(tooltipPoint.metricEnd, 2, locale) }}
          </strong>
        </div>
        <div>
          <span>{{ copy.tooltipRenewablesValues }}</span>
          <strong>
            {{ formatNumber(tooltipPoint.startRecord.renewablesShareEnergy, 1, locale) }}% →
            {{ formatNumber(tooltipPoint.endRecord.renewablesShareEnergy, 1, locale) }}%
          </strong>
        </div>
      </div>
    </div>
  </div>
</template>
