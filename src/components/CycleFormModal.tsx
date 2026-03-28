import { useState } from 'react'
import { getWeekStart } from '../lib/utils'

interface Props {
  onSave: (title: string, weekStart: string) => void
  onClose: () => void
}

export default function CycleFormModal({ onSave, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [weekStart, setWeekStart] = useState(getWeekStart())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave(title.trim(), weekStart)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-2xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">サイクルを追加</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例: TypeScript基礎を固める"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始週（月曜日）</label>
            <input
              type="date"
              value={weekStart}
              onChange={e => setWeekStart(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="mt-2 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl disabled:opacity-40 active:bg-blue-700"
          >
            作成
          </button>
        </form>
      </div>
    </div>
  )
}
