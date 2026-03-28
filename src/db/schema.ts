import Dexie, { type EntityTable } from 'dexie'

// ジャンル（例: 仕事, 学習, 習慣）
export interface Genre {
  id: number
  name: string
  color: string   // Tailwind カラー名 (e.g. "blue", "green")
  createdAt: Date
}

// PDCAサイクル（週単位）
export interface Cycle {
  id: number
  genreId: number
  title: string
  weekStart: string   // ISO date string (月曜日の日付, e.g. "2026-03-23")
  status: 'active' | 'completed'
  memo: string        // サイクル総合メモ
  createdAt: Date
}

// Plan: 目標・アクション計画
export interface Plan {
  id: number
  cycleId: number
  goal: string        // 週の目標
  actions: string[]   // 具体的なアクション一覧
  updatedAt: Date
}

// Do: 日次進捗記録
export interface DoRecord {
  id: number
  cycleId: number
  date: string        // ISO date string (e.g. "2026-03-24")
  note: string
  done: boolean
}

// Check: 週末の振り返り
export interface Check {
  id: number
  cycleId: number
  achievements: string  // できたこと
  issues: string        // できなかったこと・課題
  updatedAt: Date
}

// Act: 次サイクルへの改善アクション
export interface Act {
  id: number
  cycleId: number
  improvements: string  // 改善アクション
  carryOver: boolean    // 次サイクルへ引き継ぐか
  updatedAt: Date
}

class PdcaDatabase extends Dexie {
  genres!: EntityTable<Genre, 'id'>
  cycles!: EntityTable<Cycle, 'id'>
  plans!: EntityTable<Plan, 'id'>
  doRecords!: EntityTable<DoRecord, 'id'>
  checks!: EntityTable<Check, 'id'>
  acts!: EntityTable<Act, 'id'>

  constructor() {
    super('pdca-db')
    this.version(1).stores({
      genres:    '++id, name, createdAt',
      cycles:    '++id, genreId, weekStart, status, createdAt',
      plans:     '++id, cycleId, updatedAt',
      doRecords: '++id, cycleId, date',
      checks:    '++id, cycleId, updatedAt',
      acts:      '++id, cycleId, updatedAt',
    })
    // v2: Cycle に memo フィールド追加
    this.version(2).stores({
      genres:    '++id, name, createdAt',
      cycles:    '++id, genreId, weekStart, status, createdAt',
      plans:     '++id, cycleId, updatedAt',
      doRecords: '++id, cycleId, date',
      checks:    '++id, cycleId, updatedAt',
      acts:      '++id, cycleId, updatedAt',
    }).upgrade(tx => {
      return tx.table('cycles').toCollection().modify(cycle => {
        if (cycle.memo === undefined) cycle.memo = ''
      })
    })
  }
}

export const db = new PdcaDatabase()
