/**
 * Pretend these types were generated from an OpenAPI spec.
 * In a real app you'd run something like `openapi-typescript` / Orval
 * and NOT hand-write this file.
 *
 * Example OpenAPI schema this mirrors:
 *
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required: [userId, id, title, completed]
 *       properties:
 *         userId: { type: integer }
 *         id: { type: integer }
 *         title: { type: string }
 *         completed: { type: boolean }
 *     CreateTodoBody:
 *       type: object
 *       required: [title]
 *       properties:
 *         title: { type: string }
 *         completed: { type: boolean }
 */

/** Response DTO — what the API returns */
export type TodoDto = {
    userId: number
    id: number
    title: string
    completed: boolean
}

/** Request DTO — what you send when creating */
export type CreateTodoBodyDto = {
    title: string
    completed?: boolean
}
