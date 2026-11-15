<template>
  <section class="gallery__strips">
    <div class="shell legacy-gallery">
      <div class="legacy-gallery__card">
        <ExcerptCard
          v-if="excerpt"
          :data-excerpt-queue-depth="depth"
          :excerpt="excerpt"
          :upcoming-excerpts="upcoming"
          :saved="excerpt.saved"
          :disabled="loading"
          @toggle-save="emit('toggle-save', $event)"
          @needs-next="emit('needs-next')"
          @settled="emit('settled')"
        />
        <p v-if="loading && !excerpt" class="legacy-card-status" role="status">正在铺开诗笺……</p>
        <p class="excerpt-source" aria-live="polite" :class="{ 'is-refreshing': loading }">
          {{ sourceLabel }}
        </p>
      </div>

      <article class="strip-intro">
        <p class="eyebrow">余韵 · 一则</p>
        <h2>读完一首，<br />让句子再走一段。</h2>
        <p>留一枚书签，收一句心动。题句、落款与扇舟小景，都留在这一方白纸里。</p>
        <div class="strip-actions">
          <router-link class="button" to="/explore">
            进入诗词索引
          </router-link>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import ExcerptCard from "./ExcerptCard.vue";

defineProps({
  excerpt: { type: Object, default: null },
  upcoming: { type: Array, default: () => [] },
  depth: { type: [Number, String], default: 0 },
  loading: { type: Boolean, default: false },
  sourceLabel: { type: String, default: "" },
});

const emit = defineEmits(["toggle-save", "needs-next", "settled"]);
</script>

<style scoped>
.gallery__strips {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--line);
  padding-bottom: 0;
  background: rgba(232, 236, 229, 0.56);
}

.legacy-gallery {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(64px, 10vw, 160px);
  /* 唯一的区块收尾留白；strips 不再另加 padding，避免叠加成大片空白。 */
  padding-block: 56px 64px;
}

.legacy-gallery__card {
  display: grid;
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
  min-height: 652px;
  place-items: center;
}

.legacy-card-status {
  position: absolute;
  z-index: 4;
  margin: 0;
  padding: 8px 10px;
  background: rgba(251, 252, 249, 0.86);
  color: var(--ink-faint);
  font-family: var(--font-poem);
  font-size: 14px;
  letter-spacing: 0.12em;
  writing-mode: vertical-rl;
  pointer-events: none;
}

.strip-intro {
  display: grid;
  grid-column: 1;
  grid-row: 1;
  align-content: start;
  justify-items: start;
  gap: 18px;
}

.strip-intro h2 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.35;
  text-wrap: balance;
}

.strip-intro > p:not(.eyebrow) {
  max-width: min(380px, var(--measure-copy));
  margin: 0;
  color: var(--ink-soft);
  font-size: var(--text-body);
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.strip-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.strip-actions .button:disabled {
  cursor: wait;
  opacity: 0.56;
}

.excerpt-source {
  align-self: end;
  justify-self: center;
  margin: 48px 0 0;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.12em;
  transition: opacity var(--motion-fast) var(--ease-standard);
}

.excerpt-source.is-refreshing {
  opacity: 0.45;
}

@media (max-width: 820px) {
  .legacy-gallery {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 40px;
    padding-block: 58px 72px;
  }

  .legacy-gallery__card {
    grid-column: 2;
    grid-row: 1;
    min-height: 590px;
  }

  .strip-intro {
    grid-column: 1;
    grid-row: 1;
    max-width: 560px;
  }
}

@media (max-width: 768px) {
  .legacy-gallery {
    grid-template-columns: 1fr;
    gap: 44px;
    padding-block: 44px 56px;
  }

  .legacy-gallery__card,
  .strip-intro {
    grid-column: 1;
    grid-row: auto;
  }

  .legacy-gallery__card {
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .legacy-gallery {
    grid-template-columns: 1fr;
    gap: 44px;
    padding-block: 40px 48px;
  }

  .legacy-gallery__card {
    grid-column: 1;
    grid-row: 1;
    min-height: 570px;
  }

  .strip-intro {
    grid-column: 1;
    grid-row: 2;
    max-width: none;
    gap: 13px;
  }

  .strip-intro h2 {
    font-size: 30px;
  }

  .strip-intro > p:not(.eyebrow) {
    font-size: var(--text-note);
    line-height: 1.8;
  }
}

@media (max-width: 380px) {
  .legacy-gallery__card {
    min-height: 550px;
  }

  .strip-actions {
    gap: 8px;
  }

  .strip-actions .button {
    padding-inline: 12px;
  }
}
</style>
