import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import Layout from '../components/Layout'
import { db, type Cycle, type Genre } from '../db/schema'
import { getColorClasses, formatWeekLabel } from '../lib/utils'

type PhaseFilter = 'progress' | 'Plan' | 'Do' | 'Check' | 'Act'

export default function DashboardPage() {
  const [filter, setFilter] = useState<PhaseFilter>('progress')

  const genres = useLiveQuery(() => db.genres.toArray(), [])
  const cycles = useLiveQuery(() => db.cycles.orderBy('weekStart').reverse().toArray(), [])
  const plans = useLiveQuery(() => db.plans.toArray(), [])
  const doRecords = useLiveQuery(() => db.doRecords.toArray(), [])
  const checks = useLiveQuery(() => db.checks.toArray(), [])
  const acts = useLiveQuery(() => db.acts.toArray(), [])

  if (!genres || !cycles || !plans || !doRecords || !checks || !acts) return null

  const genreMap = Object.fromEntries(genres.map(g => [g.id, g]))
  const planMap = Object.fromEntries(plans.map(p => [p.cycleId, p]))
  const checkMap = Object.fromEntries(checks.map(c => [c.cycleId, c]))
  const actMap = Object.fromEntries(acts.map(a => [a.cycleId, a]))

  const TABS: { key: PhaseFilter; label: string }[] = [
    { key: 'progress', label: '進捗' },
    { key: 'Plan',     label: 'Plan' },
    { key: 'Do',       label: 'Do' },
    { key: 'Check',    label: 'Check' },
    { key: 'Act',      label: 'Act' },
  ]

  return (
    <Layout title="ダッシュボード">
      {/* フィルタータブ */}
      <div className="flex border-b border-gray-200 bg-white sticky top-[57px] z-10">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              filter === t.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {cycles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">サイクルがまだありません</p>
          </div>
        )}

        {filter === 'progress' && (
          <ProgressView
            cycles={cycles}
            genreMap={genreMap}
            planMap={planMap}
            doRecords={doRecords}
            checkMap={checkMap}
            actMap={actMap}
          />
        )}
        {filter === 'Plan' && (
          <PhaseView
            phase="Plan"
            cycles={cycles}
            genreMap={genreMap}
            content={cycle => planMap[cycle.id]?.goal || null}
            sub={cycle => planMap[cycle.id]?.actions.join(' / ') || null}
          />
        )}
        {filter === 'Do' && (
          <PhaseView
            phase="Do"
            cycles={cycles}
            genreMap={genreMap}
            content={cycle => {
              const done = doRecords.filter(r => r.cycleId === cycle.id && r.done).length
              const total = doRecords.filter(r => r.cycleId === cycle.id).length
              return total > 0 ? `${done}/${total} 日完了` : null
            }}
            sub={cycle => {
              const last = doRecords
                .filter(r => r.cycleId === cycle.id && r.note)
                .sort((a, b) => b.date.localeCompare(a.date))[0]
              return last?.note || null
            }}
          />
        )}
        {filter === 'Check' && (
          <PhaseView
            phase="Check"
            cycles={cycles}
            genreMap={genreMap}
            content={cycle => checkMap[cycle.id]?.achievements || null}
            sub={cycle => checkMap[cycle.id]?.issues || null}
          />
        )}
        {filter === 'Act' && (
          <PhaseView
            phase="Act"
            cycles={cycles}
            genreMap={genreMap}
            content={cycle => actMap[cycle.id]?.improvements || null}
            sub={cycle => actMap[cycle.id]?.carryOver ? '次週へ引き継ぎ ✓' : null}
          />
        )}
      </div>
    </Layout>
  )
}

// ---- 進捗ビュー ----

function ProgressView({ cycles, genreMap, planMap, doRecords, checkMap, actMap }: {
  cycles: Cycle[]
  genreMap: Record<number, Genre>
  planMap: Record<number, { goal: string; actions: string[] }>
  doRecords: { cycleId: number; done: boolean }[]
  checkMap: Record<number, { achievements: string }>
  actMap: Record<number, { improvements: string }>
}) {
  const navigate = useNavigate()
  const active = cycles.filter(c => c.status === 'active')
  const completed = cycles.filter(c => c.status === 'completed')

  return (
    <div className="flex flex-col gap-6">
      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-2">進行中</h2>
          <div className="flex flex-col gap-3">
            {active.map(cycle => (
              <ProgressCard
                key={cycle.id}
                cycle={cycle}
                genre={genreMap[cycle.genreId]}
                hasPlan={!!planMap[cycle.id]?.goal}
                doneCount={doRecords.filter(r => r.cycleId === cycle.id && r.done).length}
                totalDo={doRecords.filter(r => r.cycleId === cycle.id).length}
                hasCheck={!!checkMap[cycle.id]?.achievements}
                hasAct={!!actMap[cycle.id]?.improvements}
                onClick={() => navigate(`/cycles/${cycle.id}`)}
              />
            ))}
          </div>
        </section>
      )}
      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-2">完了済み</h2>
          <div className="flex flex-col gap-3">
            {completed.map(cycle => (
              <ProgressCard
                key={cycle.id}
                cycle={cycle}
                genre={genreMap[cycle.genreId]}
                hasPlan={!!planMap[cycle.id]?.goal}
                doneCount={doRecords.filter(r => r.cycleId === cycle.id && r.done).length}
                totalDo={doRecords.filter(r => r.cycleId === cycle.id).length}
                hasCheck={!!checkMap[cycle.id]?.achievements}
                hasAct={!!actMap[cycle.id]?.improvements}
                onClick={() => navigate(`/cycles/${cycle.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProgressCard({ cycle, genre, hasPlan, doneCount, totalDo, hasCheck, hasAct, onClick }: {
  cycle: Cycle; genre?: Genre; hasPlan: boolean
  doneCount: number; totalDo: number; hasCheck: boolean; hasAct: boolean
  onClick: () => void
}) {
  const colors = getColorClasses(genre?.color ?? 'blue')
  const doPercent = totalDo > 0 ? (doneCount / totalDo) * 100 : 0

  const phases = [
    { label: 'P', done: hasPlan },
    { label: 'D', done: totalDo > 0 },
    { label: 'C', done: hasCheck },
    { label: 'A', done: hasAct },
  ]

  return (
    <button onClick={onClick} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left active:bg-gray-50 w-full">
      <div className="flex items-start gap-3 mb-3">
        <span className={`w-3 h-3 rounded-full ${colors.bg} mt-1 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{cycle.title}</p>
          <p className="text-xs text-gray-400">{genre?.name} · {formatWeekLabel(cycle.weekStart)}</p>
        </div>
        {cycle.status === 'completed' && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">完了</span>
        )}
      </div>

      {/* Do 進捗バー */}
      {totalDo > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full ${colors.bg} transition-all`} style={{ width: `${doPercent}%` }} />
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">{doneCount}/{totalDo}日</span>
        </div>
      )}

      {/* フェーズ達成状況 */}
      <div className="flex gap-2">
        {phases.map(p => (
          <span key={p.label} className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            p.done ? `${colors.light} ${colors.text}` : 'bg-gray-100 text-gray-300'
          }`}>
            {p.label}
          </span>
        ))}
      </div>
    </button>
  )
}

// ---- フェーズ横断ビュー ----

function PhaseView({ phase, cycles, genreMap, content, sub }: {
  phase: string
  cycles: Cycle[]
  genreMap: Record<number, Genre>
  content: (cycle: Cycle) => string | null
  sub: (cycle: Cycle) => string | null
}) {
  const navigate = useNavigate()
  const filled = cycles.filter(c => content(c))
  const empty = cycles.filter(c => !content(c))

  if (cycles.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {filled.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">{phase} が記入されたサイクルはありません</p>
      )}
      {filled.map(cycle => {
        const genre = genreMap[cycle.genreId]
        const colors = getColorClasses(genre?.color ?? 'blue')
        return (
          <button
            key={cycle.id}
            onClick={() => navigate(`/cycles/${cycle.id}`)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left active:bg-gray-50 w-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${colors.bg} flex-shrink-0`} />
              <span className={`text-xs font-medium ${colors.text}`}>{genre?.name}</span>
              <span className="text-xs text-gray-400">· {formatWeekLabel(cycle.weekStart)}</span>
              {cycle.status === 'completed' && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">完了</span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1 truncate">{cycle.title}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{content(cycle)}</p>
            {sub(cycle) && (
              <p className="text-xs text-gray-400 mt-1 truncate">{sub(cycle)}</p>
            )}
          </button>
        )
      })}
      {empty.length > 0 && filled.length > 0 && (
        <p className="text-xs text-gray-300 text-center pt-2">未記入 {empty.length} 件</p>
      )}
    </div>
  )
}
