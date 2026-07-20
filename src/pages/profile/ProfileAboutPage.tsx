import { type FormEvent, useState } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { cx, ui } from "../../lib/ui"
import { useAuthStore } from "../../store/useAuthStore"
import { useNotificationStore } from "../../store/useNotificationStore"
import { formatDate, type ProfileOutletContext } from "./profileHelpers"

/** /:username — basics + edit (own profile only). */
export function ProfileAboutPage() {
    const { profile, isOwn } = useOutletContext<ProfileOutletContext>()
    const loading = useAuthStore((state) => state.loading)
    const updateDisplayName = useAuthStore((state) => state.updateDisplayName)
    const signOut = useAuthStore((state) => state.signOut)
    const notify = useNotificationStore((state) => state.updateNotification)

    const remoteName = profile.displayName ?? ""
    const [draftName, setDraftName] = useState<string | null>(null)
    const displayName = draftName ?? remoteName

    async function handleSave(event: FormEvent) {
        event.preventDefault()
        const next = displayName.trim()
        if (!next) {
            notify({ message: "Display name cannot be empty.", error: true })
            return
        }
        try {
            await updateDisplayName(next)
            setDraftName(null)
            notify({ message: "Profile updated.", error: false })
        } catch {
            notify({ message: "Could not update profile.", error: true })
        }
    }

    async function handleSignOut() {
        try {
            await signOut()
            notify({ message: "Signed out.", error: false })
        } catch {
            notify({ message: "Could not sign out.", error: true })
        }
    }

    return (
        <div className={ui.stack}>
            <section className={ui.panel}>
                <h3 className={ui.title}>Basics</h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className={ui.eyebrow}>Username</dt>
                        <dd className={ui.value}>@{profile.username}</dd>
                    </div>
                    <div>
                        <dt className={ui.eyebrow}>Provider</dt>
                        <dd className={cx(ui.value, "capitalize")}>
                            {profile.provider}
                        </dd>
                    </div>
                    <div>
                        <dt className={ui.eyebrow}>Member since</dt>
                        <dd className={ui.value}>
                            {formatDate(profile.createdAt)}
                        </dd>
                    </div>
                    <div>
                        <dt className={ui.eyebrow}>Last login</dt>
                        <dd className={ui.value}>
                            {formatDate(profile.lastLoginAt)}
                        </dd>
                    </div>
                    {isOwn ? (
                        <div className="sm:col-span-2">
                            <dt className={ui.eyebrow}>User ID</dt>
                            <dd className={cx(ui.value, "font-mono break-all")}>
                                {profile.uid}
                            </dd>
                        </div>
                    ) : null}
                </dl>
            </section>

            {isOwn ? (
                <section className={ui.panel}>
                    <h3 className={ui.title}>Edit display name</h3>
                    <p className={ui.hint}>
                        Your URL stays{" "}
                        <span className="text-ink">/{profile.username}</span> —
                        only the display name changes.
                    </p>
                    <form
                        className="mt-4 max-w-md space-y-4"
                        onSubmit={handleSave}
                    >
                        <label className={ui.fieldLabel}>
                            Display name
                            <input
                                className={ui.field}
                                value={displayName}
                                onChange={(e) => setDraftName(e.target.value)}
                                required
                            />
                        </label>
                        <div className={ui.actions}>
                            <button
                                type="submit"
                                className={cx(ui.btn, ui.btnPrimary)}
                                disabled={loading}
                            >
                                {loading ? "Saving…" : "Save changes"}
                            </button>
                            <button
                                type="button"
                                className={cx(ui.btn, ui.btnDanger)}
                                onClick={handleSignOut}
                            >
                                Sign out
                            </button>
                        </div>
                    </form>
                </section>
            ) : (
                <div className={ui.actions}>
                    <Link
                        to="/"
                        className={cx(ui.btn, ui.btnSecondary, "no-underline")}
                    >
                        Back to Home
                    </Link>
                </div>
            )}
        </div>
    )
}
