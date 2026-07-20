import { type FormEvent, useEffect, useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { PasswordField } from "../components/PasswordField"
import { cx, ui } from "../lib/ui"
import { useAuthStore } from "../store/useAuthStore"
import { useNotificationStore } from "../store/useNotificationStore"

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const from =
        (location.state as { from?: string } | null)?.from &&
        (location.state as { from: string }).from !== "/login"
            ? (location.state as { from: string }).from
            : "/"

    const user = useAuthStore((state) => state.user)
    const initialized = useAuthStore((state) => state.initialized)
    const loading = useAuthStore((state) => state.loading)
    const error = useAuthStore((state) => state.error)
    const signInEmail = useAuthStore((state) => state.signInEmail)
    const signInGoogle = useAuthStore((state) => state.signInGoogle)
    const clearError = useAuthStore((state) => state.clearError)
    const notify = useNotificationStore((state) => state.updateNotification)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    // Wipe any leftover Auth error when opening this page (e.g. came from Register).
    useEffect(() => {
        clearError()
    }, [clearError])

    // Already logged in? Do not show the form — go where they wanted (or Home).
    if (initialized && user) {
        return (
            <Navigate
                to={from}
                replace
            />
        )
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        clearError()
        try {
            await signInEmail(email.trim(), password)
            notify({ message: "Welcome back.", error: false })
            navigate(from, { replace: true })
        } catch {
            // error set in store
        }
    }

    async function handleGoogle() {
        clearError()
        try {
            await signInGoogle()
            notify({ message: "Signed in with Google.", error: false })
            navigate(from, { replace: true })
        } catch {
            // error set in store
        }
    }

    return (
        <div className="auth-screen">
            <div className="auth-panel animate-rise">
                <p className={ui.eyebrow}>Welcome back</p>
                <h1 className={ui.brand}>ReactRandom</h1>
                <p className={ui.lede}>
                    Sign in to open your home dashboard and profile.
                </p>

                <form
                    className="mt-8 space-y-4"
                    onSubmit={handleSubmit}
                >
                    <label className={ui.fieldLabel}>
                        Email
                        <input
                            className={ui.field}
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <PasswordField
                        autoComplete="current-password"
                        required
                        minLength={8}
                        maxLength={64}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error ? (
                        <p
                            className="text-danger m-0 text-sm"
                            role="alert"
                        >
                            {error}
                        </p>
                    ) : null}

                    <div className={ui.actions}>
                        <button
                            type="submit"
                            className={cx(
                                ui.btn,
                                ui.btnPrimary,
                                "w-full sm:w-auto"
                            )}
                            disabled={loading}
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </div>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="bg-line h-px flex-1" />
                    <span className="text-muted text-xs font-medium tracking-wide uppercase">
                        or
                    </span>
                    <div className="bg-line h-px flex-1" />
                </div>

                <button
                    type="button"
                    className={cx(ui.btn, ui.btnGoogle, "w-full")}
                    onClick={handleGoogle}
                    disabled={loading}
                >
                    Continue with Google
                </button>

                <p className="text-muted mt-6 mb-0 text-sm">
                    No account yet?{" "}
                    <Link
                        to="/register"
                        className="text-primary font-medium no-underline hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
