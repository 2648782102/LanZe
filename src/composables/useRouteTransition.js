import { ref } from "vue";

const transitionActive = ref(false);
let stopTimer = null;

export const useRouteTransition = () => {
  const start = (duration = 500) => {
    if (stopTimer) clearTimeout(stopTimer);
    transitionActive.value = true;
    stopTimer = setTimeout(() => {
      transitionActive.value = false;
      stopTimer = null;
    }, duration);
  };

  const stop = () => {
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = null;
    transitionActive.value = false;
  };

  return { transitionActive, start, stop };
};
