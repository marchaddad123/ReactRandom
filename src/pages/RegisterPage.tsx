import { type FormEvent, useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { PasswordField } from "../components/PasswordField"
import {
    getPasswordRuleResults,
    isPasswordValid,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    validatePassword
} from "../lib/password"
import { cx, ui } from "../lib/ui"
import { useAuthStore } from "../store/useAuthStore"
import { useNotificationStore } from "../store/useNotificationStore"

export function RegisterPage() {
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)
    const initialized = useAuthStore((state) => state.initialized)
    const loading = useAuthStore((state) => state.loading)
    const error = useAuthStore((state) => state.error)
    const signUpEmail = useAuthStore((state) => state.signUpEmail)
    const signInGoogle = useAuthStore((state) => state.signInGoogle)
    const clearError = useAuthStore((state) => state.clearError)
    const notify = useNotificationStore((state) => state.updateNotification)

    const [displayName, setDisplayName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState<string | null>(null)

    const passwordRules = getPasswordRuleResults(password)
    const showPasswordHints = password.length > 0

    // Wipe any leftover Auth error when opening this page (e.g. came from Login).
    useEffect(() => {
        clearError()
    }, [clearError])

    // Already logged in? Skip register and go Home.
    if (initialized && user) {
        return (
            <Navigate
                to="/"
                replace
            />
        )
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        clearError()

        const passwordMessage = validatePassword(password)
        if (passwordMessage) {
            setPasswordError(passwordMessage)
            return
        }

        setPasswordError(null)
        try {
            await signUpEmail(email.trim(), password, displayName.trim())
            notify({ message: "Account created.", error: false })
            navigate("/", { replace: true })
        } catch {
            // error set in store
        }
    }

    async function handleGoogle() {
        clearError()
        setPasswordError(null)
        try {
            await signInGoogle()
            notify({ message: "Signed in with Google.", error: false })
            navigate("/", { replace: true })
        } catch {
            // error set in store
        }
    }

    return (
        <div className="auth-screen">
            <div className="auth-panel animate-rise">
                <p className={ui.eyebrow}>Get started</p>
                <h1 className={ui.brand}>ReactRandom</h1>
                <p className={ui.lede}>
                    Create an account with email or continue with Google.
                </p>

                <form
                    className="mt-8 space-y-4"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <label className={ui.fieldLabel}>
                        Display name
                        <input
                            className={ui.field}
                            type="text"
                            autoComplete="name"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </label>

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
                        autoComplete="new-password"
                        required
                        minLength={PASSWORD_MIN_LENGTH}
                        maxLength={PASSWORD_MAX_LENGTH}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setPasswordError(null)
                        }}
                        aria-describedby="password-requirements"
                    />

                    <ul
                        id="password-requirements"
                        className="m-0 list-none space-y-1 p-0"
                    >
                        {passwordRules.map((rule) => {
                            const tone = !showPasswordHints
                                ? "text-muted"
                                : rule.passed
                                  ? "text-success"
                                  : "text-danger"

                            return (
                                <li
                                    key={rule.id}
                                    className={cx("text-xs font-medium", tone)}
                                >
                                    {showPasswordHints
                                        ? rule.passed
                                            ? "✓"
                                            : "✗"
                                        : "•"}{" "}
                                    {rule.label}
                                </li>
                            )
                        })}
                    </ul>

                    {passwordError ? (
                        <p
                            className="text-danger m-0 text-sm"
                            role="alert"
                        >
                            {passwordError}
                        </p>
                    ) : null}

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
                            disabled={
                                loading ||
                                (password.length > 0 &&
                                    !isPasswordValid(password))
                            }
                        >
                            {loading ? "Creating…" : "Create account"}
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
                    Already registered?{" "}
                    <Link
                        to="/login"
                        className="text-primary font-medium no-underline hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
