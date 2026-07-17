import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type FormEvent, useState } from "react"
import { addTodo, clearTodos, deleteTodo, listTodos } from "../lib/todoStorage"
import { useNotifications } from "../store/NotificationContext"

// This name is like a label on a box in the cache.
// React Query uses it to find "our todo list" later.
const TODOS_QUERY_KEY = ["local-todos"] as const

// Turn any error into a simple message we can show in a toast.
function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Something went wrong"
}

export function TodosPage() {
    // Talks to React Query's big shared cache for the whole app.
    const queryClient = useQueryClient()

    // Shows the little popup messages (green = good, red = bad).
    const { updateNotification } = useNotifications()

    // What the user typed in the input box.
    const [title, setTitle] = useState("")

    // useQuery = READ (like GET)
    // Load the list and keep it in the cache under TODOS_QUERY_KEY.
    const { data: todos = [] } = useQuery({
        queryKey: TODOS_QUERY_KEY,
        queryFn: () => listTodos()
    })

    // Tell React Query: "this list is old — go get a fresh one."
    // We call this AFTER we add / delete / clear, so the screen updates.
    const invalidateTodos = () =>
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })

    // useMutation = WRITE (like POST / PUT / DELETE)
    // Runs only when we say so (button click), not on page load.
    const addMutation = useMutation({
        // The actual work: save a new todo.
        mutationFn: (nextTitle: string) => Promise.resolve(addTodo(nextTitle)),

        // Happy path — it worked!
        onSuccess: (todo) => {
            void invalidateTodos() // refresh the list on screen
            setTitle("") // clear the input
            updateNotification({
                message: `Added “${todo.title}”`,
                error: false // green toast
            })
        },

        // Sad path — something broke (empty title, or type FAIL).
        onError: (error) => {
            updateNotification({
                message: errorMessage(error),
                error: true // red toast
            })
        }
        // onSettled would run after BOTH success and error (we skip it here).
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

    // Form submit → ask the add mutation to run.
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault() // don't reload the whole page
        addMutation.mutate(title) // "go do the add now"
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
