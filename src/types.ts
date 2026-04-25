export type Locale = 'zh' | 'en'

export type MetricKey = 'co2PerCapita' | 'consumptionCo2PerCapita' | 'co2'

export type StoryViewMode = 'overview' | 'absolute' | 'trajectory' | 'consumption' | 'explore'

export interface LocalizedText {
  zh: string
  en: string
}

export interface CountryOption {
  country: string
  isoCode: string
  iso2Code: string
  region: string
  incomeLevel: string
  featured: boolean
}

export interface StoryPreset {
  id: string
  label: string
  description: string
  countries: string[]
  metric?: MetricKey
  startYear?: number
  endYear?: number
}

export interface DataMeta {
  baselineYear: number
  latestYear: number
  years: number[]
  regions: string[]
  incomeLevels: string[]
  featuredCountries: string[]
  countryOptions: CountryOption[]
  storyPresets: StoryPreset[]
}

export interface StoryChapterScript {
  id: string
  order: number
  viewMode?: StoryViewMode
  kicker: LocalizedText
  title: LocalizedText
  question: LocalizedText
  takeaway: LocalizedText
  body: Record<Locale, string[]>
  focusLabel: LocalizedText
  atlasPrompt: LocalizedText
  countries: string[]
  metric: MetricKey
  startYear: number
  endYear: number
  annotationBullets: Record<Locale, string[]>
}

export interface CountrySeriesGroup {
  country: string
  isoCode: string
  values: CountryYearRecord[]
}

export interface StoryChapterPreview {
  chapterId: string
  mode: StoryViewMode
  metricKey: MetricKey
  metricLabel: string
  startYear: number
  endYear: number
  seriesGroups: CountrySeriesGroup[]
  overviewPoints?: OverviewPoint[]
  highlightStatus?: OverviewPoint['status']
}

export interface CountryYearRecord {
  country: string
  isoCode: string
  iso2Code: string
  region: string
  incomeLevel: string
  year: number
  population: number | null
  gdp: number | null
  gdpPerCapita: number | null
  co2: number | null
  co2PerCapita: number | null
  carbonIntensity: number | null
  consumptionCo2: number | null
  consumptionCo2PerCapita: number | null
  consumptionProductionGap: number | null
  consumptionProductionGapPerCapita: number | null
  primaryEnergyConsumption: number | null
  renewablesShareEnergy: number | null
  fossilShareEnergy: number | null
  coalShareEnergy: number | null
  oilShareEnergy: number | null
  gasShareEnergy: number | null
  nuclearShareEnergy: number | null
  lowCarbonShareEnergy: number | null
  renewablesShareElec: number | null
  fossilShareElec: number | null
  lowCarbonShareElec: number | null
}

export interface CountrySummary extends CountryOption {
  startYear: number
  endYear: number
  gdpPerCapitaStart: number | null
  gdpPerCapitaEnd: number | null
  gdpChangePct: number | null
  co2Start: number | null
  co2End: number | null
  co2ChangePct: number | null
  co2PerCapitaStart: number | null
  co2PerCapitaEnd: number | null
  co2PerCapitaChangePct: number | null
  consumptionCo2PerCapitaChangePct: number | null
  renewablesChangePts: number | null
  carbonIntensityStart: number | null
  carbonIntensityEnd: number | null
  carbonIntensityChangePct: number | null
  consumptionProductionGapStart: number | null
  consumptionProductionGapEnd: number | null
  co2PeakYear: number | null
  turningPointYear: number | null
  decouplingStartYear: number | null
  trajectoryType:
    | 'absolute-decoupling'
    | 'relative-decoupling'
    | 'growth-with-emissions'
    | 'volatile-transition'
  status:
    | 'decoupled'
    | 'growth-with-emissions'
    | 'low-growth-lower-emissions'
    | 'low-growth-higher-emissions'
}

export interface OverviewPoint extends CountryOption {
  startYear: number
  endYear: number
  startRecord: CountryYearRecord
  endRecord: CountryYearRecord
  gdpChangePct: number
  metricChangePct: number
  renewablesChangePts: number | null
  metricStart: number | null
  metricEnd: number | null
  status:
    | 'decoupled'
    | 'growth-with-emissions'
    | 'low-growth-lower-emissions'
    | 'low-growth-higher-emissions'
}
