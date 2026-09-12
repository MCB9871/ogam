type TelegramWebApp = {
  initData: string
  ready: () => void
  expand?: () => void
  openInvoice: (url: string, callback: (status: string) => void) => void
  HapticFeedback?: { notificationOccurred?: (type: string) => void }
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export function getInitData(): string {
  return getTelegramWebApp()?.initData ?? ''
}
