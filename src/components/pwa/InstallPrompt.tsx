'use client'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'ap-install-dismissed'
const DISMISS_DAYS = 14

function recentlyDismissed(): boolean {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0)
    return ts > 0 && Date.now() - ts < DISMISS_DAYS * 864e5
  } catch {
    return false
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iDevice = /iphone|ipad|ipod/i.test(ua)
  const iPadOS = navigator.platform === 'MacIntel' && (navigator as unknown as { maxTouchPoints: number }).maxTouchPoints > 1
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
  return (iDevice || iPadOS) && isSafari
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setOpen(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)

    const onInstalled = () => setOpen(false)
    window.addEventListener('appinstalled', onInstalled)

    // iOS não dispara beforeinstallprompt — mostramos uma dica
    if (isIos()) {
      setIosHint(true)
      setOpen(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    setOpen(false)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-start gap-3">
        <img src="/logos/icon-mark.png" alt="" className="w-10 h-10 object-contain shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Instale o Aprenda Política</p>
          {iosHint ? (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Toque em <span className="font-semibold">Compartilhar</span> e depois em{' '}
              <span className="font-semibold">“Adicionar à Tela de Início”</span>.
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Acesso rápido, em tela cheia e disponível mesmo offline.
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {!iosHint && (
              <button
                onClick={install}
                className="px-3.5 py-1.5 rounded-lg bg-[#00A859] text-white text-xs font-semibold hover:bg-[#007A30] transition-colors"
              >
                Instalar
              </button>
            )}
            <button
              onClick={dismiss}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Fechar" className="text-gray-300 hover:text-gray-500 shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
