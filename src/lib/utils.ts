/** その日が属する週の月曜日を "YYYY-MM-DD" 形式で返す */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // 月曜始まり
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

/** "YYYY-MM-DD" → "YYYY年 W週目" 表示 */
export function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + 'T00:00:00')
  const end = new Date(d)
  end.setDate(end.getDate() + 6)

  const m1 = d.getMonth() + 1
  const d1 = d.getDate()
  const m2 = end.getMonth() + 1
  const d2 = end.getDate()

  return `${m1}/${d1} 〜 ${m2}/${d2}`
}

/** ジャンルカラーに対応した Tailwind クラスを返す */
export const GENRE_COLORS = [
  { name: 'blue',   bg: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-700' },
  { name: 'green',  bg: 'bg-green-500',  light: 'bg-green-100',  text: 'text-green-700' },
  { name: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
  { name: 'orange', bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' },
  { name: 'pink',   bg: 'bg-pink-500',   light: 'bg-pink-100',   text: 'text-pink-700' },
  { name: 'teal',   bg: 'bg-teal-500',   light: 'bg-teal-100',   text: 'text-teal-700' },
] as const

export type GenreColorName = typeof GENRE_COLORS[number]['name']

export function getColorClasses(colorName: string) {
  return GENRE_COLORS.find(c => c.name === colorName) ?? GENRE_COLORS[0]
}
