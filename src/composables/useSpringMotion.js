/*
 * 弹簧动效只在真正需要「重量感」的地方使用（抽屉、卡片回弹）。
 * motion 的体积不算小，所以这里动态 import：首屏 bundle 不含它，
 * 只有用户第一次触发这类交互时才把这一块加载进来。
 * reduced-motion 或加载失败时直接返回，调用方保留原生的 CSS 过渡。
 */
let animatePromise = null;

const loadAnimate = () => {
  if (!animatePromise) {
    animatePromise = import("motion").then((module) => module.animate);
  }
  return animatePromise;
};

export const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * @param {Element} element 目标元素
 * @param {Record<string, any>} keyframes motion 的关键帧，如 { y: [8, 0], opacity: [0, 1] }
 * @param {{ duration?: number, delay?: number }} options 秒级时长
 * @returns {Promise<boolean>} 是否真的执行了弹簧动画
 */
export const springIn = async (element, keyframes, options = {}) => {
  if (!element || prefersReducedMotion()) return false;
  try {
    const animate = await loadAnimate();
    if (!element.isConnected || prefersReducedMotion()) return false;
    // 让 CSS 兜底动画让位，避免两套 transform 互相覆盖。
    element.classList.add("is-spring-driven");
    animate(element, keyframes, {
      duration: options.duration ?? 0.42,
      delay: options.delay ?? 0,
      ease: [0.22, 1, 0.36, 1],
      fill: "both",
    });
    return true;
  } catch {
    return false;
  }
};
