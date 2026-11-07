const LOCAL_AUDIO = Object.freeze([
  {
    id: "qingshan",
    name: "空山 · 松风",
    artist: "兰泽声景",
    mood: "舒缓 · 五声音阶",
    url: "./media/lanze-qingshan.wav",
    cover: "./media/lanze-qingshan-cover.svg",
    duration: 24,
  },
  {
    id: "yuese",
    name: "月色 · 瓷盏",
    artist: "兰泽声景",
    mood: "清冷 · 泛音",
    url: "./media/lanze-yuese.wav",
    cover: "./media/lanze-yuese-cover.svg",
    duration: 24,
  },
  {
    id: "wanzhou",
    name: "晚舟 · 水纹",
    artist: "兰泽声景",
    mood: "流动 · 低频",
    url: "./media/lanze-wanzhou.wav",
    cover: "./media/lanze-wanzhou-cover.svg",
    duration: 24,
  },
]);

const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const toTrack = (value) => {
  if (!isRecord(value)) return null;
  const { id, name, artist, url, cover, mood, duration } = value;
  if (typeof url !== "string" || !url.trim()) return null;
  return {
    ...(typeof id === "string" && id.trim() ? { id: id.trim() } : {}),
    name: typeof name === "string" && name.trim() ? name.trim() : "未命名音轨",
    artist: typeof artist === "string" && artist.trim() ? artist.trim() : "未标注作者",
    url: url.trim(),
    ...(typeof cover === "string" && cover.trim() ? { cover: cover.trim() } : {}),
    ...(typeof mood === "string" && mood.trim() ? { mood: mood.trim() } : {}),
    ...(Number(duration) > 0 ? { duration: Number(duration) } : {}),
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
