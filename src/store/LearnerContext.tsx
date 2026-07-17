import {
    createContext,
    type ReactNode,
    useContext,
    useMemo,
    useState
} from "react"

/**
 * LEGACY / REFERENCE — app now uses Zustand (`useLearnerStore.ts`).
 * Kept so you can compare Context vs Zustand side by side.
 */

type LearnerContextValue = {
    name: string
    setName: (name: string) => void
    count: number
    incrementCount: () => void
    resetCount: () => void
}

// Similar to a Pinia store shape, but delivered with React Context.
const LearnerContext = createContext<LearnerContextValue | null>(null)

export function LearnerProvider({ children }: { children: ReactNode }) {
    const [name, setName] = useState("Mark")
    const [count, setCount] = useState(0)

    const value = useMemo(
        () => ({
            name,
            setName,
            count,
            incrementCount: () => {
                setCount((currentCount) => currentCount + 1)
            },
            resetCount: () => {
                setCount(0)
            }
        }),
        [name, count]
    )

    return (
        <LearnerContext.Provider value={value}>
            {children}
        </LearnerContext.Provider>
    )
}

export function useLearner() {
    const context = useContext(LearnerContext)

    if (!context) {
        throw new Error("useLearner must be used inside LearnerProvider")
    }

    return context
}
