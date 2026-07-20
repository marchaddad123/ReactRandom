import { type FormEvent, useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { EmojiTextarea } from "../../components/EmojiTextarea"
import { PostLikeButton } from "../../components/PostLikeButton"
import { createPost, listPostsForUser } from "../../lib/posts"
import { cx, ui } from "../../lib/ui"
import { useAuthStore } from "../../store/useAuthStore"
import { useNotificationStore } from "../../store/useNotificationStore"
import { POST_MAX_LENGTH, type Post } from "../../types/post"
import { formatDate, type ProfileOutletContext } from "./profileHelpers"

/** /:username/posts — list posts; compose form if this is your profile. */
export function ProfilePostsPage() {
    const { profile, isOwn } = useOutletContext<ProfileOutletContext>()
    const viewerUid = useAuthStore((state) => state.user?.uid ?? null)
    const notify = useNotificationStore((state) => state.updateNotification)

    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [body, setBody] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            const list = await listPostsForUser(profile.uid, viewerUid)
            if (!cancelled) {
                setPosts(list)
                setLoading(false)
            }
        }

        void load()
        return () => {
            cancelled = true
        }
    }, [profile.uid, viewerUid])

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        const trimmed = body.trim()
        if (!trimmed) {
            notify({ message: "Write something first.", error: true })
            return
        }

        setSaving(true)
        try {
            const post = await createPost({
                authorUid: profile.uid,
                authorUsername: profile.username,
                body: trimmed
            })
            setPosts((current) => [post, ...current])
            setBody("")
            notify({ message: "Post published.", error: false })
        } catch (err) {
            notify({
                message:
                    err instanceof Error
                        ? err.message
                        : "Could not publish post.",
                error: true
            })
        } finally {
            setSaving(false)
        }
    }

    function updatePostLikes(
        postId: string,
        next: Pick<Post, "likeCount" | "likedByMe">
    ) {
        setPosts((current) =>
            current.map((post) =>
                post.id === postId ? { ...post, ...next } : post
            )
        )
    }

    return (
        <div className="space-y-6">
            {isOwn ? (
                <section className={ui.panel}>
                    <p className={ui.eyebrow}>New post</p>
                    <h3 className={ui.title}>Share an update</h3>
                    <form
                        className="mt-4 space-y-3"
                        onSubmit={handleSubmit}
                    >
                        <label className={ui.fieldLabel}>
                            What’s on your mind?
                            <div className="mt-1.5">
                                <EmojiTextarea
                                    value={body}
                                    onChange={setBody}
                                    maxLength={POST_MAX_LENGTH}
                                    placeholder="Write a short post… use the smile button for emoji"
                                    required
                                    className="mt-0"
                                />
                            </div>
                        </label>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-muted m-0 text-xs">
                                {body.length}/{POST_MAX_LENGTH}
                            </p>
                            <button
                                type="submit"
                                className={cx(ui.btn, ui.btnPrimary)}
                                disabled={saving || !body.trim()}
                            >
                                {saving ? "Posting…" : "Post"}
                            </button>
                        </div>
                    </form>
                </section>
            ) : null}

            <section className={ui.panel}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <p className={ui.eyebrow}>Feed</p>
                        <h3 className={ui.title}>Posts</h3>
                    </div>
                    {!loading ? (
                        <p className="text-muted m-0 text-sm">
                            {posts.length}{" "}
                            {posts.length === 1 ? "post" : "posts"}
                        </p>
                    ) : null}
                </div>

                {loading ? (
                    <p className="text-muted m-0 text-sm">Loading posts…</p>
                ) : null}

                {!loading && posts.length === 0 ? (
                    <p className="text-muted m-0 text-sm">Nothing to show.</p>
                ) : null}

                {!loading && posts.length > 0 ? (
                    <ul className="m-0 list-none space-y-3 p-0">
                        {posts.map((post) => (
                            <li
                                key={post.id}
                                className="border-line rounded-xl border px-4 py-3"
                            >
                                <p className="text-ink m-0 whitespace-pre-wrap">
                                    {post.body}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-muted m-0 text-xs">
                                        {formatDate(post.createdAt)}
                                    </p>
                                    {viewerUid ? (
                                        <PostLikeButton
                                            post={post}
                                            likerUid={viewerUid}
                                            onChange={(next) =>
                                                updatePostLikes(post.id, next)
                                            }
                                        />
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </section>
        </div>
    )
}
