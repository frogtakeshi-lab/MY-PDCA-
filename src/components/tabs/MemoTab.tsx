import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/schema'

interface Props {
  cycleId: number
}

export default function MemoTab({ cycleId }: Props) {
  const cycle = useLiveQuery(() => db.cycles.get(cycleId), [cycleId])
  const [memo, setMemo] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (cycle) setMemo(cycle.memo ?? '')
  }, [cycle])

  async function handleSave() {
    await db.cycles.update(cycleId, { memo })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-400">
        このサイクル全体に関するメモ・気づき・リンクなど自由に記録できます
      </p>
      <textarea
        value={memo}
        onChange={e => setMemo(e.target.value)}
        placeholder="例: 参考リンク、気づき、次回への申し送りなど..."
        rows={12}
        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
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
