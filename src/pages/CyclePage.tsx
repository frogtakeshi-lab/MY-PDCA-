import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import Layout from '../components/Layout'
import PlanTab from '../components/tabs/PlanTab'
import DoTab from '../components/tabs/DoTab'
import CheckTab from '../components/tabs/CheckTab'
import ActTab from '../components/tabs/ActTab'
import { db } from '../db/schema'
import { formatWeekLabel, getColorClasses } from '../lib/utils'

const TABS = ['Plan', 'Do', 'Check', 'Act'] as const
type Tab = typeof TABS[number]

export default function CyclePage() {
  const { id } = useParams<{ id: string }>()
  const cycleId = Number(id)
  const [activeTab, setActiveTab] = useState<Tab>('Plan')

  const cycle = useLiveQuery(() => db.cycles.get(cycleId), [cycleId])
  const genre = useLiveQuery(
    () => cycle ? db.genres.get(cycle.genreId) : undefined,
    [cycle]
  )

  if (!cycle || !genre) return null

  const colors = getColorClasses(genre.color)

  return (
    <Layout title={cycle.title} showBack>
      {/* サイクル情報バー */}
      <div className={`${colors.light} px-4 py-2 flex items-center gap-2`}>
        <span className={`w-2 h-2 rounded-full ${colors.bg}`} />
        <span className={`text-xs font-medium ${colors.text}`}>{genre.name}</span>
        <span className="text-xs text-gray-400 ml-1">{formatWeekLabel(cycle.weekStart)}</span>
        {cycle.status === 'completed' && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">完了</span>
        )}
      </div>

      {/* タブバー */}
      <div className="flex border-b border-gray-200 bg-white sticky top-[57px] z-10">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? `border-b-2 ${colors.text} border-current`
                : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="p-4">
        {activeTab === 'Plan'  && <PlanTab  cycleId={cycleId} />}
        {activeTab === 'Do'    && <DoTab    cycleId={cycleId} weekStart={cycle.weekStart} />}
        {activeTab === 'Check' && <CheckTab cycleId={cycleId} />}
        {activeTab === 'Act'   && <ActTab   cycleId={cycleId} />}
      </div>
    </Layout>
  )
}
