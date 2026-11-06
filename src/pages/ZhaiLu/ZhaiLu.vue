<template>
  <article class="excursion" aria-label="每日摘录">
    <div class="leaf-head">
      <p class="leaf-kicker">兰泽 · 涉猎</p>
      <h1>今日摘录</h1>
      <p class="leaf-note">三页折卷，一页一句。左右翻页可换一组诗句。</p>
    </div>

    <div class="turn">
      <button class="turn-btn" type="button" @click="skip1" aria-label="切换到上一组诗词">
        <span aria-hidden="true">‹</span><em>上一折</em>
      </button>

      <div class="concertina" :class="{ 'is-turning': isTurning }">
        <section v-for="(card, index) in cards" :key="index" class="leaf"
          :class="`leaf-${index + 1}`"
          draggable="true" @dragstart="tuoDongGo($event)" @dragend="tuoDongOff($event, index)">
          <div v-loading="card.loading" class="leaf-face">
            <span class="leaf-index" aria-hidden="true">{{ ['壹', '贰', '叁'][index] }}</span>
            <button class="seal" type="button" :class="{ 'is-kept': card.kept }"
              :aria-pressed="card.kept" :aria-label="card.kept ? `取消收藏第${index + 1}句` : `收藏第${index + 1}句`"
              @click="toggleKeep(index)">
              {{ card.kept ? '已藏' : '收藏' }}
            </button>
            <p class="verse">{{ card.excerpt.content || '正在展卷……' }}</p>
            <p class="attribution">{{ card.excerpt.author || '兰泽' }}</p>
            <p class="origin">{{ card.excerpt.origin || '' }}</p>
            <div class="landscape" aria-hidden="true">
              <span class="sun"></span>
              <span class="ridge ridge-a"></span>
              <span class="ridge ridge-b"></span>
              <span class="ridge ridge-c"></span>
              <span class="boat"></span>
            </div>
          </div>
        </section>
      </div>

      <button class="turn-btn" type="button" @click="skip2" aria-label="切换到下一组诗词">
        <em>下一折</em><span aria-hidden="true">›</span>
      </button>
    </div>

    <p class="leaf-foot">向左或向右拖动单页，也可单独更换那一折的诗句。</p>
  </article>
</template>

<script>
import "element-plus/theme-chalk/display.css";
import { reactive, onMounted, ref } from "vue";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import { PoetryRandomExcerpt } from "../../apis/api/list.js";

export default {
  name: "ZhaiLu",
  setup() {
    let excerptIndex = 0;
    const isTurning = ref(false);
    const cards = reactive([
      { excerpt: {}, kept: false, loading: true },
      { excerpt: {}, kept: false, loading: true },
      { excerpt: {}, kept: false, loading: true },
    ]);

    async function loadExcerpt(serial = 0) {
      const response = await PoetryRandomExcerpt({ index: excerptIndex++ });
      const excerpt = response?.data || {};
      if (cards[serial]) cards[serial].excerpt = excerpt;
    }

    async function skiip() {
      try {
        await Promise.all([loadExcerpt(0), loadExcerpt(1), loadExcerpt(2)]);
      } catch {
        ElMessage({ message: "诗词加载失败，请稍后再试", type: "warning" });
      }
    }

    function toggleKeep(index) {
      cards[index].kept = !cards[index].kept;
    }

    async function switchExcerpts() {
      isTurning.value = true;
      cards.forEach((card) => { card.loading = true; });
      try {
        await skiip();
        ElMessage({ message: "已换一折", type: "success" });
      } finally {
        cards.forEach((card) => { card.loading = false; });
        window.setTimeout(() => { isTurning.value = false; }, 420);
      }
    }

    function skip1() { return switchExcerpts(); }
    function skip2() { return switchExcerpts(); }

    let tuox = 0;
    let tuoy = 0;
    function tuoDongGo(event) {
      tuox = event.clientX;
      tuoy = event.clientY;
    }

    function tuoDongOff(event, serial) {
      const deltaX = event.clientX - tuox;
      const deltaY = event.clientY - tuoy;
      if (Math.abs(deltaX) > 120 || Math.abs(deltaY) > 120) {
        cards[serial].loading = true;
        loadExcerpt(serial).finally(() => { cards[serial].loading = false; });
      }
    }

    onMounted(async () => {
      await skiip();
      cards.forEach((card) => { card.loading = false; });
    });

    return {
      cards, isTurning, toggleKeep, skip1, skip2, tuoDongGo, tuoDongOff,
    };
  },
};
</script>

<style scoped>
.excursion {
  max-width: 1280px;
  margin: 0 auto;
  padding: 54px 42px 36px;
}

.leaf-head {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 28px;
  margin-bottom: 34px;
}

.leaf-kicker {
  margin: 0;
  color: var(--seal);
  font-size: 12px;
  letter-spacing: 5px;
}

.leaf-head h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(34px, 4vw, 52px);
  font-weight: 400;
  letter-spacing: 16px;
  line-height: 1.2;
  white-space: nowrap;
}

.leaf-note {
  margin: 0;
  justify-self: end;
  max-width: 260px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.9;
  text-align: right;
}

.turn {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 64px;
  align-items: center;
  gap: 12px;
}

.turn-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 140px;
  border: 0;
  background: none;
  color: var(--jade);
}

.turn-btn span {
  font-family: var(--font-display);
  font-size: 46px;
  line-height: 1;
  transition: transform 0.25s ease;
}

.turn-btn em {
  font-size: 11px;
  font-style: normal;
  letter-spacing: 3px;
  writing-mode: vertical-rl;
}

.turn-btn:hover span { transform: scale(1.18); }
.turn-btn:last-child:hover span { transform: scale(1.18); }

.concertina {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  min-height: 460px;
  border-top: 1px solid var(--rule-strong);
  border-bottom: 1px solid var(--rule-strong);
  box-shadow: var(--shadow);
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.concertina.is-turning { transform: translateY(6px); opacity: 0.72; }

.leaf {
  position: relative;
  min-width: 0;
  border-right: 1px solid var(--rule);
  background:
    linear-gradient(90deg, rgba(38, 53, 47, 0.05), transparent 12%, transparent 88%, rgba(38, 53, 47, 0.06)),
    var(--paper-light);
}

.leaf:last-child { border-right: 0; }
.leaf:nth-child(2) { background-color: #f2eee3; }

.leaf::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  right: -1px;
  width: 8px;
  background: linear-gradient(90deg, transparent, rgba(38, 53, 47, 0.08));
  pointer-events: none;
}

.leaf-face {
  position: relative;
  height: 100%;
  min-height: 460px;
  padding: 34px 26px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.leaf-index {
  align-self: flex-start;
  color: var(--jade);
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 3px;
}

.seal {
  position: absolute;
  top: 28px;
  right: 22px;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 2px solid var(--seal);
  background: transparent;
  color: var(--seal);
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 1px;
  line-height: 1.1;
  transition: background 0.2s ease, color 0.2s ease;
}

.seal.is-kept { background: var(--seal); color: var(--paper-light); }

.verse {
  margin: 48px 0 0;
  height: 230px;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: clamp(22px, 2.1vw, 30px);
  letter-spacing: 8px;
  line-height: 1.9;
  writing-mode: vertical-rl;
}

.attribution {
  margin: 26px 0 0;
  color: var(--jade-deep);
  font-size: 14px;
  letter-spacing: 4px;
  writing-mode: vertical-rl;
}

.origin {
  margin: 12px 0 0;
  color: var(--ink-soft);
  font-size: 11px;
  letter-spacing: 2px;
}

.landscape {
  position: relative;
  width: 100%;
  height: 92px;
  margin-top: auto;
  overflow: hidden;
}

.sun {
  position: absolute;
  left: 22%;
  top: 14px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--seal);
  opacity: 0.8;
}

.ridge {
  position: absolute;
  bottom: 0;
  width: 120%;
  height: 54px;
  border-radius: 50% 50% 0 0;
}

.ridge-a { left: -18%; background: rgba(47, 93, 80, 0.13); height: 68px; }
.ridge-b { left: 14%; background: rgba(47, 93, 80, 0.2); height: 50px; }
.ridge-c { left: 52%; background: rgba(47, 93, 80, 0.12); height: 62px; }

.boat {
  position: absolute;
  left: 46%;
  bottom: 8px;
  width: 18px;
  height: 2px;
  background: var(--ink);
}

.boat::after {
  content: "";
  position: absolute;
  left: 5px;
  top: -7px;
  width: 8px;
  height: 7px;
  border-left: 1px solid var(--ink);
  transform: skewX(-18deg);
}

.leaf-foot {
  margin: 22px 0 0;
  color: var(--ink-soft);
  font-size: 12px;
  letter-spacing: 2px;
  text-align: center;
}

@media (max-width: 991px) {
  .excursion { padding: 36px 18px 24px; }
  .leaf-head { grid-template-columns: 1fr; gap: 6px; text-align: center; }
  .leaf-kicker, .leaf-note { justify-self: center; text-align: center; }
  .leaf-head h1 { letter-spacing: 8px; }
  .turn { grid-template-columns: 38px minmax(0, 1fr) 38px; gap: 4px; }
  .turn-btn { height: 96px; }
  .turn-btn em { display: none; }
  .concertina { grid-template-columns: 1fr; min-height: 0; }
  .leaf { border-right: 0; border-bottom: 1px solid var(--rule); }
  .leaf:last-child { border-bottom: 0; }
  .leaf-face { min-height: 430px; padding-top: 24px; }
  .verse { margin-top: 44px; height: 210px; }
}
</style>
