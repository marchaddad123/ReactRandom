import { type FormEvent, useState } from "react"
import { cx, ui } from "../lib/ui"
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
 */
export function ReduxPage() {
    const dispatch = useAppDispatch()

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
        dispatch(addItem(draft))
        setDraft("")
    }

    return (
        <div className="space-y-4">
            <section className={ui.panel}>
                <p className={ui.eyebrow}>Redux Toolkit — full tour</p>
                <h2 className={ui.title}>Vuex pieces → RTK</h2>
                <p className={ui.hint}>
                    Zustand is still what we&apos;d use day-to-day (Pinia-like).
                    This page shows <strong>all</strong> Redux steps in one
                    place.
                </p>

                <ol className="text-muted mt-4 list-decimal space-y-2 pl-5 text-sm">
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

            <section className={ui.panel}>
                <h2 className={ui.title}>
                    1. Async action (thunk) ≈ Vuex action
                </h2>
                <p className={ui.hint}>
                    <code>dispatch(fetchProducts())</code> hits the API, then{" "}
                    <code>extraReducers</code> update state (pending → success /
                    error).
                </p>

                <div className={ui.actions}>
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnPrimary)}
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
                        className={cx(ui.btn, ui.btnTertiary)}
                        onClick={() => {
                            void dispatch(fetchProducts({ fail: true }))
                        }}
                    >
                        Load (force fail)
                    </button>
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnTertiary)}
                        onClick={() => dispatch(clearProducts())}
                    >
                        Clear products
                    </button>
                </div>

                <p className={ui.hint}>
                    Status: <code>{productsStatus}</code> · Count:{" "}
                    <code>{productsCount}</code>
                </p>

                {productsError ? (
                    <p className={ui.hint}>
                        Error: <code>{productsError}</code>
                    </p>
                ) : null}

                {products.length > 0 ? (
                    <ul className="mt-4 list-none space-y-2 p-0">
                        {products.map((product) => (
                            <li
                                key={product.id}
                                className="border-line flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                            >
                                <span className="min-w-0 truncate text-sm">
                                    #{product.id} {product.title}
                                </span>
                                <button
                                    type="button"
                                    className={cx(
                                        ui.btn,
                                        ui.btnTertiary,
                                        "shrink-0"
                                    )}
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
                    <p className={ui.hint}>No products loaded yet.</p>
                )}
            </section>

            <section className={ui.panel}>
                <h2 className={ui.title}>
                    2. Sync mutation (reducer) ≈ Vuex mutation
                </h2>
                <p className={ui.hint}>
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
                        className={cx(ui.field, "!mt-0 min-w-0 flex-1")}
                    />
                    <button
                        type="submit"
                        className={cx(ui.btn, ui.btnPrimary)}
                    >
                        Add
                    </button>
                </form>

                <p className={ui.hint}>
                    Cart count (getter): <code>{cartCount}</code> · Last:{" "}
                    <code>{lastAction}</code>
                </p>

                <div className={ui.actions}>
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnTertiary)}
                        onClick={() => dispatch(clearCart())}
                        disabled={cartItems.length === 0}
                    >
                        Clear cart
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <p className={ui.hint}>Cart is empty.</p>
                ) : (
                    <ul className="mt-4 list-none space-y-2 p-0">
                        {cartItems.map((item, index) => (
                            <li
                                key={`${item}-${index}`}
                                className="border-line flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                            >
                                <span className="min-w-0 truncate">{item}</span>
                                <button
                                    type="button"
                                    className={cx(
                                        ui.btn,
                                        ui.btnTertiary,
                                        "shrink-0"
                                    )}
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
