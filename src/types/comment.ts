export type CommentVote = 1 | -1 | 0

export type Comment = {
    id: string
    postId: string
    authorUid: string
    authorUsername: string
    body: string
    /** null = top-level comment on the post */
    parentId: string | null
    createdAt: string
    /** upvotes − downvotes */
    score: number
    /** Viewer's vote; 0 if none / signed out */
    myVote: CommentVote
}

export type CommentNode = Comment & {
    children: CommentNode[]
}

export const COMMENT_MAX_LENGTH = 1000
