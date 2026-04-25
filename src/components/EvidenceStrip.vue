<script setup lang="ts">
import { computed } from 'vue'
import type { CountryYearRecord, Locale, StoryChapterPreview } from '../types'
import { formatShare, formatSignedNumber, formatSignedPercent } from '../utils/formatters'

const props = defineProps<{
  preview: StoryChapterPreview
  locale: Locale
}>()

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        title: '证据',
        coal: '煤炭占比',
        lowCarbon: '低碳电力',
        renewables: '可再生能源',
        intensity: '碳强度',
        gap: '消费端差值',
        gdp: '人均 GDP',
        emissions: '人均 CO2',
        noData: '缺少足够机制数据',
        gapUnit: '吨/人',
      }
    : {
        title: 'Evidence',
        coal: 'Coal share',
        lowCarbon: 'Low-carbon power',
        renewables: 'Renewables',
        intensity: 'Carbon intensity',
        gap: 'Consumption gap',
        gdp: 'GDP / cap',
        emissions: 'CO2 / cap',
        noData: 'Not enough mechanism data',
        gapUnit: 't / cap',
      },
)

function firstWithValue(values: CountryYearRecord[], accessor: (record: CountryYearRecord) => number | null) {
  return values.find((record) => accessor(record) !== null) ?? null
}

function lastWithValue(values: CountryYearRecord[], accessor: (record: CountryYearRecord) => number | null) {
  return [...values].reverse().find((record) => accessor(record) !== null) ?? null
}

function carbonIntensity(record: CountryYearRecord) {
  if (record.carbonIntensity !== null && record.carbonIntensity > 0) {
    return record.carbonIntensity
  }

  if (record.co2 === null || record.gdp === null || record.gdp === 0) {
    return null
  }

  return (record.co2 * 1_000_000) / (record.gdp / 1_000)
}

function pctChange(start: number | null, end: number | null) {
  if (start === null || end === null || start === 0) {
    return null
  }

  return ((end - start) / start) * 100
}

function rangeLabel(
  values: CountryYearRecord[],
  accessor: (record: CountryYearRecord) => number | null,
  formatter: (value: number | null) => string,
) {
  const start = firstWithValue(values, accessor)
  const end = lastWithValue(values, accessor)

  if (!start || !end) {
    return null
  }

  return `${formatter(accessor(start))} → ${formatter(accessor(end))}`
}

const evidenceItems = computed(() => {
  const items = props.preview.seriesGroups.flatMap((group) => {
    const values = group.values
    const start = values[0] ?? null
    const end = values.at(-1) ?? null
    if (!start || !end) {
      return []
    }

    const coreItems = []
    const coalLabel = rangeLabel(values, (record) => record.coalShareEnergy, (value) => formatShare(value, 1, props.locale))
    const lowCarbonLabel = rangeLabel(
      values,
      (record) => record.lowCarbonShareElec,
      (value) => formatShare(value, 1, props.locale),
    )
    const renewablesLabel = rangeLabel(
      values,
      (record) => record.renewablesShareEnergy,
      (value) => formatShare(value, 1, props.locale),
    )
    const intensityChange = pctChange(carbonIntensity(start), carbonIntensity(end))
    const gap = end.consumptionProductionGapPerCapita
    const gdpChange = pctChange(start.gdpPerCapita, end.gdpPerCapita)
    const emissionsChange = pctChange(start.co2PerCapita, end.co2PerCapita)

    if (props.preview.chapterId === 'uk-germany' && coalLabel) {
      coreItems.push({ label: `${group.country} · ${copy.value.coal}`, value: coalLabel })
    } else if (props.preview.chapterId === 'high-income' && gap !== null) {
      coreItems.push({
        label: `${group.country} · ${copy.value.gap}`,
        value: `${formatSignedNumber(gap, 2, props.locale)} ${copy.value.gapUnit}`,
      })
    } else if (props.preview.chapterId === 'us-india') {
      coreItems.push({
        label: `${group.country} · ${copy.value.gdp}`,
        value: formatSignedPercent(gdpChange, 1, props.locale),
      })
      coreItems.push({
        label: `${group.country} · ${copy.value.emissions}`,
        value: formatSignedPercent(emissionsChange, 1, props.locale),
      })
    } else if (props.preview.chapterId === 'tour-absolute') {
      coreItems.push({
        label: `${group.country} · ${copy.value.emissions}`,
        value: formatSignedPercent(emissionsChange, 1, props.locale),
      })
    }

    if (coreItems.length < 2 && lowCarbonLabel) {
      coreItems.push({ label: `${group.country} · ${copy.value.lowCarbon}`, value: lowCarbonLabel })
    }

    if (coreItems.length < 2 && renewablesLabel) {
      coreItems.push({ label: `${group.country} · ${copy.value.renewables}`, value: renewablesLabel })
    }

    if (coreItems.length < 2 && intensityChange !== null) {
      coreItems.push({
        label: `${group.country} · ${copy.value.intensity}`,
        value: formatSignedPercent(intensityChange, 1, props.locale),
      })
    }

    return coreItems
  })

  return items.slice(0, 4)
})
</script>

<template>
  <div class="evidence-strip">
    <div class="evidence-strip__title">{{ copy.title }}</div>
    <div v-if="evidenceItems.length" class="evidence-strip__grid">
      <div v-for="item in evidenceItems" :key="`${item.label}-${item.value}`" class="evidence-pill">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
    <p v-else class="evidence-strip__empty">{{ copy.noData }}</p>
  </div>
</template>
