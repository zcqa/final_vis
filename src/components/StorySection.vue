<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import StoryOverviewPreviewPanel from './StoryOverviewPreviewPanel.vue'
import StoryPreviewPanel from './StoryPreviewPanel.vue'
import type { Locale, StoryChapterPreview, StoryChapterScript } from '../types'

const props = defineProps<{
  chapters: StoryChapterScript[]
  locale: Locale
  activeStoryId: string | null
  preview: StoryChapterPreview | null
}>()

const emit = defineEmits<{
  activate: [storyId: string]
  'jump-atlas': []
}>()

const activeChapter = computed(
  () => props.chapters.find((chapter) => chapter.id === props.activeStoryId) ?? props.chapters[0] ?? null,
)

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        eyebrow: '',
        title: '六步读懂全球碳脱钩',
        description: '',
        chapterLabel: '第',
        jumpAtlas: '进入数据探索',
        previewFallback: '章节图像正在加载。',
      }
    : {
        eyebrow: 'Story',
        title: 'A six-step guide to global carbon decoupling',
        description:
          'A path through global quadrants, country trajectories, and the consumption correction behind rich-country decoupling.',
        chapterLabel: 'Chapter',
        jumpAtlas: 'Open the data explorer',
        previewFallback: 'The chapter preview is loading.',
      },
)

const chapterElements = new Map<string, HTMLElement>()
let animationFrame = 0
let lastActivatedStoryId: string | null = null

function setChapterRef(storyId: string, element: unknown) {
  const resolvedElement =
    element && typeof element === 'object' && '$el' in element
      ? (element as { $el?: unknown }).$el
      : element

  if (resolvedElement instanceof HTMLElement) {
    chapterElements.set(storyId, resolvedElement)
    return
  }

  chapterElements.delete(storyId)
}

function activateNearestChapter() {
  animationFrame = 0

  if (!chapterElements.size) {
    return
  }

  const viewportHeight = window.innerHeight || 0
  const anchorY = viewportHeight * 0.42

  const candidate = [...chapterElements.entries()]
    .map(([storyId, element]) => {
      const rect = element.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const distance = Math.abs(centerY - anchorY)
      const intersectsViewport = rect.bottom > 0 && rect.top < viewportHeight

      return {
        storyId,
        rect,
        distance,
        intersectsViewport,
      }
    })
    .filter((entry) => entry.intersectsViewport)
    .sort((left, right) => left.distance - right.distance)[0]

  const nextStoryId = candidate?.storyId ?? props.chapters[0]?.id ?? null

  if (nextStoryId && nextStoryId !== lastActivatedStoryId) {
    lastActivatedStoryId = nextStoryId
    emit('activate', nextStoryId)
  }
}

function requestActivationUpdate() {
  if (animationFrame) {
    return
  }

  animationFrame = window.requestAnimationFrame(activateNearestChapter)
}

function focusChapter(storyId: string) {
  const element = chapterElements.get(storyId)
  lastActivatedStoryId = storyId
  emit('activate', storyId)
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(() => {
  requestActivationUpdate()
  window.addEventListener('scroll', requestActivationUpdate, { passive: true })
  window.addEventListener('resize', requestActivationUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', requestActivationUpdate)
  window.removeEventListener('resize', requestActivationUpdate)
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <section id="story-section" class="story-stage">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ copy.eyebrow }}</p>
        <h2>{{ copy.title }}</h2>
      </div>
      <p class="panel-copy panel-copy--wide">{{ copy.description }}</p>
    </div>

    <div class="story-stage__layout">
      <div class="story-stage__chapters">
        <article
          v-for="chapter in chapters"
          :key="chapter.id"
          :ref="(element) => setChapterRef(chapter.id, element)"
          :class="['story-chapter', { 'story-chapter--active': activeStoryId === chapter.id }]"
          :data-story-id="chapter.id"
          tabindex="0"
          @click="focusChapter(chapter.id)"
          @keydown.enter.prevent="focusChapter(chapter.id)"
          @keydown.space.prevent="focusChapter(chapter.id)"
        >
          <p class="story-chapter__eyebrow">
            {{ copy.chapterLabel }} {{ chapter.order }}{{ locale === 'zh' ? '章' : '' }}
          </p>
          <h3>{{ chapter.title[locale] }}</h3>

          <p class="story-chapter__lede">{{ chapter.question[locale] }}</p>

          <p v-for="paragraph in chapter.body[locale]" :key="paragraph" class="story-chapter__paragraph">
            {{ paragraph }}
          </p>

          <p class="story-chapter__takeaway">{{ chapter.takeaway[locale] }}</p>
        </article>
      </div>

      <aside v-if="activeChapter" class="story-stage__summary">
        <p class="eyebrow">{{ activeChapter.kicker[locale] }}</p>
        <h3>{{ activeChapter.title[locale] }}</h3>

        <Transition name="story-fade" mode="out-in">
          <StoryPreviewPanel
            v-if="preview && (preview.mode === 'trajectory' || preview.mode === 'consumption')"
            :key="preview.chapterId"
            :preview="preview"
            :locale="locale"
          />
          <StoryOverviewPreviewPanel
            v-else-if="preview"
            :key="preview.chapterId"
            :preview="preview"
            :locale="locale"
          />
          <div v-else :key="`${activeChapter.id}-fallback`" class="story-preview story-preview--empty">
            {{ copy.previewFallback }}
          </div>
        </Transition>

        <p class="story-summary__prose">{{ activeChapter.takeaway[locale] }}</p>

        <div class="story-summary__meta">
          <strong>{{ activeChapter.startYear }} → {{ activeChapter.endYear }}</strong>
          <span>{{ activeChapter.countries.join(' / ') }}</span>
        </div>

        <button type="button" class="hero-link" @click="emit('jump-atlas')">
          {{ copy.jumpAtlas }}
        </button>
      </aside>
    </div>
  </section>
</template>
