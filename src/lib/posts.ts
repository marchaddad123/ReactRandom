import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    type QueryDocumentSnapshot
} from "firebase/firestore"
import { POST_MAX_LENGTH, type Post } from "../types/post"
import { countCommentsForPost } from "./comments"
import { db } from "./firebase"

function toIso(value: unknown): string {
    if (value instanceof Timestamp) return value.toDate().toISOString()
    if (typeof value === "string") return value
    if (value instanceof Date) return value.toISOString()
    return new Date().toISOString()
}

/** posts live under users/{uid}/posts/{postId} */
function postsCollection(authorUid: string) {
    return collection(db, "users", authorUid, "posts")
}

function likesCollection(authorUid: string, postId: string) {
    return collection(db, "users", authorUid, "posts", postId, "likes")
}

function likeDoc(authorUid: string, postId: string, likerUid: string) {
    return doc(db, "users", authorUid, "posts", postId, "likes", likerUid)
}

async function loadLikeState(
    authorUid: string,
    postId: string,
    viewerUid: string | null
): Promise<{ likeCount: number; likedByMe: boolean }> {
    try {
        const likesCol = likesCollection(authorUid, postId)
        const countSnap = await getCountFromServer(likesCol)
        const likeCount = countSnap.data().count
        if (!viewerUid) {
            return { likeCount, likedByMe: false }
        }
        const mine = await getDoc(likeDoc(authorUid, postId, viewerUid))
        return { likeCount, likedByMe: mine.exists() }
    } catch {
        return { likeCount: 0, likedByMe: false }
    }
}

async function mapPostDocs(
    authorUid: string,
    docs: QueryDocumentSnapshot[],
    viewerUid: string | null
): Promise<Post[]> {
    return Promise.all(
        docs.map(async (d) => {
            const data = d.data()
            const [likes, commentCount] = await Promise.all([
                loadLikeState(authorUid, d.id, viewerUid),
                countCommentsForPost(authorUid, d.id)
            ])
            return {
                id: d.id,
                authorUid: data.authorUid ?? authorUid,
                authorUsername: data.authorUsername ?? "",
                body: data.body ?? "",
                createdAt: toIso(data.createdAt),
                likeCount: likes.likeCount,
                likedByMe: likes.likedByMe,
                commentCount
            }
        })
    )
}

export async function listPostsForUser(
    authorUid: string,
    viewerUid: string | null = null
): Promise<Post[]> {
    try {
        const snap = await getDocs(
            query(postsCollection(authorUid), orderBy("createdAt", "desc"))
        )
        return mapPostDocs(authorUid, snap.docs, viewerUid)
    } catch {
        try {
            const snap = await getDocs(postsCollection(authorUid))
            const posts = await mapPostDocs(authorUid, snap.docs, viewerUid)
            return posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        } catch (error) {
            console.warn("listPostsForUser failed; showing empty feed.", error)
            return []
        }
    }
}

export async function createPost(input: {
    authorUid: string
    authorUsername: string
    body: string
}): Promise<Post> {
    const body = input.body.trim()
    if (!body) throw new Error("Post cannot be empty.")
    if (body.length > POST_MAX_LENGTH) {
        throw new Error(`Post must be at most ${POST_MAX_LENGTH} characters.`)
    }

    const nowIso = new Date().toISOString()
    try {
        const ref = await addDoc(postsCollection(input.authorUid), {
            authorUid: input.authorUid,
            authorUsername: input.authorUsername,
            body,
            createdAt: serverTimestamp()
        })

        return {
            id: ref.id,
            authorUid: input.authorUid,
            authorUsername: input.authorUsername,
            body,
            createdAt: nowIso,
            likeCount: 0,
            likedByMe: false,
            commentCount: 0
        }
    } catch (error) {
        const code =
            typeof error === "object" && error !== null && "code" in error
                ? String((error as { code: string }).code)
                : ""
        if (code === "permission-denied") {
            throw new Error(
                "Missing or insufficient permissions. Publish Firestore rules for users/{uid}/posts (see README).",
                { cause: error }
            )
        }
        throw error
    }
}

/**
 * Persist a like toggle. Pass `currentlyLiked` from UI state so we skip an
 * extra read — the button updates optimistically before this resolves.
 */
export async function togglePostLike(input: {
    authorUid: string
    postId: string
    likerUid: string
    currentlyLiked: boolean
}): Promise<void> {
    const ref = likeDoc(input.authorUid, input.postId, input.likerUid)
    if (input.currentlyLiked) {
        await deleteDoc(ref)
        return
    }
    await setDoc(ref, {
        likerUid: input.likerUid,
        createdAt: serverTimestamp()
    })
}
