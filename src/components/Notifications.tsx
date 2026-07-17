import {
    CheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline"
import { useRef, type ComponentProps } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { cx } from "../lib/ui"
import {
    type Notification,
    useNotificationStore
} from "../store/useNotificationStore"

type NotificationsProps = {
    alignToContent?: boolean
}

type NotificationTransitionProps = {
    notification: Notification
    onDismiss: (id: number) => void
} & Omit<Partial<ComponentProps<typeof CSSTransition>>, "children">

function NotificationTransition({
    notification,
    onDismiss,
    ...transitionProps
}: NotificationTransitionProps) {
    const nodeRef = useRef<HTMLDivElement>(null)

    return (
        <CSSTransition
            nodeRef={nodeRef}
            timeout={300}
            classNames="notification"
            unmountOnExit
            {...transitionProps}
        >
            <div
                ref={nodeRef}
                className="border-line bg-surface pointer-events-auto flex w-max max-w-[min(24rem,calc(100vw-2rem))] shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm"
            >
                {notification.error === true ? (
                    <ExclamationTriangleIcon className="text-danger h-4 w-4 shrink-0" />
                ) : notification.error === false ? (
                    <CheckIcon className="text-success h-4 w-4 shrink-0" />
                ) : (
                    <InformationCircleIcon className="text-primary h-4 w-4 shrink-0" />
                )}

                <p className="text-ink min-w-0 flex-1 leading-5">
                    {notification.message}
                </p>

                <button
                    type="button"
                    className="text-muted hover:text-ink flex shrink-0 cursor-pointer items-center self-center border-0 bg-transparent p-0 transition-colors"
                    aria-label="Dismiss notification"
                    onClick={() => onDismiss(notification.id)}
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
        </CSSTransition>
    )
}

export function Notifications({ alignToContent = false }: NotificationsProps) {
    const { notifications, removeNotification } = useNotificationStore()

    return (
        <TransitionGroup
            className={cx(
                "pointer-events-none fixed top-[4.5rem] right-4 z-[1000] flex w-auto max-w-96 flex-col items-end gap-2 sm:right-8 sm:max-w-md",
                alignToContent && "absolute top-0 right-0"
            )}
        >
            {notifications.map((notification) => (
                <NotificationTransition
                    key={notification.id}
                    notification={notification}
                    onDismiss={removeNotification}
                />
            ))}
        </TransitionGroup>
    )
}
