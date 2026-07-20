export type Post = {
    id: string
    authorUid: string
    authorUsername: string
    body: string
    createdAt: string
    likeCount: number
    likedByMe: boolean
}

export const POST_MAX_LENGTH = 2000
