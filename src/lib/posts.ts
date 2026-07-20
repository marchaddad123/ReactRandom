import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    type QueryDocumentSnapshot
} from "firebase/firestore"
import { POST_MAX_LENGTH, type Post } from "../types/post"
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

function mapPostDocs(authorUid: string, docs: QueryDocumentSnapshot[]): Post[] {
    return docs.map((d) => {
        const data = d.data()
        return {
            id: d.id,
            authorUid: data.authorUid ?? authorUid,
            authorUsername: data.authorUsername ?? "",
            body: data.body ?? "",
            createdAt: toIso(data.createdAt)
        }
    })
}

export async function listPostsForUser(authorUid: string): Promise<Post[]> {
    try {
        const snap = await getDocs(
            query(postsCollection(authorUid), orderBy("createdAt", "desc"))
        )
        return mapPostDocs(authorUid, snap.docs)
    } catch {
        try {
            // Missing index — load unordered and sort here.
            const snap = await getDocs(postsCollection(authorUid))
            return mapPostDocs(authorUid, snap.docs).sort((a, b) =>
                b.createdAt.localeCompare(a.createdAt)
            )
        } catch (error) {
            // No posts yet / rules not ready — show an empty feed, not an error banner.
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
            createdAt: nowIso
        }
    } catch (error) {
        const code =
            typeof error === "object" &&
            error !== null &&
            "code" in error
                ? String((error as { code: string }).code)
                : ""
        if (code === "permission-denied") {
            throw new Error(
                "Missing or insufficient permissions. Publish Firestore rules for users/{uid}/posts (see README)."
            )
        }
        throw error
    }
}
