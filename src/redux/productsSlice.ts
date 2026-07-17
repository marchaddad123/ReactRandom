import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { sendRequest } from "../lib/request"

export type Product = {
    id: number
    title: string
}

type ProductsState = {
    list: Product[]
    status: "idle" | "loading" | "succeeded" | "failed"
    error: string | null
}

const initialState: ProductsState = {
    list: [],
    status: "idle",
    error: null
}

/**
 * STEP 2b — async ACTION (like Vuex action).
 *
 * Can we just call sendRequest in the component and then update state?
 * Yes. Example:
 *   const data = await sendRequest(...)
 *   dispatch(someSyncAction(data))
 *
 * Why createAsyncThunk instead?
 * Redux community style: keep async + loading/error IN the store flow.
 * Thunk auto-dispatches 3 steps for you:
 *   pending   → set loading
 *   fulfilled → set data
 *   rejected  → set error
 *
 * We STILL use sendRequest inside the thunk — thunk wraps it, doesn't replace it.
 */
export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (options: { fail?: boolean } | undefined, { rejectWithValue }) => {
        if (options?.fail) {
            return rejectWithValue("Server said no (demo failure)")
        }

        // Same HTTP helper as the rest of the app.
        const { status, responseData } =
            await sendRequest<Product[]>("/posts?_limit=5")

        if (status >= 400 || !responseData) {
            return rejectWithValue(`Request failed: ${status}`)
        }

        return responseData.map((post) => ({
            id: post.id,
            title: post.title
        }))
    }
)

const productsSlice = createSlice({
    name: "products",
    initialState,
    // Sync mutations for this slice.
    reducers: {
        clearProducts: (state) => {
            state.list = []
            state.status = "idle"
            state.error = null
        }
    },
    // Wire the thunk's pending / success / fail into state updates.
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = "succeeded"
                // action.payload = what the thunk RETURNED
                state.list = action.payload
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = "failed"
                state.error =
                    (action.payload as string) ||
                    action.error.message ||
                    "Unknown error"
            })
    }
})

export const { clearProducts } = productsSlice.actions
export default productsSlice.reducer
