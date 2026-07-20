import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
import confetti from "canvas-confetti"
import { useState, type MouseEvent } from "react"
import { formatCompactCount } from "../lib/format"
import { togglePostLike } from "../lib/posts"
import { cx } from "../lib/ui"
import type { Post } from "../types/post"

type PostLikeButtonProps = {
    post: Post
    likerUid: string
    onChange: (next: Pick<Post, "likeCount" | "likedByMe">) => void
}

function burstConfetti(originX: number, originY: number) {
    confetti({
        particleCount: 24,
        spread: 36,
        startVelocity: 14,
        scalar: 0.45,
        gravity: 1.15,
        ticks: 120,
        origin: { x: originX, y: originY }
    })
}

/** Heart toggle — optimistic UI, bump + confetti on new like. Fixed size, no CLS. */
export function PostLikeButton({
    post,
    likerUid,
    onChange
}: PostLikeButtonProps) {
    const [busy, setBusy] = useState(false)
    const [bump, setBump] = useState(false)

    async function handleClick(event: MouseEvent<HTMLButtonElement>) {
        if (busy) return

        const rect = event.currentTarget.getBoundingClientRect()
        const originX = (rect.left + rect.width / 2) / window.innerWidth
        const originY = (rect.top + rect.height / 2) / window.innerHeight

        const wasLiked = post.likedByMe
        const prevCount = post.likeCount
        const nextLiked = !wasLiked
        const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1))

        onChange({ likeCount: nextCount, likedByMe: nextLiked })
        if (nextLiked) {
            setBump(true)
            burstConfetti(originX, originY)
        }

        setBusy(true)
        try {
            await togglePostLike({
                authorUid: post.authorUid,
                postId: post.id,
                likerUid,
                currentlyLiked: wasLiked
            })
        } catch {
            onChange({ likeCount: prevCount, likedByMe: wasLiked })
        } finally {
            setBusy(false)
        }
    }

    return (
        <button
            type="button"
            className={cx(
                "inline-flex shrink-0 cursor-pointer items-center gap-1 self-end rounded-lg border-0 bg-transparent px-1 text-sm font-semibold transition-colors",
                post.likedByMe ? "text-danger" : "text-muted hover:text-danger"
            )}
            aria-pressed={post.likedByMe}
            aria-label={
                post.likedByMe
                    ? `Unlike post, ${post.likeCount} likes`
                    : `Like post, ${post.likeCount} likes`
            }
            onClick={handleClick}
        >
            <span className="relative grid h-5 w-5 shrink-0 place-items-center overflow-visible">
                <HeartOutline
                    className={cx(
                        "col-start-1 row-start-1 h-5 w-5",
                        post.likedByMe && "invisible"
                    )}
                    aria-hidden
                />
                <HeartSolid
                    className={cx(
                        "col-start-1 row-start-1 h-5 w-5 origin-center",
                        !post.likedByMe && "invisible",
                        bump && "animate-heart-bump"
                    )}
                    aria-hidden
                    onAnimationEnd={() => setBump(false)}
                />
            </span>
            <span className="w-4 leading-none tabular-nums">
                {formatCompactCount(post.likeCount)}
            </span>
        </button>
    )
}
