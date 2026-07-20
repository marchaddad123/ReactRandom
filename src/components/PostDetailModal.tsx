import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline"
import { useEffect, useState, type FormEvent } from "react"
import {
    buildCommentTree,
    collectSubtreeIds,
    createComment,
    deleteComment,
    listComments
} from "../lib/comments"
import { formatDate } from "../lib/format"
import { cx, ui } from "../lib/ui"
import { useAuthStore } from "../store/useAuthStore"
import { useNotificationStore } from "../store/useNotificationStore"
import { COMMENT_MAX_LENGTH, type Comment } from "../types/comment"
import type { Post } from "../types/post"
import { CommentThread } from "./CommentThread"
import { EmojiTextarea } from "./EmojiTextarea"
import { PostLikeButton } from "./PostLikeButton"
import { Modal } from "./ui/Modal"

type PostPatch = Partial<Pick<Post, "likeCount" | "likedByMe" | "commentCount">>

type PostDetailModalProps = {
    post: Post
    onClose: () => void
    onPostChange: (next: PostPatch) => void
}

/** Post + threaded comments inside the shared Modal shell. */
export function PostDetailModal({
    post,
    onClose,
    onPostChange
}: PostDetailModalProps) {
    const viewer = useAuthStore((state) => state.user)
    const profile = useAuthStore((state) => state.profile)
    const notify = useNotificationStore((state) => state.updateNotification)

    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [body, setBody] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let cancelled = false
        async function load() {
            const list = await listComments(
                post.authorUid,
                post.id,
                viewer?.uid ?? null
            )
            if (!cancelled) {
                setComments(list)
                setLoading(false)
                onPostChange({ commentCount: list.length })
            }
        }
        void load()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per mount/post
    }, [post.id, post.authorUid, viewer?.uid])

    function handleVoteChange(
        commentId: string,
        next: Pick<Comment, "score" | "myVote">
    ) {
        setComments((current) =>
            current.map((c) => (c.id === commentId ? { ...c, ...next } : c))
        )
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (!viewer || !profile) return
        const trimmed = body.trim()
        if (!trimmed) {
            notify({ message: "Write a comment first.", error: true })
            return
        }

        setSaving(true)
        try {
            const comment = await createComment({
                postAuthorUid: post.authorUid,
                postId: post.id,
                authorUid: viewer.uid,
                authorUsername: profile.username,
                body: trimmed,
                parentId: null
            })
            setComments((current) => {
                const next = [...current, comment]
                onPostChange({ commentCount: next.length })
                return next
            })
            setBody("")
        } catch (err) {
            notify({
                message:
                    err instanceof Error
                        ? err.message
                        : "Could not post comment.",
                error: true
            })
        } finally {
            setSaving(false)
        }
    }

    async function handleReply(parentId: string, replyBody: string) {
        if (!viewer || !profile) return
        const comment = await createComment({
            postAuthorUid: post.authorUid,
            postId: post.id,
            authorUid: viewer.uid,
            authorUsername: profile.username,
            body: replyBody,
            parentId
        })
        setComments((current) => {
            const next = [...current, comment]
            onPostChange({ commentCount: next.length })
            return next
        })
    }

    async function handleDelete(commentId: string) {
        const toRemove = collectSubtreeIds(comments, commentId)
        await Promise.all(
            [...toRemove].map((id) =>
                deleteComment({
                    postAuthorUid: post.authorUid,
                    postId: post.id,
                    commentId: id
                })
            )
        )
        setComments((current) => {
            const next = current.filter((c) => !toRemove.has(c.id))
            onPostChange({ commentCount: next.length })
            return next
        })
    }

    const tree = buildCommentTree(comments)

    return (
        <Modal
            customClass="max-w-xl"
            onClosing={onClose}
            titleSlot={
                <div className="min-w-0">
                    <p className={ui.eyebrow}>Post</p>
                    <p className={cx(ui.title, "mt-0")}>
                        @{post.authorUsername}
                    </p>
                    <p className={cx(ui.meta, "mt-1")}>
                        {formatDate(post.createdAt)}
                    </p>
                </div>
            }
        >
            <div className={ui.stack}>
                <div>
                    <p className={cx(ui.body, "whitespace-pre-wrap")}>
                        {post.body}
                    </p>
                    <div
                        className={cx(
                            ui.afterBody,
                            "flex items-center justify-between gap-2"
                        )}
                    >
                        <p
                            className={cx(
                                ui.meta,
                                "inline-flex items-center gap-1.5 text-sm"
                            )}
                        >
                            <ChatBubbleLeftIcon
                                className="h-4 w-4"
                                aria-hidden
                            />
                            {post.commentCount}{" "}
                            {post.commentCount === 1 ? "comment" : "comments"}
                        </p>
                        {viewer ? (
                            <PostLikeButton
                                post={post}
                                likerUid={viewer.uid}
                                onChange={(next) => onPostChange(next)}
                            />
                        ) : null}
                    </div>
                </div>

                {viewer && profile ? (
                    <form
                        className={ui.stackTight}
                        onSubmit={handleSubmit}
                    >
                        <label className={ui.fieldLabel}>
                            Add a comment
                            <div className="mt-1.5">
                                <EmojiTextarea
                                    value={body}
                                    onChange={setBody}
                                    maxLength={COMMENT_MAX_LENGTH}
                                    placeholder="What are your thoughts?"
                                    className="mt-0 min-h-[5.5rem]"
                                />
                            </div>
                        </label>
                        <div className="flex items-center justify-between gap-2">
                            <p className={ui.meta}>
                                {body.length}/{COMMENT_MAX_LENGTH}
                            </p>
                            <button
                                type="submit"
                                className={cx(ui.btn, ui.btnPrimary)}
                                disabled={saving || !body.trim()}
                            >
                                {saving ? "Posting…" : "Comment"}
                            </button>
                        </div>
                    </form>
                ) : null}

                <section>
                    <p className={ui.eyebrow}>Discussion</p>
                    {loading ? (
                        <p className={cx(ui.hint, "mt-0")}>Loading comments…</p>
                    ) : null}
                    {!loading && tree.length === 0 ? (
                        <p className={cx(ui.hint, "mt-0")}>
                            No comments yet. Start the thread.
                        </p>
                    ) : null}
                    {!loading && tree.length > 0 ? (
                        <ul className="comment-thread m-0 mt-2 list-none p-0">
                            {tree.map((node) => (
                                <CommentThread
                                    key={node.id}
                                    node={node}
                                    depth={0}
                                    postAuthorUid={post.authorUid}
                                    viewerUid={viewer?.uid ?? null}
                                    onReply={handleReply}
                                    onDelete={handleDelete}
                                    onVoteChange={handleVoteChange}
                                />
                            ))}
                        </ul>
                    ) : null}
                </section>
            </div>
        </Modal>
    )
}
