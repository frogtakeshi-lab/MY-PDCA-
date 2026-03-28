import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import Layout from '../components/Layout'
import GenreFormModal from '../components/GenreFormModal'
import { db, type Genre } from '../db/schema'
import { getColorClasses } from '../lib/utils'

export default function HomePage() {
  const navigate = useNavigate()
  const genres = useLiveQuery(() => db.genres.orderBy('createdAt').toArray(), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Genre | undefined>()

  async function handleSave(name: string, color: string) {
    if (editTarget) {
      await db.genres.update(editTarget.id, { name, color })
    } else {
      await db.genres.add({ name, color, createdAt: new Date() })
    }
    setModalOpen(false)
    setEditTarget(undefined)
  }

  async function handleDelete(genre: Genre) {
    if (!confirm(`「${genre.name}」を削除しますか？\n関連するサイクルもすべて削除されます。`)) return
    const cycles = await db.cycles.where('genreId').equals(genre.id).toArray()
    const cycleIds = cycles.map(c => c.id)
    await Promise.all([
      db.plans.where('cycleId').anyOf(cycleIds).delete(),
      db.doRecords.where('cycleId').anyOf(cycleIds).delete(),
      db.checks.where('cycleId').anyOf(cycleIds).delete(),
      db.acts.where('cycleId').anyOf(cycleIds).delete(),
      db.cycles.where('genreId').equals(genre.id).delete(),
      db.genres.delete(genre.id),
    ])
  }

  function openEdit(genre: Genre) {
    setEditTarget(genre)
    setModalOpen(true)
  }

  return (
    <Layout title="MY PDCA">
      <div className="p-4">
        {/* 今週のサマリーは後で実装 */}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-700">ジャンル</h2>
            <button
              onClick={() => { setEditTarget(undefined); setModalOpen(true) }}
              className="flex items-center gap-1 text-sm text-blue-600 font-medium active:opacity-70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              追加
            </button>
          </div>

          {genres?.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🗂️</p>
              <p className="text-sm">ジャンルを追加してPDCAを始めよう</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {genres?.map(genre => (
              <GenreCard
                key={genre.id}
                genre={genre}
                onClick={() => navigate(`/genres/${genre.id}`)}
                onEdit={() => openEdit(genre)}
                onDelete={() => handleDelete(genre)}
              />
            ))}
          </div>
        </section>
      </div>

      {modalOpen && (
        <GenreFormModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(undefined) }}
        />
      )}
    </Layout>
  )
}

function GenreCard({
  genre,
  onClick,
  onEdit,
  onDelete,
}: {
  genre: Genre
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const colors = getColorClasses(genre.color)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left active:bg-gray-50"
        onClick={onClick}
      >
        <span className={`w-10 h-10 rounded-full ${colors.bg} flex-shrink-0`} />
        <span className="flex-1 font-medium text-gray-900">{genre.name}</span>
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 編集・削除メニュー */}
      <div className="border-t border-gray-100 flex">
        <button
          onClick={onEdit}
          className="flex-1 py-2 text-xs text-gray-500 active:bg-gray-50"
        >
          編集
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={onDelete}
          className="flex-1 py-2 text-xs text-red-500 active:bg-red-50"
        >
          削除
        </button>
      </div>
    </div>
  )
}
