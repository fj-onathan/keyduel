import {create} from 'zustand'

export type Toast = {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  durationMs: number
}

type ToastStore = {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type'], durationMs?: number) => void
  removeToast: (id: string) => void
}

let nextId = 0

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', durationMs = 3000) => {
    const id = `toast-${++nextId}`
    const toast: Toast = {id, message, type, durationMs}
    set((state) => ({toasts: [...state.toasts, toast]}))
    if (durationMs > 0) {
      window.setTimeout(() => {
        set((state) => ({toasts: state.toasts.filter((t) => t.id !== id)}))
      }, durationMs)
    }
  },
  removeToast: (id) => {
    set((state) => ({toasts: state.toasts.filter((t) => t.id !== id)}))
  },
}))
