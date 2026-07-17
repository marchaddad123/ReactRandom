import { configureStore } from "@reduxjs/toolkit"
import cartReducer from "./cartSlice"
import productsReducer from "./productsSlice"

/**
 * LEGACY / REFERENCE ONLY — not wired in main.tsx anymore.
 * Live app state uses Zustand (`src/store/use*Store.ts`).
 * Keep this folder to re-read Redux / Vuex mapping later.
 *
 * To try the demo again:
 * 1) Wrap app in <Provider store={reduxStore}>
 * 2) Add ReduxPage back to App routes
 *
 * STEP 1 — ONE store for the whole app.
 * configureStore({ reducer: { ... } })
 *   keys  = names on the big state object (state.cart, state.products)
 *   values = slice reducers (the update rules for that piece)
 */
export const reduxStore = configureStore({
    reducer: {
        cart: cartReducer,
        products: productsReducer
    }
})

/**
 * RootState = TypeScript type of the FULL state object.
 *
 * Meaning of this line:
 *   reduxStore.getState  → function that returns current state
 *   typeof ...           → TypeScript type of that function
 *   ReturnType<...>      → what that function returns
 *
 * So RootState ≈ {
 *   cart: { items, lastAction },
 *   products: { list, status, error }
 * }
 *
 * Used by selectors and useAppSelector so autocomplete works.
 */
export type RootState = ReturnType<typeof reduxStore.getState>

/**
 * AppDispatch = type of dispatch that knows about our thunks too
 * (not only plain sync actions).
 */
export type AppDispatch = typeof reduxStore.dispatch
