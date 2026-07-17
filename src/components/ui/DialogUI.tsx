import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild
} from "@headlessui/react"
import {
    ArrowRightStartOnRectangleIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline"
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react"
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
    /** Parent sets true to play leave animation, then we emit onClosing */
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
 * Port of Nuxt DialogUI.vue (Headless UI Dialog + transitions).
 * Parent typically: `{open && <DialogUI onClosing={() => setOpen(false)} />}`
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
    const initialFocusTarget = useRef<HTMLButtonElement>(null)
    const isClosing = useRef(false)
    const closingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        onMounted?.()
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

    function beginClose() {
        if (notCloseable || isClosing.current) return
        isClosing.current = true
        setShowContent(false)
        closingTimer.current = setTimeout(() => {
            onClosing()
        }, 300)
    }

    function handleDialogClose() {
        onClickOutside?.()
        beginClose()
    }

    const showAccent = danger !== undefined || checkmark

    return (
        <Transition
            appear
            show={showContent}
            as={Fragment}
        >
            <Dialog
                as="div"
                className="removeOverflow relative z-40"
                data-dialog-ui=""
                open={showContent}
                initialFocus={initialFocusTarget}
                onClose={handleDialogClose}
            >
                <TransitionChild
                    as={Fragment}
                    enter="duration-500 ease-out"
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
                    />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden p-4 sm:p-8">
                    <div className="flex h-full w-full items-center justify-center">
                        <TransitionChild
                            as={Fragment}
                            enter="duration-500 ease-out"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="duration-300 ease-in"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel
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
                                <DialogTitle as="div">
                                    <div className="flex shrink-0 cursor-move items-center space-x-4 border-b border-gray-100 px-6 pt-6 pb-4">
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
                                </DialogTitle>
                                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 pb-6 sm:text-left">
                                    {children}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
