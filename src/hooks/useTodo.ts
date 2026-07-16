import { useQuery } from "@tanstack/react-query"
import { getTodo } from "../api/todos"

/**
 * Custom hook = wrap sendRequest (via getTodo) + useQuery,
 * and return whatever the UI needs — not only raw query fields.
 */
export function useTodo(id: number) {
    const query = useQuery({
        queryKey: ["todo", id],
        queryFn: () => getTodo(id)
    })

    const titleUpper = query.data?.title.toUpperCase() ?? ""
    const isDone = query.data?.completed ?? false
    const label = `Todo #${id}`

    return {
        // from useQuery
        data: query.data,
        error: query.error,
        isPending: query.isPending,
        isFetching: query.isFetching,
        refetch: query.refetch,
        dataUpdatedAt: query.dataUpdatedAt,
        // extras you invent for the page
        titleUpper,
        isDone,
        label
    }
}
