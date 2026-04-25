<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import EnergyMixPanel from './components/EnergyMixPanel.vue'
import InsightPanel from './components/InsightPanel.vue'
import MethodSection from './components/MethodSection.vue'
import OverviewScatter from './components/OverviewScatter.vue'
import ProjectHero from './components/ProjectHero.vue'
import StorySection from './components/StorySection.vue'
import TrajectoryPanel from './components/TrajectoryPanel.vue'
import TypologySection from './components/TypologySection.vue'
import { guidedTourSteps } from './content/guidedTourSteps'
import type {
  CountrySeriesGroup,
  CountryOption,
  CountrySummary,
  CountryYearRecord,
  DataMeta,
  Locale,
  MetricKey,
  OverviewPoint,
  StoryChapterPreview,
  StoryChapterScript,
} from './types'
import { formatNumber } from './utils/formatters'

const metricDefinitions: Record<MetricKey, Record<Locale, string>> = {
  co2PerCapita: { zh: '人均生产端 CO2', en: 'Production CO2 per capita' },
  consumptionCo2PerCapita: { zh: '人均消费端 CO2', en: 'Consumption CO2 per capita' },
  co2: { zh: 'CO2 总量', en: 'Total CO2' },
}

const regionLabels: Record<string, Record<Locale, string>> = {
  'East Asia & Pacific': { zh: '东亚与太平洋', en: 'East Asia & Pacific' },
  'Europe & Central Asia': { zh: '欧洲与中亚', en: 'Europe & Central Asia' },
  'Latin America & Caribbean': { zh: '拉丁美洲与加勒比', en: 'Latin America & Caribbean' },
  'Middle East & North Africa': { zh: '中东与北非', en: 'Middle East & North Africa' },
  'North America': { zh: '北美', en: 'North America' },
  'South Asia': { zh: '南亚', en: 'South Asia' },
  'Sub-Saharan Africa': { zh: '撒哈拉以南非洲', en: 'Sub-Saharan Africa' },
}

const incomeLabels: Record<string, Record<Locale, string>> = {
  'High income': { zh: '高收入', en: 'High income' },
  'Low income': { zh: '低收入', en: 'Low income' },
  'Lower middle income': { zh: '中低收入', en: 'Lower middle income' },
  'Upper middle income': { zh: '中高收入', en: 'Upper middle income' },
  'Not classified': { zh: '未分类', en: 'Not classified' },
}

const storyAnnotationMap: Record<
  Locale,
  Record<string, Array<{ isoCode: string; title: string; body: string; dx: number; dy: number }>>
> = {
  zh: {
    china: [{ isoCode: 'CHN', title: '中国', body: '增长很快，但排放仍处高位。', dx: 26, dy: -18 }],
    'uk-germany': [
      { isoCode: 'GBR', title: '英国', body: '更早退出煤炭，脱钩更明显。', dx: -188, dy: -66 },
      { isoCode: 'DEU', title: '德国', body: '也是脱钩样本，但路径更平缓。', dx: 24, dy: -26 },
    ],
    'us-india': [
      { isoCode: 'USA', title: '美国', body: '高收入样本，排放强度已回落。', dx: -186, dy: 30 },
      { isoCode: 'IND', title: '印度', body: '仍处于增长伴随排放阶段。', dx: 24, dy: 40 },
    ],
    'high-income': [
      { isoCode: 'DNK', title: '丹麦', body: '高收入国家中的低排放样本。', dx: -176, dy: -78 },
      { isoCode: 'SWE', title: '瑞典', body: '长期低碳结构非常稳定。', dx: 22, dy: -30 },
    ],
    'growth-and-emissions': [
      { isoCode: 'CHN', title: '中国', body: '规模很大，仍在右上象限。', dx: 26, dy: -20 },
      { isoCode: 'IND', title: '印度', body: '增长持续，排放也在抬升。', dx: 20, dy: 36 },
    ],
  },
  en: {
    china: [{ isoCode: 'CHN', title: 'China', body: 'Fast growth, but emissions remain high.', dx: 26, dy: -18 }],
    'uk-germany': [
      { isoCode: 'GBR', title: 'United Kingdom', body: 'Coal declined earlier, so decoupling is clearer.', dx: -226, dy: -66 },
      { isoCode: 'DEU', title: 'Germany', body: 'Also decoupled, but on a steadier path.', dx: 24, dy: -26 },
    ],
    'us-india': [
      { isoCode: 'USA', title: 'United States', body: 'A high-income case with falling emissions intensity.', dx: -228, dy: 32 },
      { isoCode: 'IND', title: 'India', body: 'Still in a growth-with-emissions phase.', dx: 24, dy: 40 },
    ],
    'high-income': [
      { isoCode: 'DNK', title: 'Denmark', body: 'A low-emissions case within high-income countries.', dx: -210, dy: -78 },
      { isoCode: 'SWE', title: 'Sweden', body: 'Its low-carbon structure stays stable over time.', dx: 22, dy: -30 },
    ],
    'growth-and-emissions': [
      { isoCode: 'CHN', title: 'China', body: 'A large right-upper-quadrant case.', dx: 26, dy: -20 },
      { isoCode: 'IND', title: 'India', body: 'Growth continues, and emissions rise with it.', dx: 20, dy: 36 },
    ],
  },
}

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

const locale = ref<Locale>('zh')
const loading = ref(true)
const errorMessage = ref('')
const currentPage = ref<'story' | 'explore'>(
  typeof window !== 'undefined' && window.location.hash === '#explore' ? 'explore' : 'story',
)
const records = ref<CountryYearRecord[]>([])
const summaries = ref<CountrySummary[]>([])
const meta = ref<DataMeta | null>(null)
const searchQuery = ref('')
const regionFilter = ref('All')
const incomeFilter = ref('All')
const selectedMetric = ref<MetricKey>('co2PerCapita')
const startYear = ref(1990)
const endYear = ref(2023)
const selectedCountries = ref<string[]>([])
const hoveredCountry = ref<string | null>(null)
const activeStory = ref<string | null>(null)
const isApplyingStory = ref(false)
const isPlayingTimeline = ref(false)
const playbackSpeedMs = ref(900)
let playbackTimer: number | null = null

const copy = computed(() =>
  locale.value === 'zh'
    ? {
        title: '增长了，排放还会继续涨吗？',
        lead: '从国家尺度去看，哪些地方已经开始把增长和排放拉开，哪些还没有。',
        reset: '重置探索',
        atlasEyebrow: 'Data Explorer',
        atlasTitle: '自由探索：全球国家轨迹',
        atlasLead: '选择年份、指标和国家，比较增长与排放在不同地区的走向。',
        search: '搜索国家',
        searchPlaceholder: '中国、Germany、USA...',
        region: '地区',
        income: '收入水平',
        metric: '指标',
        startYear: '起始年份',
        endYear: '结束年份',
        currentSelection: '当前样本',
        timeBrush: '时间范围',
        timelineTitle: '让年份往前走',
        timelineCurrentYear: '现在停在',
        timelineSpeed: '播放速度',
        timelinePlay: '播放',
        timelinePause: '暂停',
        timelineReplay: '重播',
        timelineSlow: '慢速',
        timelineNormal: '标准',
        timelineFast: '快速',
        timelineHint: '播放时会固定起始年份，只推动终点年份，这样总览、路径和机制会一起往前走。',
        compareGroup: '比较国家',
        compareEmpty: '从散点图点几个国家进来',
        allRegions: '全部地区',
        allIncome: '全部收入水平',
        loadingTitle: '正在加载处理后的气候与能源数据…',
        loadingBody: '首次打开时会读取本地预处理结果，请稍等片刻。',
        dataErrorTitle: '数据读取失败',
        dataSources: '数据',
        materials: '当前样本',
        focusNote: '正在看的国家',
        none: '暂无',
      }
    : {
        title: 'When economies grow, do emissions still have to rise?',
        lead: 'At the country scale, which places have started to pull growth away from emissions, and which ones have not?',
        reset: 'Reset exploration',
        atlasEyebrow: 'Data Explorer',
        atlasTitle: 'Free exploration: global country trajectories',
        atlasLead: 'Choose years, metrics, and countries to compare how growth and emissions move across regions.',
        search: 'Search country',
        searchPlaceholder: 'China, Germany, USA...',
        region: 'Region',
        income: 'Income level',
        metric: 'Metric',
        startYear: 'Start year',
        endYear: 'End year',
        currentSelection: 'Current sample',
        timeBrush: 'Time window',
        timelineTitle: 'Move the years forward',
        timelineCurrentYear: 'Now at',
        timelineSpeed: 'Playback speed',
        timelinePlay: 'Play',
        timelinePause: 'Pause',
        timelineReplay: 'Replay',
        timelineSlow: 'Slow',
        timelineNormal: 'Normal',
        timelineFast: 'Fast',
        timelineHint:
          'Playback keeps the start year fixed and advances the end year so the overview, trajectories, and mechanism views move together.',
        compareGroup: 'Compare countries',
        compareEmpty: 'Pick a few countries from the overview scatter',
        allRegions: 'All regions',
        allIncome: 'All income levels',
        loadingTitle: 'Loading processed climate and energy data...',
        loadingBody: 'The app is reading the local processed files for the first launch.',
        dataErrorTitle: 'Failed to load data',
        dataSources: 'Data',
        materials: 'Current sample',
        focusNote: 'Country in focus',
        none: 'None',
      },
)

function displayRegion(region: string) {
  return regionLabels[region]?.[locale.value] ?? region
}

function displayIncome(income: string) {
  return incomeLabels[income]?.[locale.value] ?? income
}

function metricValue(record: CountryYearRecord, metric: MetricKey) {
  if (metric === 'co2') {
    return record.co2
  }

  if (metric === 'consumptionCo2PerCapita') {
    return record.consumptionCo2PerCapita
  }

  return record.co2PerCapita
}

function percentChange(start: number | null, end: number | null) {
  if (start === null || end === null || start === 0) {
    return null
  }

  return ((end - start) / start) * 100
}

function median(values: Array<number | null>) {
  const numericValues = values.filter((value): value is number => value !== null).sort((left, right) => left - right)

  if (!numericValues.length) {
    return null
  }

  const middleIndex = Math.floor(numericValues.length / 2)
  if (numericValues.length % 2 === 0) {
    return (numericValues[middleIndex - 1] + numericValues[middleIndex]) / 2
  }

  return numericValues[middleIndex]
}

function overviewStatus(gdpChangePct: number, metricChangePct: number): OverviewPoint['status'] {
  if (gdpChangePct >= 0 && metricChangePct < 0) {
    return 'decoupled'
  }

  if (gdpChangePct < 0 && metricChangePct < 0) {
    return 'low-growth-lower-emissions'
  }

  if (gdpChangePct < 0 && metricChangePct >= 0) {
    return 'low-growth-higher-emissions'
  }

  return 'growth-with-emissions'
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''

  try {
    const baseUrl = import.meta.env.BASE_URL
    const [recordResponse, metaResponse, summaryResponse] = await Promise.all([
      fetch(`${baseUrl}data/decoupling-country-year.json`),
      fetch(`${baseUrl}data/decoupling-meta.json`),
      fetch(`${baseUrl}data/decoupling-summary.json`),
    ])

    if (!recordResponse.ok || !metaResponse.ok || !summaryResponse.ok) {
      throw new Error('Failed to load processed data files.')
    }

    const [recordJson, metaJson, summaryJson] = await Promise.all([
      recordResponse.json(),
      metaResponse.json(),
      summaryResponse.json(),
    ])
    records.value = recordJson
    meta.value = metaJson
    summaries.value = summaryJson
    startYear.value = metaJson.baselineYear
    endYear.value = metaJson.latestYear
    selectedCountries.value = [metaJson.featuredCountries[0] ?? 'DEU'].filter(Boolean)
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : locale.value === 'zh'
          ? '未知数据读取错误。'
          : 'Unknown data loading error.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
onBeforeUnmount(() => {
  if (playbackTimer !== null) {
    window.clearInterval(playbackTimer)
    playbackTimer = null
  }
})

function stopTimelinePlayback() {
  if (playbackTimer !== null) {
    window.clearInterval(playbackTimer)
    playbackTimer = null
  }
  isPlayingTimeline.value = false
}

watch(startYear, (newStart) => {
  if (isPlayingTimeline.value) {
    stopTimelinePlayback()
  }
  if (newStart >= endYear.value && meta.value) {
    const nextYear = meta.value.years.find((year) => year > newStart)
    if (nextYear) {
      endYear.value = nextYear
    }
  }
  if (!isApplyingStory.value) {
    activeStory.value = null
  }
})

watch(endYear, (newEnd) => {
  if (newEnd <= startYear.value && meta.value) {
    const previousYear = [...meta.value.years].reverse().find((year) => year < newEnd)
    if (previousYear) {
      startYear.value = previousYear
    }
  }
  if (!isApplyingStory.value) {
    activeStory.value = null
  }
  if (isPlayingTimeline.value && newEnd >= maxYear.value) {
    stopTimelinePlayback()
  }
})

watch(playbackSpeedMs, () => {
  if (isPlayingTimeline.value) {
    stopTimelinePlayback()
    toggleTimelinePlayback()
  }
})

const years = computed(() => meta.value?.years ?? [])
const minYear = computed(() => years.value[0] ?? 1990)
const maxYear = computed(() => years.value.at(-1) ?? 2022)
const canPlayTimeline = computed(() => years.value.some((year) => year > startYear.value))
const playbackSpeedOptions = computed(() => [
  { value: 1400, label: copy.value.timelineSlow },
  { value: 900, label: copy.value.timelineNormal },
  { value: 520, label: copy.value.timelineFast },
])
const timelineButtonLabel = computed(() => {
  if (isPlayingTimeline.value) {
    return copy.value.timelinePause
  }

  if (endYear.value >= maxYear.value) {
    return copy.value.timelineReplay
  }

  return copy.value.timelinePlay
})
const regionOptions = computed(() => [
  { value: 'All', label: copy.value.allRegions },
  ...((meta.value?.regions ?? []).map((region) => ({
    value: region,
    label: displayRegion(region),
  })) ?? []),
])
const incomeOptions = computed(() => [
  { value: 'All', label: copy.value.allIncome },
  ...((meta.value?.incomeLevels ?? []).map((income) => ({
    value: income,
    label: displayIncome(income),
  })) ?? []),
])

const orderedStoryChapters = computed(() => [...guidedTourSteps].sort((left, right) => left.order - right.order))
const activeStoryChapter = computed(
  () =>
    orderedStoryChapters.value.find((chapter) => chapter.id === activeStory.value) ??
    orderedStoryChapters.value[0] ??
    null,
)
const metricOptions = computed(() =>
  (Object.keys(metricDefinitions) as MetricKey[]).map((value) => ({
    value,
    label: metricDefinitions[value][locale.value],
  })),
)
const currentMetricLabel = computed(() => metricDefinitions[selectedMetric.value][locale.value])

const recordsByCountry = computed(() => {
  const map = new Map<string, CountryYearRecord[]>()

  for (const record of records.value) {
    const existing = map.get(record.isoCode)
    if (existing) {
      existing.push(record)
    } else {
      map.set(record.isoCode, [record])
    }
  }

  for (const values of map.values()) {
    values.sort((left, right) => left.year - right.year)
  }

  return map
})

const recordLookup = computed(() => {
  const map = new Map<string, Map<number, CountryYearRecord>>()

  for (const record of records.value) {
    if (!map.has(record.isoCode)) {
      map.set(record.isoCode, new Map())
    }

    map.get(record.isoCode)?.set(record.year, record)
  }

  return map
})

function getRecord(isoCode: string, year: number) {
  return recordLookup.value.get(isoCode)?.get(year) ?? null
}

const filteredCountries = computed(() => {
  const normalizedSearch = searchQuery.value.trim().toLowerCase()

  return (meta.value?.countryOptions ?? []).filter((country) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      country.country.toLowerCase().includes(normalizedSearch) ||
      country.isoCode.toLowerCase().includes(normalizedSearch)

    const matchesRegion = regionFilter.value === 'All' || country.region === regionFilter.value
    const matchesIncome = incomeFilter.value === 'All' || country.incomeLevel === incomeFilter.value

    const hasStart = getRecord(country.isoCode, startYear.value)
    const hasEnd = getRecord(country.isoCode, endYear.value)

    return matchesSearch && matchesRegion && matchesIncome && hasStart && hasEnd
  })
})

const filteredSummaries = computed(() => {
  const normalizedSearch = searchQuery.value.trim().toLowerCase()

  return summaries.value.filter((country) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      country.country.toLowerCase().includes(normalizedSearch) ||
      country.isoCode.toLowerCase().includes(normalizedSearch)

    const matchesRegion = regionFilter.value === 'All' || country.region === regionFilter.value
    const matchesIncome = incomeFilter.value === 'All' || country.incomeLevel === incomeFilter.value

    return matchesSearch && matchesRegion && matchesIncome
  })
})

const typologyCards = computed<TypologyCard[]>(() => {
  const definitions = [
    {
      id: 'absolute-decoupling' as const,
      title:
        locale.value === 'zh' ? '绝对脱钩' : 'Absolute decoupling',
      description:
        locale.value === 'zh'
          ? '经济还在继续增长，但人均排放已经明确往下走，路径通常会在后段转向右下。'
          : 'Growth continues, but emissions per capita already move clearly downward. These are the paths that usually bend toward the lower-right.',
      sortValue: (summary: CountrySummary) => summary.co2PerCapitaChangePct ?? Infinity,
    },
    {
      id: 'relative-decoupling' as const,
      title:
        locale.value === 'zh' ? '相对脱钩' : 'Relative decoupling',
      description:
        locale.value === 'zh'
          ? '排放没有再和 GDP 一起猛涨，但下降还不够深，更像是先慢下来。'
          : 'Emissions are no longer racing upward with GDP, but the decline is still shallow. The path reads more like a slowdown than a full turn.',
      sortValue: (summary: CountrySummary) => Math.abs(summary.co2PerCapitaChangePct ?? 999),
    },
    {
      id: 'growth-with-emissions' as const,
      title:
        locale.value === 'zh' ? '增长伴随排放' : 'Growth with emissions',
      description:
        locale.value === 'zh'
          ? '经济和排放还是一起往上走，结构性的转折还没有真正出现。'
          : 'Growth and emissions still rise together, so the structural turn has not really arrived yet.',
      sortValue: (summary: CountrySummary) => -(summary.gdpChangePct ?? -Infinity),
    },
    {
      id: 'volatile-transition' as const,
      title:
        locale.value === 'zh' ? '波动转型' : 'Volatile transition',
      description:
        locale.value === 'zh'
          ? '路径里已经能看见峰值或回落，但还不稳定，容易出现反复。'
          : 'The path already shows peaks or reversals, but it still looks unstable and easy to knock off course.',
      sortValue: (summary: CountrySummary) => summary.turningPointYear ?? Infinity,
    },
  ]

  return definitions.map((definition) => {
    const members = filteredSummaries.value.filter((summary) => summary.trajectoryType === definition.id)
    const representatives = [...members]
      .sort((left, right) => {
        if (left.featured !== right.featured) {
          return left.featured ? -1 : 1
        }

        return definition.sortValue(left) - definition.sortValue(right)
      })
      .slice(0, 3)

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      count: members.length,
      medianGdpChangePct: median(members.map((summary) => summary.gdpChangePct)),
      medianCo2PerCapitaChangePct: median(members.map((summary) => summary.co2PerCapitaChangePct)),
      representativeCountries: representatives.map((summary) => summary.country),
      representatives: representatives.map((summary) => ({
        country: summary.country,
        isoCode: summary.isoCode,
        values:
          recordsByCountry.value
            .get(summary.isoCode)
            ?.map((record) => ({
              year: record.year,
              gdpPerCapita: record.gdpPerCapita,
              co2PerCapita: record.co2PerCapita,
            }))
            .filter(
              (
                point,
              ): point is { year: number; gdpPerCapita: number; co2PerCapita: number } =>
                point.gdpPerCapita !== null && point.co2PerCapita !== null,
            ) ?? [],
      })),
    }
  })
})

function buildOverviewPoint(
  country: CountryOption,
  rangeStartYear: number,
  rangeEndYear: number,
  metric: MetricKey,
) {
  const startRecord = getRecord(country.isoCode, rangeStartYear)
  const endRecord = getRecord(country.isoCode, rangeEndYear)

  if (!startRecord || !endRecord) {
    return null
  }

  const gdpChangePct = percentChange(startRecord.gdpPerCapita, endRecord.gdpPerCapita)
  const metricStart = metricValue(startRecord, metric)
  const metricEnd = metricValue(endRecord, metric)
  const metricChangePct = percentChange(metricStart, metricEnd)

  if (gdpChangePct === null || metricChangePct === null) {
    return null
  }

  const renewablesChangePts =
    startRecord.renewablesShareEnergy !== null && endRecord.renewablesShareEnergy !== null
      ? endRecord.renewablesShareEnergy - startRecord.renewablesShareEnergy
      : null

  return {
    ...country,
    startYear: rangeStartYear,
    endYear: rangeEndYear,
    startRecord,
    endRecord,
    gdpChangePct,
    metricChangePct,
    renewablesChangePts,
    metricStart,
    metricEnd,
    status: overviewStatus(gdpChangePct, metricChangePct),
  }
}

const overviewPoints = computed<OverviewPoint[]>(() =>
  filteredCountries.value.flatMap((country) => {
    const point = buildOverviewPoint(country, startYear.value, endYear.value, selectedMetric.value)
    return point ? [point] : []
  }),
)

const selectedCountryObjects = computed<CountryOption[]>(() =>
  selectedCountries.value
    .map((isoCode) => meta.value?.countryOptions.find((country) => country.isoCode === isoCode) ?? null)
    .filter((country): country is CountryOption => country !== null),
)

const activeCountryIso = computed(() => {
  if (hoveredCountry.value) {
    return hoveredCountry.value
  }

  if (selectedCountries.value.length) {
    return selectedCountries.value[0]
  }

  return overviewPoints.value[0]?.isoCode ?? null
})

const activePoint = computed(
  () => overviewPoints.value.find((point) => point.isoCode === activeCountryIso.value) ?? null,
)

const selectedOverviewPoints = computed(() =>
  selectedCountries.value
    .map((isoCode) => overviewPoints.value.find((point) => point.isoCode === isoCode) ?? null)
    .filter((point): point is OverviewPoint => point !== null),
)

const activeStoryAnnotations = computed(() =>
  activeStory.value ? storyAnnotationMap[locale.value][activeStory.value] ?? [] : [],
)

const selectedSeriesGroups = computed<CountrySeriesGroup[]>(() =>
  selectedCountryObjects.value.map((country) => ({
    country: country.country,
    isoCode: country.isoCode,
    values:
      recordsByCountry.value
        .get(country.isoCode)
        ?.filter((record) => record.year >= startYear.value && record.year <= endYear.value) ?? [],
  })),
)

const storyPreview = computed<StoryChapterPreview | null>(() => {
  const chapter = activeStoryChapter.value
  if (!chapter) {
    return null
  }

  const mode = chapter.viewMode ?? 'trajectory'
  const seriesGroups: CountrySeriesGroup[] = chapter.countries
    .map((isoCode) => {
      const values =
        recordsByCountry.value
          .get(isoCode)
          ?.filter((record) => record.year >= chapter.startYear && record.year <= chapter.endYear) ?? []

      if (!values.length) {
        return null
      }

      return {
        country:
          values[0]?.country ??
          meta.value?.countryOptions.find((country) => country.isoCode === isoCode)?.country ??
          isoCode,
        isoCode,
        values,
      }
    })
    .filter((group): group is CountrySeriesGroup => group !== null)

  return {
    chapterId: chapter.id,
    mode,
    metricKey: chapter.metric,
    metricLabel: metricDefinitions[chapter.metric][locale.value],
    startYear: chapter.startYear,
    endYear: chapter.endYear,
    seriesGroups,
    overviewPoints:
      mode === 'overview' || mode === 'absolute' || mode === 'explore'
        ? (meta.value?.countryOptions ?? []).flatMap((country) => {
            const point = buildOverviewPoint(country, chapter.startYear, chapter.endYear, chapter.metric)
            return point ? [point] : []
          })
        : undefined,
    highlightStatus: mode === 'absolute' ? 'decoupled' : undefined,
  }
})

const highlightedStats = computed(() => ({
  countryCount: overviewPoints.value.length,
  decoupledCount: overviewPoints.value.filter((point) => point.status === 'decoupled').length,
}))
const heroSummary = computed(() =>
  locale.value === 'zh'
    ? `当前这段时间里，有 ${highlightedStats.value.countryCount} 个国家数据完整；其中 ${highlightedStats.value.decoupledCount} 个已经落到“继续增长、排放回落”的区域。`
    : `In the current time window, ${highlightedStats.value.countryCount} countries have complete data, and ${highlightedStats.value.decoupledCount} of them already sit in the grow-while-emissions-fall region.`,
)

const sliderStyle = computed(() => {
  const total = maxYear.value - minYear.value || 1
  const left = ((startYear.value - minYear.value) / total) * 100
  const width = ((endYear.value - startYear.value) / total) * 100
  return {
    left: `${left}%`,
    width: `${Math.max(width, 1)}%`,
  }
})

function updateStartYearFromRange(value: number) {
  stopTimelinePlayback()
  startYear.value = Math.min(value, endYear.value - 1)
}

function updateEndYearFromRange(value: number) {
  stopTimelinePlayback()
  endYear.value = Math.max(value, startYear.value + 1)
}

function toggleTimelinePlayback() {
  if (!canPlayTimeline.value) {
    return
  }

  if (isPlayingTimeline.value) {
    stopTimelinePlayback()
    return
  }

  if (endYear.value >= maxYear.value) {
    const firstPlayableYear = years.value.find((year) => year > startYear.value)
    if (firstPlayableYear) {
      endYear.value = firstPlayableYear
    }
  }

  activeStory.value = null
  isPlayingTimeline.value = true
  playbackTimer = window.setInterval(() => {
    const nextYear = years.value.find((year) => year > endYear.value)
    if (!nextYear) {
      stopTimelinePlayback()
      return
    }

    endYear.value = nextYear
  }, playbackSpeedMs.value)
}

function selectCountry(isoCode: string) {
  hoveredCountry.value = null
  activeStory.value = null

  if (selectedCountries.value.includes(isoCode)) {
    selectedCountries.value = selectedCountries.value.filter((currentIsoCode) => currentIsoCode !== isoCode)
    return
  }

  selectedCountries.value = [isoCode, ...selectedCountries.value].slice(0, 4)
}

function brushSelectCountries(isoCodes: string[]) {
  hoveredCountry.value = null
  activeStory.value = null

  if (!isoCodes.length) {
    return
  }

  selectedCountries.value = [...new Set(isoCodes)].slice(0, 24)
}

function removeCountry(isoCode: string) {
  selectedCountries.value = selectedCountries.value.filter((currentIsoCode) => currentIsoCode !== isoCode)
}

function applyTourStep(step: StoryChapterScript) {
  stopTimelinePlayback()
  isApplyingStory.value = true
  activeStory.value = step.id
  searchQuery.value = ''
  regionFilter.value = 'All'
  incomeFilter.value = 'All'
  selectedCountries.value = step.countries.slice(0, 4)
  selectedMetric.value = step.metric
  startYear.value = step.startYear
  endYear.value = step.endYear
  queueMicrotask(() => {
    isApplyingStory.value = false
  })
}

function resetExploration() {
  if (!meta.value) {
    return
  }

  stopTimelinePlayback()
  searchQuery.value = ''
  regionFilter.value = 'All'
  incomeFilter.value = 'All'
  selectedMetric.value = 'co2PerCapita'
  startYear.value = meta.value.baselineYear
  endYear.value = meta.value.latestYear
  selectedCountries.value = [meta.value.featuredCountries[0] ?? 'DEU'].filter(Boolean)
  hoveredCountry.value = null
  activeStory.value = null
}

function activateStoryFromChapter(storyId: string) {
  const step = orderedStoryChapters.value.find((chapter) => chapter.id === storyId)
  if (step) {
    applyTourStep(step)
  }
}

function applyTypologyFocus(trajectoryType: CountrySummary['trajectoryType']) {
  stopTimelinePlayback()
  const representatives =
    typologyCards.value.find((card) => card.id === trajectoryType)?.representatives.map((series) => series.isoCode) ?? []

  if (representatives.length) {
    selectedCountries.value = representatives.slice(0, 4)
  }

  selectedMetric.value = 'co2PerCapita'
  activeStory.value = null

  if (meta.value) {
    startYear.value = meta.value.baselineYear
    endYear.value = meta.value.latestYear
  }

  scrollToSection('atlas-section')
}

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function navigateToPage(page: 'story' | 'explore') {
  currentPage.value = page
  if (typeof window !== 'undefined') {
    window.location.hash = page === 'explore' ? 'explore' : 'story'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="app-shell">
    <template v-if="loading">
      <div class="loading-shell">
        <h1>{{ copy.loadingTitle }}</h1>
        <p>{{ copy.loadingBody }}</p>
      </div>
    </template>

    <template v-else-if="errorMessage">
      <div class="loading-shell">
        <h1>{{ copy.dataErrorTitle }}</h1>
        <p>{{ errorMessage }}</p>
      </div>
    </template>

    <template v-else>
      <ProjectHero
        :locale="locale"
        :title="copy.title"
        :lead="copy.lead"
        :summary="heroSummary"
        :active-page="currentPage"
        @set-locale="locale = $event"
        @navigate="navigateToPage"
      />

      <StorySection
        v-if="currentPage === 'story'"
        :chapters="orderedStoryChapters"
        :locale="locale"
        :active-story-id="activeStory"
        :preview="storyPreview"
        @activate="activateStoryFromChapter"
        @jump-atlas="navigateToPage('explore')"
      />

      <template v-else>
      <section id="atlas-section" class="atlas-stage page-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">{{ copy.atlasEyebrow }}</p>
            <h2>{{ copy.atlasTitle }}</h2>
          </div>
          <div class="atlas-stage__header-actions">
            <p class="panel-copy panel-copy--wide">{{ copy.atlasLead }}</p>
            <button type="button" class="hero-button hero-button--ghost" @click="resetExploration">
              {{ copy.reset }}
            </button>
          </div>
        </div>

        <div class="controls controls--toolbar">
          <div class="controls__row">
            <label class="field">
              <span>{{ copy.search }}</span>
              <input
                v-model="searchQuery"
                type="search"
                :placeholder="copy.searchPlaceholder"
                list="country-options"
              />
            </label>

            <label class="field">
              <span>{{ copy.region }}</span>
              <select v-model="regionFilter">
                <option v-for="region in regionOptions" :key="region.value" :value="region.value">
                  {{ region.label }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ copy.income }}</span>
              <select v-model="incomeFilter">
                <option v-for="income in incomeOptions" :key="income.value" :value="income.value">
                  {{ income.label }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ copy.metric }}</span>
              <select v-model="selectedMetric">
                <option v-for="metric in metricOptions" :key="metric.value" :value="metric.value">
                  {{ metric.label }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ copy.startYear }}</span>
              <select v-model.number="startYear">
                <option v-for="year in years" :key="year" :value="year" :disabled="year >= endYear">
                  {{ year }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ copy.endYear }}</span>
              <select v-model.number="endYear">
                <option v-for="year in years" :key="year" :value="year" :disabled="year <= startYear">
                  {{ year }}
                </option>
              </select>
            </label>

            <div class="control-note control-note--toolbar">
              <span class="control-note__label">{{ copy.currentSelection }}</span>
              <strong>{{ currentMetricLabel }} · {{ formatNumber(overviewPoints.length, 0, locale) }}</strong>
            </div>
          </div>

          <div class="controls__row controls__row--toolbar-secondary">
            <div class="year-range">
              <div class="year-range__labels">
                <span>{{ copy.timeBrush }}</span>
                <strong>{{ startYear }} → {{ endYear }}</strong>
              </div>
              <div class="year-range__track">
                <div class="year-range__active" :style="sliderStyle"></div>
                <input
                  class="year-range__input"
                  type="range"
                  :min="minYear"
                  :max="maxYear"
                  :value="startYear"
                  @input="updateStartYearFromRange(Number(($event.target as HTMLInputElement).value))"
                />
                <input
                  class="year-range__input"
                  type="range"
                  :min="minYear"
                  :max="maxYear"
                  :value="endYear"
                  @input="updateEndYearFromRange(Number(($event.target as HTMLInputElement).value))"
                />
              </div>
              <div class="year-range__ticks">
                <span>{{ minYear }}</span>
                <span>{{ maxYear }}</span>
              </div>
            </div>

            <div class="playback-panel">
              <div class="playback-panel__header">
                <div>
                  <span class="selection-row__title">{{ copy.timelineTitle }}</span>
                  <p class="playback-panel__hint">{{ copy.timelineHint }}</p>
                </div>
                <strong class="playback-panel__year">{{ endYear }}</strong>
              </div>

              <div class="playback-panel__controls">
                <button
                  type="button"
                  :class="['hero-button', { 'hero-button--primary': isPlayingTimeline }]"
                  :disabled="!canPlayTimeline"
                  @click="toggleTimelinePlayback"
                >
                  {{ timelineButtonLabel }}
                </button>

                <label class="field playback-panel__field">
                  <span>{{ copy.timelineSpeed }}</span>
                  <select v-model.number="playbackSpeedMs" :disabled="!canPlayTimeline">
                    <option v-for="option in playbackSpeedOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <div class="control-note playback-panel__status">
                  <span class="control-note__label">{{ copy.timelineCurrentYear }}</span>
                  <strong>{{ startYear }} → {{ endYear }}</strong>
                </div>
              </div>
            </div>

            <div class="selection-row selection-row--toolbar">
              <span class="selection-row__title">{{ copy.compareGroup }}</span>
              <div class="selection-row__chips">
                <button
                  v-for="country in selectedCountryObjects"
                  :key="country.isoCode"
                  type="button"
                  class="selection-chip"
                  @click="selectCountry(country.isoCode)"
                >
                  {{ country.country }}
                  <span class="selection-chip__remove" @click.stop="removeCountry(country.isoCode)">×</span>
                </button>
                <span v-if="!selectedCountryObjects.length" class="selection-row__empty">{{ copy.compareEmpty }}</span>
              </div>
            </div>
          </div>

          <datalist id="country-options">
            <option v-for="country in meta?.countryOptions" :key="country.isoCode" :value="country.country"></option>
          </datalist>
        </div>

        <div class="dashboard-grid dashboard-grid--atlas">
          <section class="panel panel--full">
            <OverviewScatter
              :points="overviewPoints"
              :selected-countries="selectedCountries"
              :hovered-country="hoveredCountry"
              :metric-label="currentMetricLabel"
              :start-year="startYear"
              :end-year="endYear"
              :locale="locale"
              :annotations="activeStoryAnnotations"
              @select="selectCountry"
              @brush="brushSelectCountries"
              @hover="hoveredCountry = $event"
            />
          </section>

          <section class="panel panel--full">
            <InsightPanel
              :point="activePoint"
              :selected-countries="selectedCountryObjects"
              :selected-points="selectedOverviewPoints"
              :metric-label="currentMetricLabel"
              :locale="locale"
            />
          </section>

          <section class="panel panel--full">
            <TrajectoryPanel
              :series-groups="selectedSeriesGroups"
              :metric-key="selectedMetric"
              :metric-label="currentMetricLabel"
              :locale="locale"
            />
          </section>

          <section class="panel panel--full">
            <EnergyMixPanel :series-groups="selectedSeriesGroups" :locale="locale" />
          </section>
        </div>

        <footer class="footer">
          <div>
            <p class="eyebrow">{{ copy.dataSources }}</p>
            <p>Our World in Data CO2, Our World in Data Energy, World Bank country metadata.</p>
          </div>
          <div>
            <p class="eyebrow">{{ copy.materials }}</p>

            <p class="footer__note">
              <strong>{{ currentMetricLabel }}</strong>
              · {{ startYear }} → {{ endYear }}
              · {{ formatNumber(overviewPoints.length, 0, locale) }}
              {{ locale === 'zh' ? '个国家/地区' : 'countries or regions' }}
            </p>
          </div>
        </footer>
      </section>

      <TypologySection :cards="typologyCards" :locale="locale" @focus-type="applyTypologyFocus" />

      <MethodSection :locale="locale" />
      </template>
    </template>
  </div>
</template>
