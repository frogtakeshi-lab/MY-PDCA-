import { db } from '../db/schema'

// ---- JSON エクスポート ----

export async function exportJson(): Promise<void> {
  const [genres, cycles, plans, doRecords, checks, acts] = await Promise.all([
    db.genres.toArray(),
    db.cycles.toArray(),
    db.plans.toArray(),
    db.doRecords.toArray(),
    db.checks.toArray(),
    db.acts.toArray(),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    data: { genres, cycles, plans, doRecords, checks, acts },
  }

  downloadFile(
    JSON.stringify(payload, null, 2),
    `pdca-backup-${dateStamp()}.json`,
    'application/json'
  )
}

// ---- CSV エクスポート ----

export async function exportCsv(): Promise<void> {
  const [genres, cycles, plans, checks, acts, doRecords] = await Promise.all([
    db.genres.toArray(),
    db.cycles.toArray(),
    db.plans.toArray(),
    db.checks.toArray(),
    db.acts.toArray(),
    db.doRecords.toArray(),
  ])

  const genreMap = Object.fromEntries(genres.map(g => [g.id, g.name]))
  const planMap = Object.fromEntries(plans.map(p => [p.cycleId, p]))
  const checkMap = Object.fromEntries(checks.map(c => [c.cycleId, c]))
  const actMap = Object.fromEntries(acts.map(a => [a.cycleId, a]))

  const header = [
    'ジャンル', 'サイクルタイトル', '開始週', 'ステータス',
    '目標', 'アクション',
    'できたこと', '課題',
    '改善アクション', '次週引き継ぎ',
    '完了日数',
  ]

  const rows = cycles.map(cycle => {
    const plan = planMap[cycle.id]
    const check = checkMap[cycle.id]
    const act = actMap[cycle.id]
    const doneCount = doRecords.filter(r => r.cycleId === cycle.id && r.done).length

    return [
      genreMap[cycle.genreId] ?? '',
      cycle.title,
      cycle.weekStart,
      cycle.status === 'completed' ? '完了' : '進行中',
      plan?.goal ?? '',
      plan?.actions.join(' / ') ?? '',
      check?.achievements ?? '',
      check?.issues ?? '',
      act?.improvements ?? '',
      act?.carryOver ? 'はい' : 'いいえ',
      String(doneCount),
    ]
  })

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  // BOM付きUTF-8でExcelでも文字化けしない
  downloadFile(
    '\uFEFF' + csv,
    `pdca-export-${dateStamp()}.csv`,
    'text/csv;charset=utf-8'
  )
}

// ---- JSON インポート ----

export async function importJson(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text()
    const payload = JSON.parse(text)

    if (!payload.data || !payload.version) {
      return { success: false, message: '無効なバックアップファイルです。' }
    }

    const { genres, cycles, plans, doRecords, checks, acts } = payload.data

    // 既存データを全削除してから復元
    await db.transaction('rw', [db.genres, db.cycles, db.plans, db.doRecords, db.checks, db.acts], async () => {
      await Promise.all([
        db.genres.clear(),
        db.cycles.clear(),
        db.plans.clear(),
        db.doRecords.clear(),
        db.checks.clear(),
        db.acts.clear(),
      ])
      await Promise.all([
        genres?.length    && db.genres.bulkAdd(genres),
        cycles?.length    && db.cycles.bulkAdd(cycles),
        plans?.length     && db.plans.bulkAdd(plans),
        doRecords?.length && db.doRecords.bulkAdd(doRecords),
        checks?.length    && db.checks.bulkAdd(checks),
        acts?.length      && db.acts.bulkAdd(acts),
      ])
    })

    return { success: true, message: 'インポートが完了しました。' }
  } catch {
    return { success: false, message: 'ファイルの読み込みに失敗しました。' }
  }
}

// ---- ヘルパー ----

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
