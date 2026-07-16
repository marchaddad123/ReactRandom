const API_BASE = "https://jsonplaceholder.typicode.com"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type SendRequestResult<T> = {
    status: number
    responseData: T | null
}

/**
 * Simple shared HTTP helper — like your Nuxt `sendRequest`, without tenant/XSRF.
 */
export async function sendRequest<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    requestData?: unknown
): Promise<SendRequestResult<T>> {
    const headers: Record<string, string> = {
        Accept: "application/json"
    }

    if (requestData !== undefined) {
        headers["Content-Type"] = "application/json"
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers,
            ...(requestData !== undefined && {
                body: JSON.stringify(requestData)
            })
        })

        const responseData = (await response.json()) as T

        if (!response.ok) {
            return {
                status: response.status,
                responseData
            }
        }

        return {
            status: response.status,
            responseData
        }
    } catch {
        return {
            status: 500,
            responseData: null
        }
    }
}
