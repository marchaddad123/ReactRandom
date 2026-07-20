import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getCountFromServer,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp
} from "firebase/firestore"
import {
    COMMENT_MAX_LENGTH,
    type Comment,
    type CommentNode,
    type CommentVote
} from "../types/comment"
import { db } from "./firebase"

function toIso(value: unknown): string {
    if (value instanceof Timestamp) return value.toDate().toISOString()
    if (typeof value === "string") return value
    if (value instanceof Date) return value.toISOString()
    return new Date().toISOString()
}

function commentsCollection(postAuthorUid: string, postId: string) {
    return collection(db, "users", postAuthorUid, "posts", postId, "comments")
}

function votesCollection(
    postAuthorUid: string,
    postId: string,
    commentId: string
) {
    return collection(
        db,
        "users",
        postAuthorUid,
        "posts",
        postId,
        "comments",
        commentId,
        "votes"
    )
}

function voteDoc(
    postAuthorUid: string,
    postId: string,
    commentId: string,
    voterUid: string
) {
    return doc(
        db,
        "users",
        postAuthorUid,
        "posts",
        postId,
        "comments",
        commentId,
        "votes",
        voterUid
    )
}

export async function countCommentsForPost(
    postAuthorUid: string,
    postId: string
): Promise<number> {
    try {
        const snap = await getCountFromServer(
            commentsCollection(postAuthorUid, postId)
        )
        return snap.data().count
    } catch {
        return 0
    }
}

async function loadVoteState(
    postAuthorUid: string,
    postId: string,
    commentId: string,
    viewerUid: string | null
): Promise<{ score: number; myVote: CommentVote }> {
    try {
        const snap = await getDocs(
            votesCollection(postAuthorUid, postId, commentId)
        )
        let score = 0
        let myVote: CommentVote = 0
        for (const d of snap.docs) {
            const value = d.data().value
            const vote = value === 1 || value === -1 ? value : 0
            score += vote
            if (viewerUid && d.id === viewerUid) myVote = vote
        }
        return { score, myVote }
    } catch {
        return { score: 0, myVote: 0 }
    }
}

function mapCommentDoc(
    postId: string,
    id: string,
    data: Record<string, unknown>,
    votes: { score: number; myVote: CommentVote }
): Comment {
    return {
        id,
        postId: (data.postId as string) ?? postId,
        authorUid: (data.authorUid as string) ?? "",
        authorUsername: (data.authorUsername as string) ?? "",
        body: (data.body as string) ?? "",
        parentId: typeof data.parentId === "string" ? data.parentId : null,
        createdAt: toIso(data.createdAt),
        score: votes.score,
        myVote: votes.myVote
    }
}

export async function listComments(
    postAuthorUid: string,
    postId: string,
    viewerUid: string | null = null
): Promise<Comment[]> {
    async function fromDocs(
        docs: Array<{ id: string; data: () => Record<string, unknown> }>
    ) {
        return Promise.all(
            docs.map(async (d) => {
                const votes = await loadVoteState(
                    postAuthorUid,
                    postId,
                    d.id,
                    viewerUid
                )
                return mapCommentDoc(postId, d.id, d.data(), votes)
            })
        )
    }

    try {
        const snap = await getDocs(
            query(
                commentsCollection(postAuthorUid, postId),
                orderBy("createdAt", "asc")
            )
        )
        return fromDocs(snap.docs)
    } catch {
        try {
            const snap = await getDocs(
                commentsCollection(postAuthorUid, postId)
            )
            const list = await fromDocs(snap.docs)
            return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        } catch (error) {
            console.warn("listComments failed.", error)
            return []
        }
    }
}

/** Build a forest of comment trees from a flat list. */
export function buildCommentTree(comments: Comment[]): CommentNode[] {
    const nodes = new Map<string, CommentNode>()
    for (const comment of comments) {
        nodes.set(comment.id, { ...comment, children: [] })
    }

    const roots: CommentNode[] = []
    for (const node of nodes.values()) {
        if (node.parentId && nodes.has(node.parentId)) {
            nodes.get(node.parentId)!.children.push(node)
        } else {
            roots.push(node)
        }
    }
    return roots
}

export function countCommentDescendants(node: CommentNode): number {
    return node.children.reduce(
        (sum, child) => sum + 1 + countCommentDescendants(child),
        0
    )
}

/** Comment id plus all nested reply ids (for cascade delete). */
export function collectSubtreeIds(
    comments: Comment[],
    rootId: string
): Set<string> {
    const byParent = new Map<string | null, string[]>()
    for (const c of comments) {
        const list = byParent.get(c.parentId) ?? []
        list.push(c.id)
        byParent.set(c.parentId, list)
    }

    const ids = new Set<string>()
    function walk(id: string) {
        ids.add(id)
        for (const child of byParent.get(id) ?? []) walk(child)
    }
    walk(rootId)
    return ids
}

export async function createComment(input: {
    postAuthorUid: string
    postId: string
    authorUid: string
    authorUsername: string
    body: string
    parentId?: string | null
}): Promise<Comment> {
    const body = input.body.trim()
    if (!body) throw new Error("Comment cannot be empty.")
    if (body.length > COMMENT_MAX_LENGTH) {
        throw new Error(
            `Comment must be at most ${COMMENT_MAX_LENGTH} characters.`
        )
    }

    const parentId = input.parentId ?? null
    const nowIso = new Date().toISOString()

    try {
        const ref = await addDoc(
            commentsCollection(input.postAuthorUid, input.postId),
            {
                postId: input.postId,
                authorUid: input.authorUid,
                authorUsername: input.authorUsername,
                body,
                parentId,
                createdAt: serverTimestamp()
            }
        )

        return {
            id: ref.id,
            postId: input.postId,
            authorUid: input.authorUid,
            authorUsername: input.authorUsername,
            body,
            parentId,
            createdAt: nowIso,
            score: 0,
            myVote: 0
        }
    } catch (error) {
        const code =
            typeof error === "object" && error !== null && "code" in error
                ? String((error as { code: string }).code)
                : ""
        if (code === "permission-denied") {
            throw new Error(
                "Missing or insufficient permissions. Publish Firestore rules for comments (see README).",
                { cause: error }
            )
        }
        throw error
    }
}

export async function deleteComment(input: {
    postAuthorUid: string
    postId: string
    commentId: string
}): Promise<void> {
    await deleteDoc(
        doc(
            db,
            "users",
            input.postAuthorUid,
            "posts",
            input.postId,
            "comments",
            input.commentId
        )
    )
}

/**
 * Set the viewer's vote. Clicking the active vote again clears it (Reddit).
 * Returns updated score + myVote.
 */
export async function setCommentVote(input: {
    postAuthorUid: string
    postId: string
    commentId: string
    voterUid: string
    currently: CommentVote
    next: CommentVote
}): Promise<{ score: number; myVote: CommentVote }> {
    const ref = voteDoc(
        input.postAuthorUid,
        input.postId,
        input.commentId,
        input.voterUid
    )

    const next =
        input.next !== 0 && input.next === input.currently ? 0 : input.next

    if (next === 0) {
        await deleteDoc(ref)
    } else {
        await setDoc(ref, {
            value: next,
            voterUid: input.voterUid,
            createdAt: serverTimestamp()
        })
    }

    return loadVoteState(
        input.postAuthorUid,
        input.postId,
        input.commentId,
        input.voterUid
    )
}
