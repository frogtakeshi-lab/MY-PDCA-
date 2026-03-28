import { useRef, useState } from 'react'
import Layout from '../components/Layout'
import { exportJson, exportCsv, importJson } from '../lib/exportImport'

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function showMessage(text: string, ok: boolean) {
    setMessage({ text, ok })
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('現在のデータはすべて上書きされます。よろしいですか？')) {
      e.target.value = ''
      return
    }

    setImporting(true)
    const result = await importJson(file)
    setImporting(false)
    e.target.value = ''
    showMessage(result.message, result.success)
  }

  return (
    <Layout title="設定">
      <div className="p-4 flex flex-col gap-6">

        {/* メッセージトースト */}
        {message && (
          <div className={`fixed top-16 left-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            message.ok ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {/* エクスポートセクション */}
        <section>
          <h2 className="text-base font-bold text-gray-700 mb-3">エクスポート</h2>
          <div className="flex flex-col gap-3">

            <ExportCard
              title="JSON バックアップ"
              description="全データを JSON ファイルで保存。インポートで復元できます。"
              icon="💾"
              onClick={exportJson}
            />

            <ExportCard
              title="CSV エクスポート"
              description="サイクルのサマリーを CSV で出力。Excel などで確認できます。"
              icon="📊"
              onClick={exportCsv}
            />

          </div>
        </section>

        {/* インポートセクション */}
        <section>
          <h2 className="text-base font-bold text-gray-700 mb-3">インポート</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">📂</span>
              <div>
                <p className="font-medium text-gray-900 text-sm">JSON からリストア</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  バックアップした JSON ファイルを選択してください。
                  現在のデータは上書きされます。
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 active:bg-gray-50 disabled:opacity-50"
            >
              {importing ? 'インポート中...' : 'ファイルを選択'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </section>

        {/* アプリ情報 */}
        <section className="mt-4">
          <h2 className="text-base font-bold text-gray-700 mb-3">アプリについて</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            <InfoRow label="バージョン" value="0.1.0" />
            <InfoRow label="データ保存先" value="ブラウザ（IndexedDB）" />
          </div>
        </section>

      </div>
    </Layout>
  )
}

function ExportCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string
  description: string
  icon: string
  onClick: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    await onClick()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 text-left active:bg-gray-50 disabled:opacity-50 w-full"
    >
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      {loading ? (
        <svg className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}
