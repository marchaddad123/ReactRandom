import { create } from "zustand"

/**
 * Lean client UI state only — name/count for learning demos.
 * Report selection lives on ReportPage; report fields in React Hook Form.
 */
type LearnerState = {
    name: string
    setName: (name: string) => void
    count: number
    incrementCount: () => void
    resetCount: () => void
}

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
