import { Transition, TransitionChild } from "@headlessui/react"
import {
    ArrowRightStartOnRectangleIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline"
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { cx } from "../../lib/ui"

export type DialogPanelSize = "default" | "2xl" | "3xl" | "wide"

export type DialogUIProps = {
    title?: string
    titleSlot?: ReactNode
    children?: ReactNode
    danger?: boolean
    checkmark?: boolean
    icon?: "" | "logout"
    customClass?: string
    panelSize?: DialogPanelSize
    notCloseable?: boolean
    animateBeforeClosing?: boolean
    onAnimateBeforeClosingChange?: (value: boolean) => void
    onClosing: () => void
    onClickOutside?: () => void
    onMounted?: () => void
}

const panelSizeClass: Record<DialogPanelSize, string> = {
    wide: "max-h-[min(90dvh,52rem)] max-w-[min(96rem,calc(100vw-2rem))]",
    "3xl": "max-h-[min(90dvh,52rem)] max-w-3xl",
    "2xl": "max-h-[min(90dvh,52rem)] max-w-2xl",
    default: "max-h-[min(80dvh,42rem)] max-w-lg"
}

function bgAccent(danger: boolean | undefined) {
    if (danger === true) return "bg-red-100"
    if (danger === false) return "bg-green-100"
    return "bg-blue-100"
}

/**
 * Port of Nuxt DialogUI.vue — same TransitionRoot / TransitionChild structure.
 *
 * Nuxt uses `<DialogPanel as="template">` so scale/opacity run on the inner
 * `.content` div (not a Headless wrapper). We mirror that + portal to body
 * (same as Modal) so fixed overlays aren't clipped by parent transforms.
 */
export function DialogUI({
    title = "",
    titleSlot,
    children,
    danger,
    checkmark = false,
    icon = "",
    customClass = "",
    panelSize = "default",
    notCloseable = false,
    animateBeforeClosing = false,
    onAnimateBeforeClosingChange,
    onClosing,
    onClickOutside,
    onMounted
}: DialogUIProps) {
    const [showContent, setShowContent] = useState(true)
    const rootRef = useRef<HTMLDivElement>(null)
    const initialFocusTarget = useRef<HTMLButtonElement>(null)
    const isClosing = useRef(false)
    const closingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        onMounted?.()
        initialFocusTarget.current?.focus()
        return () => {
            if (closingTimer.current) clearTimeout(closingTimer.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
    }, [])

    useEffect(() => {
        if (!animateBeforeClosing) return
        onAnimateBeforeClosingChange?.(false)
        beginClose()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animateBeforeClosing])

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        function handleEscKey(event: KeyboardEvent) {
            if (event.key === "Escape") beginClose()
        }

        root.addEventListener("keydown", handleEscKey)
        return () => root.removeEventListener("keydown", handleEscKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function beginClose() {
        if (notCloseable || isClosing.current) return
        isClosing.current = true
        // Nuxt: show_content = false, then emit("closing") after leave (200ms)
        setShowContent(false)
        closingTimer.current = setTimeout(() => {
            onClosing()
        }, 200)
    }

    function closeFromBackdrop() {
        onClickOutside?.()
        beginClose()
    }

    const showAccent = danger !== undefined || checkmark

    return createPortal(
        <Transition
            appear
            show={showContent}
            as={Fragment}
        >
            <div
                ref={rootRef}
                className="removeOverflow relative z-40 outline-none"
                data-dialog-ui=""
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-ui-title"
                tabIndex={-1}
            >
                {/* Backdrop — Nuxt TransitionChild opacity only */}
                <TransitionChild
                    as={Fragment}
                    enter="duration-300 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="duration-200 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-black/50"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeFromBackdrop()
                            }
                        }}
                        onTouchStart={(event) => {
                            if (event.target === event.currentTarget) {
                                closeFromBackdrop()
                            }
                        }}
                    />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden p-4 sm:p-8">
                    <div className="flex h-full w-full items-center justify-center">
                        {/*
                          Nuxt: TransitionChild wraps DialogPanel as="template",
                          so these classes apply to the inner .content div.
                        */}
                        <TransitionChild
                            as={Fragment}
                            enter="duration-300 ease-out"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div
                                className={cx(
                                    "content relative flex w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white",
                                    panelSizeClass[panelSize],
                                    customClass
                                )}
                            >
                                <button
                                    ref={initialFocusTarget}
                                    type="button"
                                    className="sr-only"
                                    tabIndex={-1}
                                    aria-hidden="true"
                                />
                                <div
                                    id="dialog-ui-title"
                                    className="flex shrink-0 cursor-move items-center space-x-4 border-b border-gray-100 px-6 pt-6 pb-4"
                                >
                                    {showAccent ? (
                                        <div
                                            className={cx(
                                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
                                                bgAccent(danger)
                                            )}
                                        >
                                            {icon === "logout" ? (
                                                <ArrowRightStartOnRectangleIcon className="size-6 text-red-600" />
                                            ) : danger ? (
                                                <ExclamationTriangleIcon
                                                    className="h-6 w-6 text-red-600"
                                                    aria-hidden="true"
                                                />
                                            ) : checkmark ? (
                                                <CheckIcon
                                                    className="h-6 w-6 text-green-600"
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                        </div>
                                    ) : null}
                                    <div className="flex flex-1 items-center justify-between space-x-2">
                                        {titleSlot ?? (
                                            <span className="line-clamp-1 flex-1 text-left font-medium">
                                                {title}
                                            </span>
                                        )}
                                        {!notCloseable ? (
                                            <XMarkIcon
                                                className="size-5 cursor-pointer text-gray-600 transition-all duration-300 hover:rotate-180 hover:text-black"
                                                onClick={beginClose}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 pb-6 sm:text-left">
                                    {children}
                                </div>
                            </div>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Transition>,
        document.body
    )
}
