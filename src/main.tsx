import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./index.css"
import { queryClient } from "./lib/queryClient"
import { LearnerProvider } from "./store/LearnerContext"
import { ThemeProvider } from "./store/ThemeContext"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {/* Multiple providers = multiple contexts. Nest them like Vue plugins. */}
                <ThemeProvider>
                    <LearnerProvider>
                        <App />
                    </LearnerProvider>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
)
