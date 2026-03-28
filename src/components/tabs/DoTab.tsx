import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/schema'

interface Props {
  cycleId: number
  weekStart: string  // "YYYY-MM-DD" (月曜日)
}

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function DoTab({ cycleId, weekStart }: Props) {
  const weekDates = getWeekDates(weekStart)
  const records = useLiveQuery(
    () => db.doRecords.where('cycleId').equals(cycleId).toArray(),
    [cycleId]
  )

  // 週の7日分のレコードが未作成なら自動生成
  useEffect(() => {
    if (!records) return
    const existingDates = new Set(records.map(r => r.date))
    const missing = weekDates.filter(d => !existingDates.has(d))
    if (missing.length > 0) {
      db.doRecords.bulkAdd(
        missing.map(date => ({ cycleId, date, note: '', done: false }))
      )
    }
  }, [records, cycleId, weekStart])

  if (!records) return null

  const recordsByDate = Object.fromEntries(records.map(r => [r.date, r]))
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400">各日の進捗を記録しよう</p>
      {weekDates.map((date, i) => {
        const rec = recordsByDate[date]
        if (!rec) return null
        const isToday = date === today
        const isPast = date < today

        return (
          <div
            key={date}
            className={`bg-white rounded-xl border p-4 ${
              isToday ? 'border-blue-400 shadow-sm' : 'border-gray-100'
            }`}
          >
            {/* ヘッダー行 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold w-5 ${
                  i >= 5 ? 'text-blue-500' : 'text-gray-700'
                }`}>
                  {DAY_LABELS[i]}
                </span>
                <span className="text-xs text-gray-400">{formatDate(date)}</span>
                {isToday && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">今日</span>
                )}
              </div>
              {/* 完了チェック */}
              <button
                onClick={() => db.doRecords.update(rec.id, { done: !rec.done })}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                  rec.done
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}
              >
                {rec.done && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>

            {/* メモ */}
            <textarea
              value={rec.note}
              onChange={e => db.doRecords.update(rec.id, { note: e.target.value })}
              placeholder={isPast ? '振り返りを記録...' : '今日やったことを記録...'}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder:text-gray-300"
            />
          </div>
        )
      })}
    </div>
  )
}
