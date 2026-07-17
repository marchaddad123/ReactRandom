import { create } from "zustand"

type LearnerState = {
    name: string
    setName: (name: string) => void
    count: number
    incrementCount: () => void
    resetCount: () => void
}

// Same shape as LearnerContext, but Zustand (like Pinia).
export const useLearnerStore = create<LearnerState>((set) => ({
    name: "Mark",
    setName: (name) => set({ name }),
    count: 0,
    incrementCount: () =>
        set((state) => ({
            count: state.count + 1
        })),
    resetCount: () => set({ count: 0 })
}))
