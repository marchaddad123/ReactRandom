import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type FormEvent, useState } from "react"
import { addTodo, clearTodos, deleteTodo, listTodos } from "../lib/todoStorage"
import { useNotifications } from "../store/NotificationContext"

const TODOS_QUERY_KEY = ["local-todos"] as const

export function TodosPage() {
    const queryClient = useQueryClient()
    const { updateNotification } = useNotifications()
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
        }
    })

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!title.trim()) {
            updateNotification({
                message: "Title can’t be empty",
                error: true
            })
            return
        }
        addMutation.mutate(title)
    }

    return (
        <section className="todos-page overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
                <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
                    localStorage
                </p>
                <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">
                    Todo list
                </h2>
                <p className="mt-1 mb-0 text-sm text-slate-500">
                    Add and delete · saved in localStorage
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
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    />
                    <button
                        type="submit"
                        disabled={addMutation.isPending}
                        className="shrink-0 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        Demo info toast
                    </button>
                    <button
                        type="button"
                        onClick={() => updateNotification(null)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        Clear toasts
                    </button>
                    {todos.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => clearMutation.mutate()}
                            className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                            Clear all
                        </button>
                    ) : null}
                </div>

                {todos.length === 0 ? (
                    <p className="mt-8 mb-0 text-center text-sm text-slate-400">
                        No todos yet
                    </p>
                ) : (
                    <ul className="mt-5 list-none divide-y divide-slate-100 border-t border-slate-100 p-0">
                        {todos.map((todo) => (
                            <li
                                key={todo.id}
                                className="flex items-center justify-between gap-4 py-3"
                            >
                                <span className="min-w-0 truncate text-slate-800">
                                    {todo.title}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        deleteMutation.mutate(todo.id)
                                    }
                                    className="shrink-0 text-sm font-medium text-slate-400 transition hover:text-red-600"
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
