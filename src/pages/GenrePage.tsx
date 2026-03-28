import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import Layout from '../components/Layout'
import CycleFormModal from '../components/CycleFormModal'
import { db, type Cycle } from '../db/schema'
import { getColorClasses, formatWeekLabel } from '../lib/utils'

export default function GenrePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const genreId = Number(id)

  const genre = useLiveQuery(() => db.genres.get(genreId), [genreId])
  const cycles = useLiveQuery(
    () => db.cycles.where('genreId').equals(genreId).sortBy('weekStart').then(arr => arr.reverse()),
    [genreId]
  )

  const [modalOpen, setModalOpen] = useState(false)

  async function handleSave(title: string, weekStart: string) {
    await db.cycles.add({
      genreId,
      title,
      weekStart,
      status: 'active',
      createdAt: new Date(),
    })
    setModalOpen(false)
  }

  async function handleDelete(cycle: Cycle) {
    if (!confirm(`「${cycle.title}」を削除しますか？`)) return
    await Promise.all([
      db.plans.where('cycleId').equals(cycle.id).delete(),
      db.doRecords.where('cycleId').equals(cycle.id).delete(),
      db.checks.where('cycleId').equals(cycle.id).delete(),
      db.acts.where('cycleId').equals(cycle.id).delete(),
      db.cycles.delete(cycle.id),
    ])
  }

  if (!genre) return null

  const colors = getColorClasses(genre.color)

  return (
    <Layout title={genre.name} showBack>
      <div className="p-4">
        {/* ジャンルヘッダー */}
        <div className={`${colors.light} rounded-xl p-4 mb-4 flex items-center gap-3`}>
          <span className={`w-10 h-10 rounded-full ${colors.bg} flex-shrink-0`} />
          <div>
            <p className={`font-bold text-lg ${colors.text}`}>{genre.name}</p>
            <p className="text-sm text-gray-500">{cycles?.length ?? 0} サイクル</p>
          </div>
        </div>

        {/* サイクル一覧 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-700">サイクル</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-sm text-blue-600 font-medium active:opacity-70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新しいサイクル
          </button>
        </div>

        {cycles?.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔄</p>
            <p className="text-sm">サイクルを追加してPDCAを始めよう</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {cycles?.map(cycle => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              colorBg={colors.bg}
              onClick={() => navigate(`/cycles/${cycle.id}`)}
              onDelete={() => handleDelete(cycle)}
            />
          ))}
        </div>
      </div>

      {modalOpen && (
        <CycleFormModal
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </Layout>
  )
}

function CycleCard({
  cycle,
  colorBg,
  onClick,
  onDelete,
}: {
  cycle: Cycle
  colorBg: string
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left active:bg-gray-50"
        onClick={onClick}
      >
        <span className={`w-2 h-10 rounded-full ${colorBg} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{cycle.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatWeekLabel(cycle.weekStart)}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <StatusBadge status={cycle.status} />
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
      <div className="border-t border-gray-100">
        <button
          onClick={onDelete}
          className="w-full py-2 text-xs text-red-500 active:bg-red-50"
        >
          削除
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Cycle['status'] }) {
  if (status === 'completed') {
    return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">完了</span>
  }
  return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">進行中</span>
}
