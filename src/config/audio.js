const LOCAL_AUDIO = Object.freeze([{
  name: "兰泽 · 本地演示音",
  artist: "LanZe contributors",
  url: "./media/lanze-demo.wav",
  cover: "./media/lanze-demo-cover.svg",
}]);

const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const toTrack = (value) => {
  if (!isRecord(value)) return null;
  const { name, artist, url, cover } = value;
  if (typeof url !== "string" || !url.trim()) return null;
  return {
    name: typeof name === "string" && name.trim() ? name.trim() : "未命名音轨",
    artist: typeof artist === "string" && artist.trim() ? artist.trim() : "未标注作者",
    url: url.trim(),
    ...(typeof cover === "string" && cover.trim() ? { cover: cover.trim() } : {}),
  };
};

export const createAudioConfig = (env = {}) => {
  const enabled = String(env.VITE_AUDIO_SOURCE || "").trim().toLowerCase() === "custom";
  if (!enabled) return { tracks: LOCAL_AUDIO, source: "local" };

  let parsed;
  try {
    parsed = JSON.parse(env.VITE_AUDIO_TRACKS || "[]");
  } catch {
    return { tracks: LOCAL_AUDIO, source: "local", invalidCustom: true };
  }

  const tracks = (Array.isArray(parsed) ? parsed : [parsed])
    .map(toTrack)
    .filter(Boolean);
  return tracks.length
    ? { tracks, source: "custom" }
    : { tracks: LOCAL_AUDIO, source: "local", invalidCustom: true };
};

export const audioConfig = createAudioConfig(
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {},
);
