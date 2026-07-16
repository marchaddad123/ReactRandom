import { useTodo } from "../hooks/useTodo"

export function FetchPage() {
    // Page stays thin: all fetch + query + extras live in useTodo.
    // Flow: useTodo → useQuery → getTodo → sendRequest
    const {
        data,
        error,
        isPending,
        isFetching,
        refetch,
        dataUpdatedAt,
        titleUpper,
        isDone,
        label
    } = useTodo(1)

    return (
        <section className="card">
            <p className="eyebrow">Custom hook + sendRequest</p>
            <h2>Server state (like useFetch)</h2>
            <p className="hint">
                No OpenAPI required. Flow: <code>useTodo(1)</code> →{" "}
                <code>useQuery</code> → <code>getTodo</code> →{" "}
                <code>sendRequest</code>. The hook can also return extras like{" "}
                <code>titleUpper</code> / <code>isDone</code>.
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
                    <p className="hint">{label}</p>
                    <p>
                        <span className="font-semibold">#{data.id}</span>{" "}
                        {data.title}
                    </p>
                    <p className="hint">
                        Upper: <code>{titleUpper}</code>
                    </p>
                    <p className="hint">
                        Done: <code>{String(isDone)}</code>
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
