import { onBeforeUnmount, ref } from "vue";

export function useLottieSource(animationData) {
  const source = ref("");
  let objectUrl = "";

  if (typeof Blob !== "undefined" && typeof URL !== "undefined" && URL.createObjectURL) {
    const blob = new Blob([JSON.stringify(animationData)], { type: "application/json" });
    objectUrl = URL.createObjectURL(blob);
    source.value = objectUrl;
  }

  onBeforeUnmount(() => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });

  return source;
}
