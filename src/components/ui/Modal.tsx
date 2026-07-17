import { Transition, TransitionChild } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import Hammer from "hammerjs"
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { cx } from "../../lib/ui"

export type ModalProps = {
    title?: string
    children?: ReactNode
    footer?: ReactNode
    animateBeforeClosing?: boolean
    onAnimateBeforeClosingChange?: (value: boolean) => void
    subModal?: boolean
    hideCloseIcon?: boolean
    center?: boolean
    removeHeader?: boolean
    customClass?: string
    customCloseIconClass?: string
    isGetQuoteModal?: boolean
    onClosing: () => void
    onClickOutside?: () => void
}

/**
 * Port of Nuxt Modal.vue — bottom-sheet style overlay with slide-up transition.
 * Hammer pan-down on the header to dismiss (same as Nuxt).
 */
export function Modal({
    title = "",
    children,
    footer,
    animateBeforeClosing = false,
    onAnimateBeforeClosingChange,
    subModal = false,
    hideCloseIcon = false,
    center = false,
    removeHeader = false,
    customClass = "max-w-screen-lg",
    customCloseIconClass = "",
    isGetQuoteModal = false,
    onClosing,
    onClickOutside
}: ModalProps) {
    const [showContent, setShowContent] = useState(true)
    const [transformPercentage, setTransformPercentage] = useState(0)
    const transformRef = useRef(0)
    const modalRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animateBeforeClosing])

    useEffect(() => {
        const root = modalRef.current
        if (!root) return

        function handleEscKey(event: KeyboardEvent) {
            if (event.key === "Escape") beginClose()
        }

        root.addEventListener("keydown", handleEscKey)
        // Focus so Escape works without clicking first
        root.focus()
        return () => root.removeEventListener("keydown", handleEscKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        function handlePointerDown(event: MouseEvent | TouchEvent) {
            const panel = contentRef.current
            if (!panel || isClosing.current) return
            const target = event.target
            if (!(target instanceof Node)) return
            if (!panel.contains(target)) beginClose()
        }

        document.addEventListener("mousedown", handlePointerDown)
        document.addEventListener("touchstart", handlePointerDown)
        return () => {
            document.removeEventListener("mousedown", handlePointerDown)
            document.removeEventListener("touchstart", handlePointerDown)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (removeHeader) return
        const header = headerRef.current
        const panel = contentRef.current
        if (!header || !panel) return

        const mc = new Hammer.Manager(header, {
            recognizers: [
                [
                    Hammer.Pan,
                    {
                        direction: Hammer.DIRECTION_VERTICAL,
                        pointers: 0,
                        threshold: 0
                    }
                ]
            ]
        })

        mc.on("pan", (event) => {
            const next = (100 * event.deltaY) / window.innerHeight
            transformRef.current = next
            setTransformPercentage(next)
        })

        mc.on("panend", (event) => {
            const current = transformRef.current
            if (current > 50 || event.velocityY > 1) {
                beginClose()
                return
            }
            panel.classList.add("is_animating")
            transformRef.current = 0
            setTransformPercentage(0)
            setTimeout(() => {
                panel.classList.remove("is_animating")
            }, 200)
        })

        return () => {
            mc.destroy()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [removeHeader])

    // Portal to body — parent panels use transform (animate-rise), which
    // would otherwise trap position:fixed and clip the overlay.
    return createPortal(
        <Transition
            appear
            show={showContent}
            as={Fragment}
        >
            <div
                ref={modalRef}
                className="relative z-40 outline-none"
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
                        className={cx(
                            "fixed inset-0 bg-black/50",
                            isGetQuoteModal && "backdrop-blur-[10px]"
                        )}
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
                        "fixed top-0 left-0 h-full w-full scrollbar-none overflow-hidden",
                        subModal ? "z-[41] block h-full filter-none" : "z-40",
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
                            ref={contentRef}
                            data-cy="modal-content"
                            className={cx(
                                "content relative mx-auto mt-auto flex max-h-[calc(100%-2rem)] w-full flex-col overflow-hidden border border-gray-200 shadow sm:my-8 sm:max-h-[calc(100%-4rem)] sm:w-[calc(100%-2rem)]",
                                customClass
                            )}
                            style={{
                                transform: `translateY(${transformPercentage}vh)`
                            }}
                            role="dialog"
                            aria-modal="true"
                        >
                            {!removeHeader ? (
                                <div
                                    ref={headerRef}
                                    className="relative flex w-full cursor-move items-center justify-between border-b border-b-gray-300 bg-transparent bg-white p-4"
                                >
                                    <h2 className="m-0 border-0 p-0 text-xl leading-5 font-bold">
                                        {title}
                                    </h2>
                                    <XMarkIcon
                                        className={cx(
                                            "h-6 w-6 cursor-pointer text-gray-600 transition-all duration-300 hover:rotate-180 hover:text-black",
                                            hideCloseIcon && "hidden"
                                        )}
                                        onClick={beginClose}
                                    />
                                </div>
                            ) : null}

                            {removeHeader && !hideCloseIcon ? (
                                <XMarkIcon
                                    className={cx(
                                        "fixed z-[999] h-6 w-6 cursor-pointer rounded-full bg-white/50 text-gray-600 backdrop-blur-md transition-all duration-300 hover:rotate-180",
                                        customCloseIconClass
                                    )}
                                    onClick={beginClose}
                                />
                            ) : null}

                            <div
                                className={cx(
                                    "min-h-0 w-full flex-1 overflow-y-auto overscroll-contain bg-white",
                                    !removeHeader && "max-h-[calc(100%-3rem)]"
                                )}
                            >
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
