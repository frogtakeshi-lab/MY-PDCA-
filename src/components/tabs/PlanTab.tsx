import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/schema'

interface Props {
  cycleId: number
}

export default function PlanTab({ cycleId }: Props) {
  const plan = useLiveQuery(() => db.plans.where('cycleId').equals(cycleId).first(), [cycleId])

  const [goal, setGoal] = useState('')
  const [actions, setActions] = useState<string[]>([''])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (plan) {
      setGoal(plan.goal)
      setActions(plan.actions.length > 0 ? plan.actions : [''])
    }
  }, [plan])

  async function handleSave() {
    const cleanedActions = actions.filter(a => a.trim())
    if (plan) {
      await db.plans.update(plan.id, { goal, actions: cleanedActions, updatedAt: new Date() })
    } else {
      await db.plans.add({ cycleId, goal, actions: cleanedActions, updatedAt: new Date() })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addAction() {
    setActions(prev => [...prev, ''])
  }

  function updateAction(index: number, value: string) {
    setActions(prev => prev.map((a, i) => i === index ? value : a))
  }

  function removeAction(index: number) {
    setActions(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 目標 */}
      <section>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          今週の目標
        </label>
        <textarea
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="例: TypeScriptの型システムを理解する"
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* アクション */}
      <section>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          アクション（具体的な行動）
        </label>
        <div className="flex flex-col gap-2">
          {actions.map((action, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-400 text-sm w-5 text-right flex-shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={action}
                onChange={e => updateAction(i, e.target.value)}
                placeholder={`アクション ${i + 1}`}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {actions.length > 1 && (
                <button
                  onClick={() => removeAction(i)}
                  className="p-1 text-gray-400 active:text-red-500"
                  aria-label="削除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addAction}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 font-medium active:opacity-70"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          アクションを追加
        </button>
      </section>

      {/* 保存ボタン */}
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
