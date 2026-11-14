import { computed, onMounted, ref } from "vue";
import { readStore, writeStore } from "../services/browserStore.js";
import { loadExcerptFromSource, makeLocalExcerpt } from "../services/poetrySource.js";
import { poetrySourceConfig } from "../config/poetrySource.js";
import { notify } from "./useNotices.js";

const EXCERPT_QUEUE_SIZE = 6;
const REMOTE_PREFETCH_SIZE = 4;
const SAVES_KEY = "lanze_saved_excerpts";

const decorateExcerpt = (source) => ({
  ...source,
  title: source.origin,
  paragraph: source.content,
  paragraphs: [source.content],
  tags: [source.category, "摘录"],
  type: "legacy",
  titleNote: "本页只展示一句摘录，不替代完整底本。",
});

export const useExcerptDeck = () => {
  const dayIndex = Math.floor(Date.now() / 86400000);
  const page = ref(dayIndex);
  const current = ref(null);
  const stack = ref([]);
  const status = ref("loading");
  const source = ref("local");
  const depth = ref(0);
  const sourceLabel = computed(() => source.value === "remote" ? "诗句源：随机古诗词 API" : "诗句源：仓库内置摘录");
  const storedSaves = readStore(SAVES_KEY, []);
  const saves = ref(Array.isArray(storedSaves) ? storedSaves.map(String) : []);
  let queue = [];
  let remoteRequested = false;

  const localFor = (index) => decorateExcerpt(makeLocalExcerpt(index));

  const fillQueue = () => {
    const known = new Set([
      current.value?.content,
      ...queue.map((entry) => entry.decorated.content),
    ].filter(Boolean));
    let offset = queue.length + 1;
    while (queue.length < EXCERPT_QUEUE_SIZE) {
      const candidate = localFor(page.value + offset);
      offset += 1;
      if (known.has(candidate.content)) continue;
      queue.push({ decorated: candidate, source: "local" });
      known.add(candidate.content);
    }
    depth.value = queue.length;
  };

  const syncStack = () => {
    const head = queue[0];
    if (!head) {
      fillQueue();
      return;
    }
    stack.value = [current.value, ...queue.slice(0, 3).map((entry) => entry.decorated)]
      .filter(Boolean)
      .map((entry) => ({
        ...entry,
        saved: saves.value.includes(`excerpt-${entry.content}`),
      }));
  };

  const prepareRemote = async () => {
    fillQueue();
    if (!poetrySourceConfig.enabled || remoteRequested) return;
    remoteRequested = true;
    const basePage = page.value;
    const previousContent = current.value?.content || "";
    const results = await Promise.all(
      Array.from({ length: REMOTE_PREFETCH_SIZE }, (_, position) =>
        loadExcerptFromSource({
          index: basePage + position + 1,
          previousContent,
        })),
    );
    if (basePage !== page.value) return;
    const known = new Set([
      current.value?.content,
      ...queue.map((entry) => entry.decorated.content),
    ].filter(Boolean));
    for (const result of results) {
      if (result.source !== "remote" || result.reason) continue;
      const decorated = decorateExcerpt(result.excerpt);
      if (known.has(decorated.content)) continue;
      queue.push({ decorated, source: "remote" });
      known.add(decorated.content);
    }
    fillQueue();
    syncStack();
  };

  const load = () => {
    current.value = localFor(page.value);
    source.value = "local";
    status.value = "fallback";
    fillQueue();
    syncStack();
  };

  const turn = () => {
    if (status.value === "loading" || !queue.length) return;
    const result = queue.shift();
    page.value += 1;
    current.value = result.decorated;
    source.value = result.source === "remote" ? "remote" : "local";
    status.value = result.source === "remote" ? "ready" : "fallback";
    fillQueue();
    syncStack();
    prepareRemote();
  };

  const toggleSavedExcerpt = (target) => {
    const key = `excerpt-${target.content}`;
    const added = !saves.value.includes(key);
    const next = added
      ? [...saves.value, key]
      : saves.value.filter((id) => id !== key);
    saves.value = next;
    writeStore(SAVES_KEY, next);
    syncStack();
    notify(added ? "已收下这一句摘录" : "已取消这句摘录", added ? "success" : "info");
  };

  onMounted(() => {
    load();
    prepareRemote();
  });

  return {
    stack,
    status,
    sourceLabel,
    depth,
    prepareRemote,
    turn,
    toggleSavedExcerpt,
  };
};
