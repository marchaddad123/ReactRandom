import { Transition, TransitionChild } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import {
    Fragment,
    useEffect,
    useId,
    useRef,
    useState,
    type ReactNode
} from "react"
import { createPortal } from "react-dom"
import { cx } from "../../lib/ui"

export type ModalProps = {
    title?: string
    /** Richer header than `title` (overrides title text). */
    titleSlot?: ReactNode
    children?: ReactNode
    footer?: ReactNode
    /** Parent sets true to play leave animation, then we emit onClosing. */
    animateBeforeClosing?: boolean
    onAnimateBeforeClosingChange?: (value: boolean) => void
    hideCloseIcon?: boolean
    center?: boolean
    removeHeader?: boolean
    customClass?: string
    customCloseIconClass?: string
    onClosing: () => void
    onClickOutside?: () => void
}

/**
 * Port of Nuxt Modal — bottom-sheet slide-up with Headless UI transitions.
 * Mount when open: `{open && <Modal onClosing={() => setOpen(false)} />}`.
 */
export function Modal({
    title = "",
    titleSlot,
    children,
    footer,
    animateBeforeClosing = false,
    onAnimateBeforeClosingChange,
    hideCloseIcon = false,
    center = false,
    removeHeader = false,
    customClass = "max-w-xl",
    customCloseIconClass = "",
    onClosing,
    onClickOutside
}: ModalProps) {
    const titleId = useId()
    const [showContent, setShowContent] = useState(true)
    const modalRef = useRef<HTMLDivElement>(null)
    const isClosing = useRef(false)
    const closingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    function beginClose() {
        if (isClosing.current) return
        isClosing.current = true
        onClickOutside?.()
        setShowContent(false)
        closingTimer.current = setTimeout(() => {
            onClosing()
        }, 300)
    }

    useEffect(() => {
        return () => {
            if (closingTimer.current) clearTimeout(closingTimer.current)
        }
    }, [])

    useEffect(() => {
        if (!animateBeforeClosing) return
        onAnimateBeforeClosingChange?.(false)
        beginClose()
        // eslint-disable-next-line react-hooks/exhaustive-deps -- close once when flag flips
    }, [animateBeforeClosing])

    useEffect(() => {
        const root = modalRef.current
        if (!root) return

        function handleEscKey(event: KeyboardEvent) {
            if (event.key === "Escape") beginClose()
        }

        root.addEventListener("keydown", handleEscKey)
        root.focus()
        return () => root.removeEventListener("keydown", handleEscKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- stable close
    }, [])

    return createPortal(
        <Transition
            appear
            show={showContent}
            as={Fragment}
        >
            <div
                ref={modalRef}
                className="relative z-[80] outline-none"
                data-modal-ui=""
                tabIndex={-1}
            >
                <TransitionChild
                    as={Fragment}
                    enter="duration-300 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="duration-300 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-black/50"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                beginClose()
                            }
                        }}
                        onTouchStart={(event) => {
                            if (event.target === event.currentTarget) {
                                beginClose()
                            }
                        }}
                        onClick={(event) => {
                            if (event.target === event.currentTarget) {
                                beginClose()
                            }
                        }}
                    />
                </TransitionChild>

                <div
                    className={cx(
                        "fixed top-0 left-0 z-[80] h-full w-full overflow-hidden",
                        center && "flex flex-col items-center justify-center"
                    )}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="duration-300 ease-modal-cubic"
                        enterFrom="opacity-0 translate-y-[calc(100vh-1.5rem)]"
                        enterTo="opacity-100 translate-y-0"
                        leave="duration-300 ease-out"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-[calc(100vh-1.5rem)]"
                    >
                        <div
                            data-cy="modal-content"
                            className={cx(
                                "border-line bg-surface relative mx-auto mt-auto flex max-h-[calc(100%-2rem)] w-full flex-col overflow-hidden rounded-t-2xl border shadow-xl sm:my-8 sm:max-h-[calc(100%-4rem)] sm:w-[calc(100%-2rem)] sm:rounded-2xl",
                                customClass
                            )}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={removeHeader ? undefined : titleId}
                        >
                            {!removeHeader ? (
                                <div className="border-line relative flex w-full shrink-0 items-start justify-between gap-3 border-b px-5 py-4 sm:px-6">
                                    <div
                                        id={titleId}
                                        className="min-w-0 flex-1"
                                    >
                                        {titleSlot ?? (
                                            <h2 className="font-display text-ink m-0 text-xl leading-snug font-medium tracking-tight">
                                                {title}
                                            </h2>
                                        )}
                                    </div>
                                    {!hideCloseIcon ? (
                                        <button
                                            type="button"
                                            className="text-muted hover:text-ink inline-flex shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-1.5 transition-all duration-300 hover:rotate-180"
                                            aria-label="Close"
                                            onClick={beginClose}
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}

                            {removeHeader && !hideCloseIcon ? (
                                <button
                                    type="button"
                                    className={cx(
                                        "text-muted hover:text-ink bg-surface/80 absolute top-3 right-3 z-10 inline-flex cursor-pointer rounded-full border-0 p-1.5 backdrop-blur-md transition-all duration-300 hover:rotate-180",
                                        customCloseIconClass
                                    )}
                                    aria-label="Close"
                                    onClick={beginClose}
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            ) : null}

                            <div className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
                                {children}
                            </div>

                            {footer}
                        </div>
                    </TransitionChild>
                </div>
            </div>
        </Transition>,
        document.body
    )
}
