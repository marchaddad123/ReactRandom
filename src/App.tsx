import { Activity } from "react"
import { NavLink, useLocation } from "react-router-dom"
import "./App.css"
import { ComparePage } from "./pages/ComparePage"
import { CounterPage } from "./pages/CounterPage"
import { FetchPage } from "./pages/FetchPage"
import { HomePage } from "./pages/HomePage"
import { NotesPage } from "./pages/NotesPage"

const routes = [
    { path: "/", label: "Home", element: <HomePage /> },
    { path: "/notes", label: "Notes", element: <NotesPage /> },
    { path: "/counter", label: "Counter", element: <CounterPage /> },
    { path: "/compare", label: "Compare", element: <ComparePage /> },
    { path: "/fetch", label: "Fetch", element: <FetchPage /> }
] as const

function App() {
    const { pathname } = useLocation()

    return (
        <main className="app">
            <h1>Learn React</h1>
            <p className="hint">
                Pages stay mounted via <code>&lt;Activity&gt;</code> — similar
                to Vue <code>&lt;KeepAlive&gt;</code>. Switch tabs, keep local
                state.
            </p>

            <nav className="mb-4 flex flex-wrap gap-2">
                {routes.map((route) => (
                    <NavLink
                        key={route.path}
                        to={route.path}
                        end={route.path === "/"}
                        className={({ isActive }) =>
                            [
                                "rounded-lg px-3 py-2 text-sm font-semibold no-underline",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-200 text-slate-900"
                            ].join(" ")
                        }
                    >
                        {route.label}
                    </NavLink>
                ))}
            </nav>

            {routes.map((route) => (
                <Activity
                    key={route.path}
                    mode={pathname === route.path ? "visible" : "hidden"}
                >
                    {route.element}
                </Activity>
            ))}
        </main>
    )
}

export default App
