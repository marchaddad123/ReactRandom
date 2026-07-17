import { Activity } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Notifications } from "./components/Notifications"
import { cx, ui } from "./lib/ui"
import { ComparePage } from "./pages/ComparePage"
import { CounterPage } from "./pages/CounterPage"
import { FetchPage } from "./pages/FetchPage"
import { HomePage } from "./pages/HomePage"
import { NotesPage } from "./pages/NotesPage"
import { OverlaysPage } from "./pages/OverlaysPage"
import { ReportPage } from "./pages/ReportPage"
import { TodosPage } from "./pages/TodosPage"

const routes = [
    { path: "/", label: "Home", element: <HomePage /> },
    { path: "/notes", label: "Notes", element: <NotesPage /> },
    { path: "/counter", label: "Counter", element: <CounterPage /> },
    { path: "/compare", label: "Compare", element: <ComparePage /> },
    { path: "/fetch", label: "Fetch", element: <FetchPage /> },
    { path: "/todos", label: "Todos", element: <TodosPage /> },
    { path: "/report", label: "Users", element: <ReportPage /> },
    { path: "/overlays", label: "Overlays", element: <OverlaysPage /> }
] as const

function App() {
    const { pathname } = useLocation()

    return (
        <>
            <Notifications />
            <div className={ui.shell}>
                <header className="animate-nav mb-7">
                    <p className={ui.eyebrow}>Workshop</p>
                    <h1 className={ui.brand}>Learn React</h1>
                    <p className={ui.lede}>
                        App state = <code>Zustand</code>. Server lists ={" "}
                        <code>TanStack Query</code>. Context + Redux stay under{" "}
                        <code>src/store/*Context</code> and{" "}
                        <code>src/redux</code> as reference only.
                    </p>
                </header>

                <nav
                    className="animate-nav mb-6 flex flex-wrap gap-1.5"
                    style={{ animationDelay: "60ms" }}
                    aria-label="Primary"
                >
                    {routes.map((route) => (
                        <NavLink
                            key={route.path}
                            to={route.path}
                            end={route.path === "/"}
                            className={({ isActive }) =>
                                cx(
                                    ui.navLink,
                                    isActive
                                        ? ui.navLinkActive
                                        : ui.navLinkInactive
                                )
                            }
                        >
                            {route.label}
                        </NavLink>
                    ))}
                </nav>

                <main>
                    {routes.map((route) => (
                        <Activity
                            key={route.path}
                            mode={
                                pathname === route.path ? "visible" : "hidden"
                            }
                        >
                            {route.element}
                        </Activity>
                    ))}
                </main>
            </div>
        </>
    )
}

export default App
