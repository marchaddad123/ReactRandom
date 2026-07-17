import type { RootState } from "./store"

/**
 * STEP 4 — selectors ≈ Vuex getters.
 *
 * Instead of writing state.cart.items everywhere in the UI,
 * put the "how to read it" here once.
 *
 * RootState is the full store shape (see store.ts).
 */
export const selectCartItems = (state: RootState) => state.cart.items

export const selectCartLastAction = (state: RootState) => state.cart.lastAction

export const selectCartCount = (state: RootState) => state.cart.items.length

export const selectProducts = (state: RootState) => state.products.list

export const selectProductsStatus = (state: RootState) => state.products.status

export const selectProductsError = (state: RootState) => state.products.error

export const selectProductsCount = (state: RootState) =>
    state.products.list.length
