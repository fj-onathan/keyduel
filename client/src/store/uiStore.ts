import {create} from 'zustand'

type UIState = {
  reducedEffects: boolean
  soundEnabled: boolean
  isAuthModalOpen: boolean
  toggleReducedEffects: () => void
  toggleSound: () => void
  openAuthModal: () => void
  closeAuthModal: () => void
}

const savedSound = typeof window !== 'undefined' ? localStorage.getItem('keyduel_sound') === '1' : false

export const useUIStore = create<UIState>((set) => ({
  reducedEffects: false,
  soundEnabled: savedSound,
  isAuthModalOpen: false,
  toggleReducedEffects: () =>
    set((state) => ({
      reducedEffects: !state.reducedEffects,
    })),
  toggleSound: () =>
    set((state) => {
      const next = !state.soundEnabled
      localStorage.setItem('keyduel_sound', next ? '1' : '0')
      return {soundEnabled: next}
    }),
  openAuthModal: () => set({isAuthModalOpen: true}),
  closeAuthModal: () => set({isAuthModalOpen: false}),
}))
