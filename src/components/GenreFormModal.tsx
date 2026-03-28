import { useState, useEffect } from 'react'
import { GENRE_COLORS } from '../lib/utils'
import type { Genre } from '../db/schema'

interface Props {
  initial?: Genre
  onSave: (name: string, color: string) => void
  onClose: () => void
}

export default function GenreFormModal({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? 'blue')

  useEffect(() => {
    setName(initial?.name ?? '')
    setColor(initial?.color ?? 'blue')
  }, [initial])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), color)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-2xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">
          {initial ? 'ジャンルを編集' : 'ジャンルを追加'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: 仕事、学習、習慣..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カラー</label>
            <div className="flex gap-3 flex-wrap">
              {GENRE_COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-9 h-9 rounded-full ${c.bg} transition-transform ${
                    color === c.name ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-2 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl disabled:opacity-40 active:bg-blue-700"
          >
            保存
          </button>
        </form>
      </div>
    </div>
  )
}
