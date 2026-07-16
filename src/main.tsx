import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./index.css"
import { queryClient } from "./lib/queryClient"
import { LearnerProvider } from "./store/LearnerContext"
import { NotificationProvider } from "./store/NotificationContext"
import { ThemeProvider } from "./store/ThemeContext"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <LearnerProvider>
                        <NotificationProvider>
                            <App />
                        </NotificationProvider>
                    </LearnerProvider>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
)
