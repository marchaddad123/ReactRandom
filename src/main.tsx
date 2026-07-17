import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./index.css"
import { queryClient } from "./lib/queryClient"
import { reduxStore } from "./redux/store"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {/* Redux needs Provider. Zustand (main app stores) does not. */}
        <Provider store={reduxStore}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </QueryClientProvider>
        </Provider>
    </StrictMode>
)
