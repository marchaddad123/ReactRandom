import { create } from "zustand"

type Theme = "sky" | "emerald"

type ThemeState = {
    theme: Theme
    toggleTheme: () => void
}

// Pinia-like store. No Provider needed — just import and use.
export const useThemeStore = create<ThemeState>((set) => ({
    theme: "sky",
    toggleTheme: () =>
        set((state) => ({
            theme: state.theme === "sky" ? "emerald" : "sky"
        }))
}))
