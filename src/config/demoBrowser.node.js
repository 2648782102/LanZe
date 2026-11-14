export const createDemoBrowserWork = ({
  title = "窗前一纸",
  author = "兰泽来客",
  category = "即兴",
  content = "窗前一盏灯，照亮旧诗行。",
  note = "写在窗前，留在此页。",
} = {}) => ({
  origin: title,
  author,
  category,
  content,
  title: note,
});
