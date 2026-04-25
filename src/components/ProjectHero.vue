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
        storyButton: '阅读',
        atlasButton: '探索',
      }
    : {
        storyButton: 'Read',
        atlasButton: 'Explore',
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
      <h1>{{ title }}</h1>
      <p class="hero__lead">
        {{ lead }}
      </p>
      <p class="hero__summary">{{ summary }}</p>

    </div>
  </header>
</template>
