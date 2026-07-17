import { Activity } from "react"
import { NavLink, useLocation } from "react-router-dom"
import "./App.css"
import { Notifications } from "./components/Notifications"
import { ComparePage } from "./pages/ComparePage"
import { CounterPage } from "./pages/CounterPage"
import { FetchPage } from "./pages/FetchPage"
import { HomePage } from "./pages/HomePage"
import { NotesPage } from "./pages/NotesPage"
import { ReportPage } from "./pages/ReportPage"
import { TodosPage } from "./pages/TodosPage"

const routes = [
    { path: "/", label: "Home", element: <HomePage /> },
    { path: "/notes", label: "Notes", element: <NotesPage /> },
    { path: "/counter", label: "Counter", element: <CounterPage /> },
    { path: "/compare", label: "Compare", element: <ComparePage /> },
    { path: "/fetch", label: "Fetch", element: <FetchPage /> },
    { path: "/todos", label: "Todos", element: <TodosPage /> },
    { path: "/report", label: "Report", element: <ReportPage /> }
] as const

function App() {
    const { pathname } = useLocation()

    return (
        <>
            <Notifications />
            <main className="app">
                <h1>Learn React</h1>
                <p className="hint">
                    App state = <code>Zustand</code>. Context + Redux code is
                    kept under <code>src/store/*Context</code> and{" "}
                    <code>src/redux</code> as reference only.
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
        </>
    )
}

export default App
