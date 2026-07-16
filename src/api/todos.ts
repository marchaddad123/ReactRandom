import { sendRequest } from "../lib/request"
import type { CreateTodoBodyDto, TodoDto } from "./generated/dto"

/**
 * Hand-rolled API (no OpenAPI client required).
 * Components usually call these via a custom hook like useTodo.
 */
export async function getTodo(id: number): Promise<TodoDto> {
    const { status, responseData } = await sendRequest<TodoDto>(`/todos/${id}`)

    if (status >= 400 || !responseData) {
        throw new Error(`getTodo failed: ${status}`)
    }

    return responseData
}

export async function createTodo(body: CreateTodoBodyDto): Promise<TodoDto> {
    const { status, responseData } = await sendRequest<TodoDto>(
        "/todos",
        "POST",
        body
    )

    if (status >= 400 || !responseData) {
        throw new Error(`createTodo failed: ${status}`)
    }

    return responseData
}
