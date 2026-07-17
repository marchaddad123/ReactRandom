export type LocalTodo = {
    id: string
    title: string
    completed: boolean
    createdAt: string
}

const STORAGE_KEY = "learn-react-todos"

export function loadTodos(): LocalTodo[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            return []
        }

        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? (parsed as LocalTodo[]) : []
    } catch {
        return []
    }
}

function saveTodos(todos: LocalTodo[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
        // Same idea as a 500 from the API.
        throw new Error("Could not save todos (storage full or blocked)")
    }
}

export function listTodos(): LocalTodo[] {
    return loadTodos()
}

export function addTodo(title: string): LocalTodo {
    const trimmed = title.trim()
    if (!trimmed) {
        throw new Error("Title can’t be empty")
    }

    // Demo “API failure”: type FAIL to force an error toast via onError.
    if (trimmed.toUpperCase() === "FAIL") {
        throw new Error("Server rejected this todo")
    }

    const todos = loadTodos()
    const todo: LocalTodo = {
        id: crypto.randomUUID(),
        title: trimmed,
        completed: false,
        createdAt: new Date().toISOString()
    }

    saveTodos([todo, ...todos])
    return todo
}

export function deleteTodo(id: string): void {
    const todos = loadTodos()
    const next = todos.filter((todo) => todo.id !== id)

    if (next.length === todos.length) {
        throw new Error("Todo not found")
    }

    saveTodos(next)
}

export function toggleTodo(id: string): LocalTodo | null {
    const todos = loadTodos()
    const index = todos.findIndex((todo) => todo.id === id)

    if (index === -1) {
        return null
    }

    const updated = {
        ...todos[index],
        completed: !todos[index].completed
    }
    todos[index] = updated
    saveTodos(todos)
    return updated
}

export function clearTodos(): void {
    saveTodos([])
}
