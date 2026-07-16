/**
 * OPTIONAL fake OpenAPI-generated client.
 * This project’s main path is sendRequest + hooks (see hooks/useTodo.ts).
 * Keep this file as a “what OpenAPI output can look like” reference.
 */

import type { CreateTodoBodyDto, TodoDto } from "./dto"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type ClientResponse<T> = {
    data: T | undefined
    error: unknown
    response: Response
}

const API_BASE = "https://jsonplaceholder.typicode.com"

async function request<T>(
    path: string,
    method: HttpMethod,
    body?: unknown
): Promise<ClientResponse<T>> {
    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            Accept: "application/json",
            ...(body !== undefined
                ? { "Content-Type": "application/json" }
                : {})
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    })

    const data = (await response.json()) as T

    if (!response.ok) {
        return { data: undefined, error: data, response }
    }

    return { data, error: undefined, response }
}

/**
 * This is the `api` people mean in "real world" examples.
 * Typed methods mapped from OpenAPI paths.
 */
export const api = {
    async getTodo(id: number): Promise<TodoDto> {
        const { data, error, response } = await request<TodoDto>(
            `/todos/${id}`,
            "GET"
        )

        if (error || !data) {
            throw new Error(`GET /todos/${id} failed: ${response.status}`)
        }

        return data
    },

    async createTodo(body: CreateTodoBodyDto): Promise<TodoDto> {
        const { data, error, response } = await request<TodoDto>(
            "/todos",
            "POST",
            body
        )

        if (error || !data) {
            throw new Error(`POST /todos failed: ${response.status}`)
        }

        return data
    }
}
