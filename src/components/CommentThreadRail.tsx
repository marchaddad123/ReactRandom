import { cx } from "../lib/ui"
import { voteGutterClass } from "./commentLayout"

type CommentThreadRailProps = {
    depth: number
    onCollapse: () => void
}

/** Vote-column-width gutter with centered collapse line. */
export function CommentThreadRail({
    depth,
    onCollapse
}: CommentThreadRailProps) {
    if (depth <= 0) return null
    return (
        <button
            type="button"
            className={cx(
                voteGutterClass,
                "group relative cursor-pointer self-stretch border-0 bg-transparent p-0"
            )}
            aria-label="Collapse thread"
            title="Collapse thread"
            onClick={onCollapse}
        >
            <span className="bg-line group-hover:bg-upvote absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full transition-colors" />
        </button>
    )
}
