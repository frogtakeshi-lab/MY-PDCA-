import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import Layout from '../components/Layout'
import { db } from '../db/schema'
import { getWeekStart, getColorClasses } from '../lib/utils'

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

function getWeekDates(weekStart: string): string[] {
  const dates: string[] = []
  const base = new Date(weekStart + 'T00:00:00')
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function addWeeks(weekStart: string, delta: number): string {
  const d = new Date(weekStart + 'T00:00:00')
  d.setDate(d.getDate() + delta * 7)
  return d.toISOString().slice(0, 10)
}

function formatWeekRange(weekStart: string): string {
  const d = new Date(weekStart + 'T00:00:00')
  const end = new Date(d)
  end.setDate(d.getDate() + 6)
  return `${d.getMonth() + 1}/${d.getDate()} 〜 ${end.getMonth() + 1}/${end.getDate()}`
}

export default function WeeklyDiaryPage() {
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const navigate = useNavigate()
  const weekDates = getWeekDates(weekStart)
  const today = new Date().toISOString().slice(0, 10)

  const cycles = useLiveQuery(
    () => db.cycles.where('weekStart').equals(weekStart).toArray(),
    [weekStart]
  )
  const genres = useLiveQuery(() => db.genres.toArray(), [])
  const doRecords = useLiveQuery(
    () => db.doRecords.where('cycleId').anyOf(cycles?.map(c => c.id) ?? []).toArray(),
    [cycles]
  )

  if (!cycles || !genres || !doRecords) return null

  const genreMap = Object.fromEntries(genres.map(g => [g.id, g]))
  // cycleId + date -> record
  const recMap: Record<string, typeof doRecords[0]> = {}
  doRecords.forEach(r => { recMap[`${r.cycleId}-${r.date}`] = r })

  return (
    <Layout title="週間ダイアリー">
      {/* 週ナビゲーター */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-[57px] z-10">
        <button
          onClick={() => setWeekStart(addWeeks(weekStart, -1))}
          className="p-2 text-gray-500 active:text-gray-900 rounded-lg active:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setWeekStart(getWeekStart())}
          className="text-sm font-semibold text-gray-900 active:text-blue-600"
        >
          {formatWeekRange(weekStart)}
          {weekStart === getWeekStart() && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">今週</span>
          )}
        </button>
        <button
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          className="p-2 text-gray-500 active:text-gray-900 rounded-lg active:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {cycles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm">この週のサイクルはありません</p>
          </div>
        )}

        {cycles.length > 0 && (
          <>
            {/* グリッドヘッダー */}
            <div className="flex mb-2">
              <div className="w-20 flex-shrink-0" />
              {weekDates.map((date, i) => (
                <div key={date} className={`flex-1 text-center text-xs font-bold ${
                  date === today ? 'text-blue-600' : i >= 5 ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  <div>{DAY_LABELS[i]}</div>
                  <div className={`text-xs font-normal ${date === today ? 'text-blue-500' : 'text-gray-400'}`}>
                    {new Date(date + 'T00:00:00').getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* サイクル × 日付グリッド */}
            <div className="flex flex-col gap-2">
              {cycles.map(cycle => {
                const genre = genreMap[cycle.genreId]
                const colors = getColorClasses(genre?.color ?? 'blue')
                return (
                  <div key={cycle.id} className="flex items-center gap-1">
                    {/* サイクル名 */}
                    <button
                      onClick={() => navigate(`/cycles/${cycle.id}`)}
                      className="w-20 flex-shrink-0 text-left pr-2"
                    >
                      <p className={`text-xs font-medium ${colors.text} truncate`}>{cycle.title}</p>
                      <p className="text-xs text-gray-400 truncate">{genre?.name}</p>
                    </button>

                    {/* 7日分のセル */}
                    {weekDates.map(date => {
                      const rec = recMap[`${cycle.id}-${date}`]
                      const isToday = date === today
                      const isPast = date < today

                      return (
                        <button
                          key={date}
                          onClick={async () => {
                            if (!rec) return
                            await db.doRecords.update(rec.id, { done: !rec.done })
                          }}
                          className={`flex-1 aspect-square rounded-lg flex items-center justify-center transition-colors ${
                            isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                          } ${
                            rec?.done
                              ? colors.bg
                              : isPast || isToday
                                ? 'bg-gray-100'
                                : 'bg-gray-50'
                          }`}
                          title={rec?.note || undefined}
                        >
                          {rec?.done ? (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : rec?.note ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* 凡例 */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                完了
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                </span>
                メモあり
              </span>
              <span className="text-xs text-gray-300">タップで完了切替</span>
            </div>

            {/* その日のメモ一覧（今日） */}
            {doRecords.filter(r => r.date === today && r.note).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-2">今日のメモ</h3>
                <div className="flex flex-col gap-2">
                  {doRecords.filter(r => r.date === today && r.note).map(r => {
                    const cycle = cycles.find(c => c.id === r.cycleId)
                    const genre = cycle ? genreMap[cycle.genreId] : undefined
                    const colors = getColorClasses(genre?.color ?? 'blue')
                    return (
                      <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className={`text-xs font-medium ${colors.text} mb-1`}>{cycle?.title}</p>
                        <p className="text-sm text-gray-700">{r.note}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
