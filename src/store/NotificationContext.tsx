import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState
} from "react"

export type NotificationInput = {
    message: string
    /** true = error, false = success, omitted/undefined = info */
    error?: boolean
}

export type Notification = NotificationInput & {
    id: number
}

type NotificationContextValue = {
    notifications: Notification[]
    updateNotification: (newNotification: NotificationInput | null) => void
    removeNotification: (id: number) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const AUTO_HIDE_MS = 2500

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const idCounterRef = useRef(0)
    const hideTimersRef = useRef<Map<number, number>>(new Map())

    const removeNotification = useCallback((id: number) => {
        const timer = hideTimersRef.current.get(id)
        if (timer !== undefined) {
            window.clearTimeout(timer)
            hideTimersRef.current.delete(id)
        }

        setNotifications((current) =>
            current.filter((notification) => notification.id !== id)
        )
    }, [])

    const updateNotification = useCallback(
        (newNotification: NotificationInput | null) => {
            // `null` clears everything (like your Pinia action).
            if (newNotification === null) {
                hideTimersRef.current.forEach((timer) => {
                    window.clearTimeout(timer)
                })
                hideTimersRef.current.clear()
                setNotifications([])
                return
            }

            const id = ++idCounterRef.current
            setNotifications((current) => [
                ...current,
                { ...newNotification, id }
            ])

            const timer = window.setTimeout(() => {
                removeNotification(id)
            }, AUTO_HIDE_MS)
            hideTimersRef.current.set(id, timer)
        },
        [removeNotification]
    )

    const value = useMemo(
        () => ({
            notifications,
            updateNotification,
            removeNotification
        }),
        [notifications, updateNotification, removeNotification]
    )

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        )
    }

    return context
}
