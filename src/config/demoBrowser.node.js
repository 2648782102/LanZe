export const createDemoBrowserWork = ({
  title = "冒烟测试作品",
  author = "浏览器冒烟",
  category = "回归测试",
  content = "窗前一盏灯，照亮旧诗行。",
  note = "由本机浏览器冒烟写入 localStorage，仅用于验证发布链路。",
} = {}) => ({
  origin: title,
  author,
  category,
  content,
  title: note,
});
