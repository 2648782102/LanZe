import { ref } from "vue";

const notices = ref([]);
let nextId = 1;

export const dismissNotice = (id) => {
  notices.value = notices.value.filter((notice) => notice.id !== id);
};

export const notify = (message, tone = "info", duration = 3600) => {
  if (!message) return;
  const id = nextId++;
  notices.value = [...notices.value.slice(-2), { id, message, tone }];
  window.setTimeout(() => dismissNotice(id), duration);
  return id;
};

export const useNotices = () => ({ notices, notify, dismissNotice });
