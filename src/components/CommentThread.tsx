import { useState, type FormEvent } from "react"
import { countCommentDescendants, setCommentVote } from "../lib/comments"
import {
    formatPointsLabel,
    formatRelativeTime,
    formatScore
} from "../lib/format"
import { cx, ui } from "../lib/ui"
import { useNotificationStore } from "../store/useNotificationStore"
import {
    COMMENT_MAX_INDENT,
    COMMENT_MAX_LENGTH,
    type CommentNode,
    type CommentVote
} from "../types/comment"
import { CommentVoteColumn } from "./CommentVoteColumn"
import { EmojiTextarea } from "./EmojiTextarea"

type CommentThreadProps = {
    node: CommentNode
    depth: number
    postAuthorUid: string
    viewerUid: string | null
    onReply: (parentId: string, body: string) => Promise<void>
    onDelete: (commentId: string) => Promise<void>
    onVoteChange: (
        commentId: string,
        next: Pick<CommentNode, "score" | "myVote">
    ) => void
}

/** Classic Reddit-style comment: vote column, meta row, rail collapse. */
export function CommentThread({
    node,
    depth,
    postAuthorUid,
    viewerUid,
    onReply,
    onDelete,
    onVoteChange
}: CommentThreadProps) {
    const notify = useNotificationStore((state) => state.updateNotification)
    const [collapsed, setCollapsed] = useState(false)
    const [replying, setReplying] = useState(false)
    const [replyBody, setReplyBody] = useState("")
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [voting, setVoting] = useState(false)

    const indent = Math.min(depth, COMMENT_MAX_INDENT)
    const childCount = countCommentDescendants(node)
    const hasChildren = node.children.length > 0
    const nestStyle =
        indent > 0
            ? {
                  marginLeft: `min(
                      calc(${indent} * var(--comment-indent-step)),
                      var(--comment-indent-cap)
                  )`
              }
            : undefined
    async function handleVote(next: CommentVote) {
        if (!viewerUid || voting) return
        const prev = { score: node.score, myVote: node.myVote }
        const cleared = next !== 0 && next === node.myVote
        const applied: CommentVote = cleared ? 0 : next
        const delta = applied - node.myVote
        onVoteChange(node.id, {
            score: node.score + delta,
            myVote: applied
        })

        setVoting(true)
        try {
            const result = await setCommentVote({
                postAuthorUid,
                postId: node.postId,
                commentId: node.id,
                voterUid: viewerUid,
                currently: prev.myVote,
                next
            })
            onVoteChange(node.id, result)
        } catch {
            onVoteChange(node.id, prev)
            notify({ message: "Could not save vote.", error: true })
        } finally {
            setVoting(false)
        }
    }

    async function handleReplySubmit(event: FormEvent) {
        event.preventDefault()
        const trimmed = replyBody.trim()
        if (!trimmed) {
            notify({ message: "Write a reply first.", error: true })
            return
        }

        setSaving(true)
        try {
            await onReply(node.id, trimmed)
            setReplyBody("")
            setReplying(false)
        } catch (err) {
            notify({
                message:
                    err instanceof Error
                        ? err.message
                        : "Could not post reply.",
                error: true
            })
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (deleting) return
        setDeleting(true)
        try {
            await onDelete(node.id)
        } catch (err) {
            notify({
                message:
                    err instanceof Error
                        ? err.message
                        : "Could not delete comment.",
                error: true
            })
            setDeleting(false)
        }
    }

    if (collapsed) {
        return (
            <li
                className="m-0 list-none"
                style={nestStyle}
            >
                <button
                    type="button"
                    className="text-muted hover:text-ink inline-flex min-h-10 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 py-2 text-xs sm:min-h-0 sm:py-1"
                    onClick={() => setCollapsed(false)}
                >
                    <span className="text-upvote font-medium">[+]</span>
                    <span className="text-ink font-medium">
                        {node.authorUsername}
                    </span>
                    <span>·</span>
                    <span>
                        {formatScore(node.score)}{" "}
                        {formatPointsLabel(node.score)}
                    </span>
                    <span>·</span>
                    <span>{formatRelativeTime(node.createdAt)}</span>
                    {childCount > 0 ? (
                        <>
                            <span>·</span>
                            <span>
                                {childCount} more{" "}
                                {childCount === 1 ? "reply" : "replies"}
                            </span>
                        </>
                    ) : null}
                </button>
            </li>
        )
    }

    return (
        <li
            className="m-0 flex list-none gap-0"
            style={nestStyle}
        >
            {depth > 0 ? (
                <button
                    type="button"
                    className="group relative mr-1.5 w-4 shrink-0 cursor-pointer self-stretch border-0 bg-transparent p-0 sm:mr-2 sm:w-3"
                    aria-label="Collapse thread"
                    title="Collapse thread"
                    onClick={() => setCollapsed(true)}
                >
                    <span className="bg-line group-hover:bg-upvote absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full transition-colors" />
                </button>
            ) : null}

            <div className="flex min-w-0 flex-1 gap-1 sm:gap-1.5">
                <CommentVoteColumn
                    score={node.score}
                    myVote={node.myVote}
                    disabled={!viewerUid || voting}
                    onUp={() => void handleVote(1)}
                    onDown={() => void handleVote(-1)}
                />

                <div className="min-w-0 flex-1 overflow-hidden pb-2">
                    <div className="text-muted flex flex-wrap items-center gap-x-1 text-xs leading-snug">
                        {hasChildren ? (
                            <button
                                type="button"
                                className="text-muted hover:text-ink inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 font-medium sm:min-h-0 sm:min-w-0"
                                aria-label="Collapse thread"
                                onClick={() => setCollapsed(true)}
                            >
                                [–]
                            </button>
                        ) : null}
                        <span className="text-ink font-medium">
                            {node.authorUsername}
                        </span>
                        <span aria-hidden>·</span>
                        <span>
                            {formatScore(node.score)}{" "}
                            {formatPointsLabel(node.score)}
                        </span>
                        <span aria-hidden>·</span>
                        <time dateTime={node.createdAt}>
                            {formatRelativeTime(node.createdAt)}
                        </time>
                    </div>

                    <p className="text-ink m-0 mt-0.5 text-sm leading-snug break-words whitespace-pre-wrap">
                        {node.body}
                    </p>

                    <div className="text-muted mt-0.5 flex flex-wrap items-center gap-x-1 text-[0.7rem] font-medium tracking-wide uppercase sm:mt-1 sm:gap-x-3 sm:text-[0.65rem]">
                        {viewerUid ? (
                            <button
                                type="button"
                                className="hover:text-ink inline-flex min-h-10 cursor-pointer items-center border-0 bg-transparent px-1 py-2 sm:min-h-0 sm:px-0 sm:py-0"
                                onClick={() => setReplying((r) => !r)}
                            >
                                {replying ? "Cancel" : "Reply"}
                            </button>
                        ) : null}
                        {viewerUid === node.authorUid ? (
                            <button
                                type="button"
                                className="hover:text-danger inline-flex min-h-10 cursor-pointer items-center border-0 bg-transparent px-1 py-2 sm:min-h-0 sm:px-0 sm:py-0"
                                disabled={deleting}
                                onClick={() => void handleDelete()}
                            >
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        ) : null}
                    </div>

                    {replying ? (
                        <form
                            className="mt-2 space-y-2"
                            onSubmit={handleReplySubmit}
                        >
                            <EmojiTextarea
                                value={replyBody}
                                onChange={setReplyBody}
                                maxLength={COMMENT_MAX_LENGTH}
                                placeholder={`Reply to ${node.authorUsername}…`}
                                className="mt-0 min-h-[4rem] text-sm"
                            />
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    className={cx(
                                        ui.btn,
                                        ui.btnGhost,
                                        "px-3 py-1.5 text-sm"
                                    )}
                                    onClick={() => {
                                        setReplying(false)
                                        setReplyBody("")
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={cx(
                                        ui.btn,
                                        ui.btnPrimary,
                                        "px-3 py-1.5 text-sm"
                                    )}
                                    disabled={saving || !replyBody.trim()}
                                >
                                    {saving ? "Posting…" : "Reply"}
                                </button>
                            </div>
                        </form>
                    ) : null}

                    {hasChildren ? (
                        <ul className="m-0 mt-1 list-none space-y-0 p-0">
                            {node.children.map((child) => (
                                <CommentThread
                                    key={child.id}
                                    node={child}
                                    depth={depth + 1}
                                    postAuthorUid={postAuthorUid}
                                    viewerUid={viewerUid}
                                    onReply={onReply}
                                    onDelete={onDelete}
                                    onVoteChange={onVoteChange}
                                />
                            ))}
                        </ul>
                    ) : null}
                </div>
            </div>
        </li>
    )
}
