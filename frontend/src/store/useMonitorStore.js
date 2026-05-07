import { create } from 'zustand'

const MAX_TOASTS = 4

export const useMonitorStore = create((set) => ({
  wsConnected: false,
  selectedRange: '1h',
  toasts: [],

  setWsConnected: (value) => set({ wsConnected: Boolean(value) }),

  setSelectedRange: (range) => set({ selectedRange: range }),

  pushToast: (toast) =>
    set((state) => {
      const next = [
        ...state.toasts,
        { id: toast.id || crypto.randomUUID(), createdAt: Date.now(), ...toast },
      ]
      return { toasts: next.slice(-MAX_TOASTS) }
    }),

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}))
