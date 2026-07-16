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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function listTodos(): LocalTodo[] {
    return loadTodos()
}

export function addTodo(title: string): LocalTodo {
    const todos = loadTodos()
    const todo: LocalTodo = {
        id: crypto.randomUUID(),
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    }

    saveTodos([todo, ...todos])
    return todo
}

export function deleteTodo(id: string): void {
    const todos = loadTodos().filter((todo) => todo.id !== id)
    saveTodos(todos)
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
