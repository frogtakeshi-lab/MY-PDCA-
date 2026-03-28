import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/schema'

interface Props {
  cycleId: number
}

export default function ActTab({ cycleId }: Props) {
  const act = useLiveQuery(() => db.acts.where('cycleId').equals(cycleId).first(), [cycleId])
  const cycle = useLiveQuery(() => db.cycles.get(cycleId), [cycleId])

  const [improvements, setImprovements] = useState('')
  const [carryOver, setCarryOver] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (act) {
      setImprovements(act.improvements)
      setCarryOver(act.carryOver)
    }
  }, [act])

  async function handleSave() {
    if (act) {
      await db.acts.update(act.id, { improvements, carryOver, updatedAt: new Date() })
    } else {
      await db.acts.add({ cycleId, improvements, carryOver, updatedAt: new Date() })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleComplete() {
    if (!confirm('このサイクルを完了にしますか？')) return
    // Actを保存してからサイクルを完了に
    if (act) {
      await db.acts.update(act.id, { improvements, carryOver, updatedAt: new Date() })
    } else {
      await db.acts.add({ cycleId, improvements, carryOver, updatedAt: new Date() })
    }
    await db.cycles.update(cycleId, { status: 'completed' })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 改善アクション */}
      <section>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          次サイクルへの改善アクション
        </label>
        <textarea
          value={improvements}
          onChange={e => setImprovements(e.target.value)}
          placeholder="例: 週末もスキマ時間を活用する。ハンズオンの比率を増やす。"
          rows={5}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* 次サイクルへ引き継ぎ */}
      <section>
        <button
          onClick={() => setCarryOver(!carryOver)}
          className="flex items-center gap-3 w-full bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50"
        >
          <div className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
            carryOver ? 'bg-blue-500' : 'bg-gray-300'
          }`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              carryOver ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">次サイクルへ引き継ぐ</p>
            <p className="text-xs text-gray-400">同じ目標を次週も継続する</p>
          </div>
        </button>
      </section>

      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
          saved ? 'bg-green-500' : 'bg-blue-600 active:bg-blue-700'
        }`}
      >
        {saved ? '保存しました！' : '保存'}
      </button>

      {/* サイクル完了ボタン */}
      {cycle?.status === 'active' && (
        <button
          onClick={handleComplete}
          className="w-full py-3 rounded-xl font-semibold border-2 border-green-500 text-green-600 active:bg-green-50"
        >
          このサイクルを完了にする
        </button>
      )}
      {cycle?.status === 'completed' && (
        <div className="flex items-center justify-center gap-2 py-3 text-green-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">サイクル完了済み</span>
        </div>
      )}
    </div>
  )
}
