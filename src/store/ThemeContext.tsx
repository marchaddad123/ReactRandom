import {
    createContext,
    type ReactNode,
    useContext,
    useMemo,
    useState
} from "react"

type Theme = "sky" | "emerald"

type ThemeContextValue = {
    theme: Theme
    toggleTheme: () => void
}

// A second context on purpose — you can have many contexts, not just one.
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("sky")

    const value = useMemo(
        () => ({
            theme,
            toggleTheme: () => {
                setTheme((currentTheme) =>
                    currentTheme === "sky" ? "emerald" : "sky"
                )
            }
        }),
        [theme]
    )

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider")
    }

    return context
}
