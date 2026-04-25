<script setup lang="ts">
import { computed } from 'vue'
import type { Locale } from '../types'

const props = defineProps<{
  locale: Locale
  title: string
  lead: string
  summary: string
  activePage: 'story' | 'explore'
}>()

const emit = defineEmits<{
  'set-locale': [locale: Locale]
  navigate: [page: 'story' | 'explore']
}>()

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        eyebrow: '增长与排放',
        storyButton: '阅读故事',
        atlasButton: '数据探索',
      }
    : {
        eyebrow: 'Growth and emissions',
        storyButton: 'Story',
        atlasButton: 'Data explorer',
      },
)
</script>

<template>
  <header class="hero">
    <div class="hero__topbar">
      <nav class="site-nav" aria-label="Main navigation">
        <button
          type="button"
          :class="['site-nav__button', { 'site-nav__button--active': activePage === 'story' }]"
          @click="emit('navigate', 'story')"
        >
          {{ copy.storyButton }}
        </button>
        <button
          type="button"
          :class="['site-nav__button', { 'site-nav__button--active': activePage === 'explore' }]"
          @click="emit('navigate', 'explore')"
        >
          {{ copy.atlasButton }}
        </button>
      </nav>
      <div class="language-switch" role="group" aria-label="Language switch">
        <button
          type="button"
          :class="['language-switch__button', { 'language-switch__button--active': locale === 'zh' }]"
          @click="emit('set-locale', 'zh')"
        >
          中文
        </button>
        <button
          type="button"
          :class="['language-switch__button', { 'language-switch__button--active': locale === 'en' }]"
          @click="emit('set-locale', 'en')"
        >
          English
        </button>
      </div>
    </div>

    <div class="hero__copy">
      <p class="eyebrow">{{ copy.eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p class="hero__lead">
        {{ lead }}
      </p>
      <p class="hero__summary">{{ summary }}</p>

      <div class="hero__actions">
        <button type="button" class="hero-button hero-button--primary" @click="emit('navigate', 'story')">
          {{ copy.storyButton }}
        </button>
        <button type="button" class="hero-link" @click="emit('navigate', 'explore')">
          {{ copy.atlasButton }}
        </button>
      </div>
    </div>
  </header>
</template>
