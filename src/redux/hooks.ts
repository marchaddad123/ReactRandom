import {
    useDispatch,
    useSelector,
    type TypedUseSelectorHook
} from "react-redux"
import type { AppDispatch, RootState } from "./store"

/**
 * STEP 3 — hooks used in React components.
 *
 * useAppDispatch()
 *   Returns the store's `dispatch` function.
 *   You call: dispatch(addItem("Milk")) or dispatch(fetchProducts())
 *   Like: store.dispatch('fetchProducts') in Vuex, or calling a Pinia action.
 *
 * Why not plain useDispatch()?
 *   Plain one is loosely typed. useAppDispatch knows AppDispatch
 *   (including async thunks), so TypeScript helps you.
 *
 * useAppSelector(selector)
 *   Reads a piece of state (and re-renders when that piece changes).
 *   Like a Vuex getter / storeToRefs read.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
