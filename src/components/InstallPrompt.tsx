import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-3">
      <img src="/icons/icon-192.png" alt="" className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">ホーム画面に追加</p>
        <p className="text-xs text-gray-400 mt-0.5">オフラインでも使えます</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => setShow(false)}
          className="px-3 py-1.5 text-xs text-gray-400 rounded-lg active:bg-gray-100"
        >
          後で
        </button>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg active:bg-blue-700"
        >
          追加
        </button>
      </div>
    </div>
  )
}
