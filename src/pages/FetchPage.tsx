import { useTodo } from "../hooks/useTodo"
import { cx, ui } from "../lib/ui"

export function FetchPage() {
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
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>Custom hook + sendRequest</p>
            <h2 className={ui.title}>Server state</h2>
            <p className={ui.lede}>
                Flow: <code>useTodo(1)</code> → <code>useQuery</code> →{" "}
                <code>getTodo</code> → <code>sendRequest</code>.
            </p>

            <div className={ui.actions}>
                <button
                    type="button"
                    className={cx(ui.btn, ui.btnPrimary)}
                    onClick={() => {
                        void refetch()
                    }}
                    disabled={isFetching}
                >
                    {isFetching ? "Fetching…" : "Refetch"}
                </button>
            </div>

            {isPending ? <p className={ui.hint}>Loading…</p> : null}

            {error ? (
                <p className={ui.hint}>
                    Error:{" "}
                    {error instanceof Error ? error.message : "Unknown error"}
                </p>
            ) : null}

            {data ? (
                <div className={cx(ui.panelInset, "mt-4 p-4")}>
                    <p className={cx(ui.hint, "m-0")}>{label}</p>
                    <p className="text-ink mt-2 mb-0">
                        <span className="text-primary font-semibold">
                            #{data.id}
                        </span>{" "}
                        {data.title}
                    </p>
                    <p className={ui.hint}>
                        Upper: <code>{titleUpper}</code>
                    </p>
                    <p className={ui.hint}>
                        Done: <code>{String(isDone)}</code>
                    </p>
                    <p className={ui.hint}>
                        Cached 30s (staleTime). Last update:{" "}
                        <code>
                            {new Date(dataUpdatedAt).toLocaleTimeString()}
                        </code>
                    </p>
                </div>
            ) : null}
        </section>
    )
}
