import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { LearnerProvider } from "./store/LearnerContext"
import { ThemeProvider } from "./store/ThemeContext"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {/* Multiple providers = multiple contexts. Nest them like Vue plugins. */}
        <ThemeProvider>
            <LearnerProvider>
                <App />
            </LearnerProvider>
        </ThemeProvider>
    </StrictMode>
)
