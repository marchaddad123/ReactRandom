import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type FormEvent, useState } from "react"
import { addTodo, clearTodos, deleteTodo, listTodos } from "../lib/todoStorage"
import { cx, ui } from "../lib/ui"
import { useNotificationStore } from "../store/useNotificationStore"

const TODOS_QUERY_KEY = ["local-todos"] as const

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Something went wrong"
}

export function TodosPage() {
    const queryClient = useQueryClient()
    const updateNotification = useNotificationStore(
        (state) => state.updateNotification
    )
    const [title, setTitle] = useState("")

    const { data: todos = [] } = useQuery({
        queryKey: TODOS_QUERY_KEY,
        queryFn: () => listTodos()
    })

    const invalidateTodos = () =>
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })

    const addMutation = useMutation({
        mutationFn: (nextTitle: string) => Promise.resolve(addTodo(nextTitle)),
        onSuccess: (todo) => {
            void invalidateTodos()
            setTitle("")
            updateNotification({
                message: `Added “${todo.title}”`,
                error: false
            })
        },
        onError: (error) => {
            updateNotification({
                message: errorMessage(error),
                error: true
            })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => {
            deleteTodo(id)
            return Promise.resolve()
        },
        onSuccess: () => {
            void invalidateTodos()
            updateNotification({ message: "Todo deleted", error: false })
        },
        onError: (error) => {
            updateNotification({
                message: errorMessage(error),
                error: true
            })
        }
    })

    const clearMutation = useMutation({
        mutationFn: () => {
            clearTodos()
            return Promise.resolve()
        },
        onSuccess: () => {
            void invalidateTodos()
            updateNotification({ message: "All todos cleared", error: false })
        },
        onError: (error) => {
            updateNotification({
                message: errorMessage(error),
                error: true
            })
        }
    })

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        addMutation.mutate(title)
    }

    return (
        <section className={cx(ui.panel, "animate-rise overflow-hidden !p-0")}>
            <div className="border-line border-b px-6 py-5">
                <p className={ui.eyebrow}>localStorage</p>
                <h2 className="font-display text-ink m-0 text-2xl tracking-tight">
                    Todo list
                </h2>
                <p className={ui.lede}>
                    Add and delete · type <code>FAIL</code> to demo{" "}
                    <code>onError</code>
                </p>
            </div>

            <div className="px-6 py-5">
                <form
                    className="flex gap-2"
                    onSubmit={handleSubmit}
                >
                    <input
                        id="todo-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="What needs doing?"
                        aria-label="New todo"
                        className={cx(ui.field, "!mt-0 min-w-0 flex-1")}
                    />
                    <button
                        type="submit"
                        disabled={addMutation.isPending}
                        className={cx(ui.btn, ui.btnPrimary, "shrink-0")}
                    >
                        Add
                    </button>
                </form>

                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            updateNotification({
                                message: "Info tip: try adding a todo"
                            })
                        }
                        className="text-muted hover:bg-tertiary hover:text-ink cursor-pointer rounded-md border-0 bg-transparent px-2.5 py-1.5 text-xs font-medium transition"
                    >
                        Demo info toast
                    </button>
                    <button
                        type="button"
                        onClick={() => updateNotification(null)}
                        className="text-muted hover:bg-tertiary hover:text-ink cursor-pointer rounded-md border-0 bg-transparent px-2.5 py-1.5 text-xs font-medium transition"
                    >
                        Clear toasts
                    </button>
                    {todos.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => clearMutation.mutate()}
                            className="text-danger hover:bg-danger/10 ml-auto cursor-pointer rounded-md border-0 bg-transparent px-2.5 py-1.5 text-xs font-medium transition"
                        >
                            Clear all
                        </button>
                    ) : null}
                </div>

                {todos.length === 0 ? (
                    <p className="text-muted mt-8 mb-0 text-center text-sm">
                        No todos yet
                    </p>
                ) : (
                    <ul className="divide-line border-line mt-5 list-none divide-y border-t p-0">
                        {todos.map((todo) => (
                            <li
                                key={todo.id}
                                className="flex items-center justify-between gap-4 py-3"
                            >
                                <span className="text-ink min-w-0 truncate">
                                    {todo.title}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        deleteMutation.mutate(todo.id)
                                    }
                                    className="text-muted hover:text-danger shrink-0 cursor-pointer border-0 bg-transparent text-sm font-medium transition"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
