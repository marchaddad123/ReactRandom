import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid"
import { formatScore } from "../lib/format"
import { cx } from "../lib/ui"
import type { CommentVote } from "../types/comment"

type CommentVoteColumnProps = {
    score: number
    myVote: CommentVote
    disabled: boolean
    onUp: () => void
    onDown: () => void
}

/** Classic Reddit vertical vote stack — larger hit targets on touch. */
export function CommentVoteColumn({
    score,
    myVote,
    disabled,
    onUp,
    onDown
}: CommentVoteColumnProps) {
    return (
        <div className="flex w-8 shrink-0 flex-col items-center sm:w-6 sm:pt-0.5">
            <button
                type="button"
                className={cx(
                    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 transition-colors sm:h-5 sm:w-5",
                    myVote === 1
                        ? "text-upvote"
                        : "text-muted hover:text-upvote",
                    disabled && "cursor-default opacity-50"
                )}
                aria-label="Upvote"
                aria-pressed={myVote === 1}
                disabled={disabled}
                onClick={onUp}
            >
                <ArrowUpIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
            <span
                className={cx(
                    "text-[0.7rem] leading-none font-medium tabular-nums",
                    myVote === 1 && "text-upvote",
                    myVote === -1 && "text-downvote",
                    myVote === 0 && "text-muted"
                )}
            >
                {formatScore(score)}
            </span>
            <button
                type="button"
                className={cx(
                    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 transition-colors sm:h-5 sm:w-5",
                    myVote === -1
                        ? "text-downvote"
                        : "text-muted hover:text-downvote",
                    disabled && "cursor-default opacity-50"
                )}
                aria-label="Downvote"
                aria-pressed={myVote === -1}
                disabled={disabled}
                onClick={onDown}
            >
                <ArrowDownIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
        </div>
    )
}
