const LEGACY_AUDIO = Object.freeze([
  {
    id: "shaonian",
    name: "少年不凡",
    artist: "刘美麟",
    mood: "一曲清音",
    url: "https://music.163.com/song/media/outer/url?id=1465288704.mp3",
    cover: "https://p2.music.126.net/lvfb_64QYmbib7ccHgDNJA==/109951165165604312.jpg?param=130y130",
  },
  {
    id: "huansha",
    name: "浣纱歌 (伴奏)",
    artist: "许多葵 / KasaYAYA / 齐栾 / 逆水寒",
    mood: "一支小调",
    url: "https://music.163.com/song/media/outer/url?id=862100710.mp3",
    cover: "https://p1.music.126.net/H0p9gXKszyJfGCmmjgaFSg==/109951163380162384.jpg?param=130y130",
  },
  {
    id: "canon",
    name: "卡农",
    artist: "dylanf",
    mood: "弦上慢板",
    url: "https://music.163.com/song/media/outer/url?id=478507889.mp3",
    cover: "https://p2.music.126.net/fL7FAeRby1s7JreBqoOKjg==/109951165175371079.jpg?param=130y130",
  },
  {
    id: "river",
    name: "River Flows in You（你的心河）",
    artist: "Yiruma",
    mood: "月下钢琴",
    url: "https://music.163.com/song/media/outer/url?id=22829932.mp3",
    cover: "https://p2.music.126.net/hG_GIDqq9UP_uMStU11Tuw==/109951165967036244.jpg?param=130y130",
  },
  {
    id: "leaves",
    name: "Leaves in the Wind",
    artist: "Isaac Shepard",
    mood: "风里琴声",
    url: "https://music.163.com/song/media/outer/url?id=19934760.mp3",
    cover: "https://p1.music.126.net/Sr0TIlk6ZRKYmiv00beGXA==/109951163935983939.jpg?param=130y130",
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
  if (!enabled) return { tracks: LEGACY_AUDIO, source: "legacy" };

  let parsed;
  try {
    parsed = JSON.parse(env.VITE_AUDIO_TRACKS || "[]");
  } catch {
    return { tracks: LEGACY_AUDIO, source: "legacy", invalidCustom: true };
  }

  const tracks = (Array.isArray(parsed) ? parsed : [parsed])
    .map(toTrack)
    .filter(Boolean);
  return tracks.length
    ? { tracks, source: "custom" }
    : { tracks: LEGACY_AUDIO, source: "legacy", invalidCustom: true };
};

export const audioConfig = createAudioConfig(
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {},
);
