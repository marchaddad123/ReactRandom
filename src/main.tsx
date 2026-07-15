import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./index.css"
import { LearnerProvider } from "./store/LearnerContext"
import { ThemeProvider } from "./store/ThemeContext"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            {/* Multiple providers = multiple contexts. Nest them like Vue plugins. */}
            <ThemeProvider>
                <LearnerProvider>
                    <App />
                </LearnerProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>
)
