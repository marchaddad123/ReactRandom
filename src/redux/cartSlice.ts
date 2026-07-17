import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

/**
 * STEP 2a — createSlice = one Vuex-style module.
 *
 * A slice has:
 * - name         → prefix for action types ("cart/addItem")
 * - initialState → STATE for this module only
 * - reducers     → MUTATIONS (sync only — change state now)
 *
 * RTK also builds ACTION CREATORS for you (addItem, removeItem, …).
 */

type CartState = {
    items: string[]
    lastAction: string
}

const initialState: CartState = {
    items: [],
    lastAction: "none yet"
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        // Like a Vuex mutation. action.payload = the value from dispatch.
        addItem: (state, action: PayloadAction<string>) => {
            const title = action.payload.trim()
            if (!title) {
                return
            }
            // Immer: looks like mutation, but stays safe/immutable under the hood.
            state.items.push(title)
            state.lastAction = `added “${title}”`
        },
        removeItem: (state, action: PayloadAction<number>) => {
            const index = action.payload
            const removed = state.items[index]
            state.items.splice(index, 1)
            state.lastAction = removed
                ? `removed “${removed}”`
                : "nothing to remove"
        },
        clearCart: (state) => {
            state.items = []
            state.lastAction = "cleared cart"
        }
    }
})

// These are the things you dispatch: dispatch(addItem("Milk"))
export const { addItem, removeItem, clearCart } = cartSlice.actions

// This function gets plugged into configureStore under "cart".
export default cartSlice.reducer
