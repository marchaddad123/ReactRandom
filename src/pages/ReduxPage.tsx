import { type FormEvent, useState } from "react"
import { addItem, clearCart, removeItem } from "../redux/cartSlice"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { clearProducts, fetchProducts } from "../redux/productsSlice"
import {
    selectCartCount,
    selectCartItems,
    selectCartLastAction,
    selectProducts,
    selectProductsCount,
    selectProductsError,
    selectProductsStatus
} from "../redux/selectors"

/**
 * LEGACY / REFERENCE ONLY — not linked in the app nav.
 * Live state = Zustand. This page is the full Redux learning example.
 *
 * FULL Redux Toolkit picture (Vuex → RTK):
 *
 * | Vuex        | Redux Toolkit                         |
 * | state       | initialState in each slice            |
 * | mutations   | reducers (sync)                       |
 * | actions     | dispatch(...) + createAsyncThunk      |
 * | getters     | selectors                             |
 * | modules     | slices on one configureStore          |
 *
 * Flow A (sync):  dispatch(addItem) → cart reducer → useAppSelector
 * Flow B (async): dispatch(fetchProducts()) → pending/fulfilled → products slice
 */
export function ReduxPage() {
    // dispatch = "please run this action on the store"
    const dispatch = useAppDispatch()

    // Read state via getters (selectors). Re-render when these change.
    const products = useAppSelector(selectProducts)
    const productsStatus = useAppSelector(selectProductsStatus)
    const productsError = useAppSelector(selectProductsError)
    const productsCount = useAppSelector(selectProductsCount)

    const cartItems = useAppSelector(selectCartItems)
    const cartCount = useAppSelector(selectCartCount)
    const lastAction = useAppSelector(selectCartLastAction)

    const [draft, setDraft] = useState("")

    function handleManualAdd(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        // SYNC ACTION → MUTATION (reducer)
        dispatch(addItem(draft))
        setDraft("")
    }

    return (
        <div className="space-y-4">
            <section className="card">
                <p className="eyebrow">Redux Toolkit — full tour</p>
                <h2>Vuex pieces → RTK</h2>
                <p className="hint">
                    Zustand is still what we&apos;d use day-to-day (Pinia-like).
                    This page shows <strong>all</strong> Redux steps in one
                    place.
                </p>

                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                    <li>
                        <code>productsSlice</code> / <code>cartSlice</code> —
                        state + reducers (+ thunk)
                    </li>
                    <li>
                        <code>store.ts</code> — one store, many modules
                    </li>
                    <li>
                        <code>Provider</code> in <code>main.tsx</code>
                    </li>
                    <li>
                        <code>dispatch</code> — run an action
                    </li>
                    <li>
                        <code>selectors</code> — getters
                    </li>
                    <li>
                        <code>useAppSelector</code> /{" "}
                        <code>useAppDispatch</code> — typed hooks
                    </li>
                </ol>
            </section>

            {/* ========== ASYNC (Vuex action) ========== */}
            <section className="card">
                <h2>1. Async action (thunk) ≈ Vuex action</h2>
                <p className="hint">
                    <code>dispatch(fetchProducts())</code> hits the API, then{" "}
                    <code>extraReducers</code> update state (pending → success /
                    error).
                </p>

                <div className="actions">
                    <button
                        type="button"
                        onClick={() => {
                            void dispatch(fetchProducts())
                        }}
                        disabled={productsStatus === "loading"}
                    >
                        {productsStatus === "loading"
                            ? "Loading…"
                            : "Load products"}
                    </button>
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                            void dispatch(fetchProducts({ fail: true }))
                        }}
                    >
                        Load (force fail)
                    </button>
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => dispatch(clearProducts())}
                    >
                        Clear products
                    </button>
                </div>

                <p className="hint">
                    Status: <code>{productsStatus}</code> · Count:{" "}
                    <code>{productsCount}</code>
                </p>

                {productsError ? (
                    <p className="hint">
                        Error: <code>{productsError}</code>
                    </p>
                ) : null}

                {products.length > 0 ? (
                    <ul className="mt-4 list-none space-y-2 p-0">
                        {products.map((product) => (
                            <li
                                key={product.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                            >
                                <span className="min-w-0 truncate text-sm">
                                    #{product.id} {product.title}
                                </span>
                                <button
                                    type="button"
                                    className="secondary shrink-0"
                                    onClick={() =>
                                        dispatch(addItem(product.title))
                                    }
                                >
                                    Add to cart
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="hint">No products loaded yet.</p>
                )}
            </section>

            {/* ========== SYNC (Vuex mutation) ========== */}
            <section className="card">
                <h2>2. Sync mutation (reducer) ≈ Vuex mutation</h2>
                <p className="hint">
                    <code>dispatch(addItem(...))</code> goes straight into the
                    cart reducer. No API.
                </p>

                <form
                    className="mt-4 flex gap-2"
                    onSubmit={handleManualAdd}
                >
                    <input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Type a cart item…"
                        aria-label="Cart item"
                        className="min-w-0 flex-1"
                    />
                    <button type="submit">Add</button>
                </form>

                <p className="hint">
                    Cart count (getter): <code>{cartCount}</code> · Last:{" "}
                    <code>{lastAction}</code>
                </p>

                <div className="actions">
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => dispatch(clearCart())}
                        disabled={cartItems.length === 0}
                    >
                        Clear cart
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <p className="hint">Cart is empty.</p>
                ) : (
                    <ul className="mt-4 list-none space-y-2 p-0">
                        {cartItems.map((item, index) => (
                            <li
                                key={`${item}-${index}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                            >
                                <span className="min-w-0 truncate">{item}</span>
                                <button
                                    type="button"
                                    className="secondary shrink-0"
                                    onClick={() => dispatch(removeItem(index))}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
