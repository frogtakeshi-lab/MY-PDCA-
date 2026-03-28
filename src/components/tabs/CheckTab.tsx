import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/schema'

interface Props {
  cycleId: number
}

export default function CheckTab({ cycleId }: Props) {
  const check = useLiveQuery(() => db.checks.where('cycleId').equals(cycleId).first(), [cycleId])
  const doRecords = useLiveQuery(() => db.doRecords.where('cycleId').equals(cycleId).toArray(), [cycleId])

  const [achievements, setAchievements] = useState('')
  const [issues, setIssues] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (check) {
      setAchievements(check.achievements)
      setIssues(check.issues)
    }
  }, [check])

  async function handleSave() {
    if (check) {
      await db.checks.update(check.id, { achievements, issues, updatedAt: new Date() })
    } else {
      await db.checks.add({ cycleId, achievements, issues, updatedAt: new Date() })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const doneCount = doRecords?.filter(r => r.done).length ?? 0
  const totalCount = doRecords?.length ?? 0

  return (
    <div className="flex flex-col gap-5">
      {/* Doサマリー */}
      {totalCount > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">今週の実施状況</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700">{doneCount}/{totalCount}日</span>
          </div>
        </div>
      )}

      {/* できたこと */}
      <section>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          できたこと / 良かったこと
        </label>
        <textarea
          value={achievements}
          onChange={e => setAchievements(e.target.value)}
          placeholder="例: 毎日30分は確保できた。基礎文法は理解できた。"
          rows={4}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* 課題 */}
      <section>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          できなかったこと / 課題
        </label>
        <textarea
          value={issues}
          onChange={e => setIssues(e.target.value)}
          placeholder="例: 週末は全くできなかった。型の応用が難しくてスタックした。"
          rows={4}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
          saved ? 'bg-green-500' : 'bg-blue-600 active:bg-blue-700'
        }`}
      >
        {saved ? '保存しました！' : '保存'}
      </button>
    </div>
  )
}
