import { useQuery } from "@tanstack/react-query"
import { sendRequest } from "../lib/request"

type Todo = {
    userId: number
    id: number
    title: string
    completed: boolean
}

async function fetchTodo(id: number): Promise<Todo> {
    const { status, responseData } = await sendRequest<Todo>(`/todos/${id}`)

    if (status >= 400 || !responseData) {
        throw new Error(`Request failed: ${status}`)
    }

    return responseData
}

export function FetchPage() {
    // Similar to Nuxt: const { data, pending, error, refresh } = await useFetch(...)
    const { data, error, isPending, isFetching, refetch, dataUpdatedAt } =
        useQuery({
            queryKey: ["todo", 1],
            queryFn: () => fetchTodo(1)
        })

    return (
        <section className="card">
            <p className="eyebrow">TanStack Query</p>
            <h2>Server state (like useFetch)</h2>
            <p className="hint">
                Vue/Nuxt: <code>useFetch</code> / <code>$fetch</code>. React:
                <code>sendRequest</code> (shared fetch helper) +{" "}
                <code>useQuery</code> for cache, loading, and refetch.
            </p>

            <div className="actions">
                <button
                    type="button"
                    onClick={() => {
                        void refetch()
                    }}
                    disabled={isFetching}
                >
                    {isFetching ? "Fetching…" : "Refetch"}
                </button>
            </div>

            {isPending ? <p className="hint">Loading…</p> : null}

            {error ? (
                <p className="hint">
                    Error:{" "}
                    {error instanceof Error ? error.message : "Unknown error"}
                </p>
            ) : null}

            {data ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p>
                        <span className="font-semibold">#{data.id}</span>{" "}
                        {data.title}
                    </p>
                    <p className="hint">
                        Completed: <code>{String(data.completed)}</code>
                    </p>
                    <p className="hint">
                        Cached — leave this page and come back within 30s and it
                        should show instantly (staleTime). Last update:{" "}
                        <code>
                            {new Date(dataUpdatedAt).toLocaleTimeString()}
                        </code>
                    </p>
                </div>
            ) : null}
        </section>
    )
}
