import {
    CheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline"
import { useRef, type ComponentProps } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"
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
        // TransitionGroup injects `in` / callbacks — must forward them here
        // or leave animations never run and toasts stack forever.
        <CSSTransition
            nodeRef={nodeRef}
            timeout={300}
            classNames="notification"
            unmountOnExit
            {...transitionProps}
        >
            <div
                ref={nodeRef}
                className="notification-card pointer-events-auto flex w-max max-w-[min(24rem,calc(100vw-2rem))] shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
            >
                {notification.error === true ? (
                    <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-red-600" />
                ) : notification.error === false ? (
                    <CheckIcon className="h-4 w-4 shrink-0 text-green-600" />
                ) : (
                    <InformationCircleIcon className="h-4 w-4 shrink-0 text-blue-600" />
                )}

                <p className="min-w-0 flex-1 leading-5 text-gray-700">
                    {notification.message}
                </p>

                <button
                    type="button"
                    className="notification-dismiss flex shrink-0 items-center self-center text-gray-500 transition-colors hover:text-gray-900"
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
            className={[
                "notifications-stack",
                alignToContent ? "notifications-stack--align-content" : ""
            ]
                .filter(Boolean)
                .join(" ")}
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
