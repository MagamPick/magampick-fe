import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocationState {
  shareLocation: boolean
  setShareLocation: (v: boolean) => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      shareLocation: true,
      setShareLocation: (v) => set({ shareLocation: v }),
    }),
    { name: 'magampick-location' },
  ),
)
