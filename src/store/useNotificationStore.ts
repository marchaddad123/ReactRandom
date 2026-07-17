import { create } from "zustand"

export type NotificationInput = {
    message: string
    /** true = error, false = success, omitted/undefined = info */
    error?: boolean
}

export type Notification = NotificationInput & {
    id: number
}

type NotificationState = {
    notifications: Notification[]
    updateNotification: (newNotification: NotificationInput | null) => void
    removeNotification: (id: number) => void
}

const AUTO_HIDE_MS = 2500

// Module-level (outside React) — same idea as refs in the Context version.
let notificationIdCounter = 0
const hideTimers = new Map<number, number>()

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],

    removeNotification: (id) => {
        const timer = hideTimers.get(id)
        if (timer !== undefined) {
            window.clearTimeout(timer)
            hideTimers.delete(id)
        }

        set((state) => ({
            notifications: state.notifications.filter(
                (notification) => notification.id !== id
            )
        }))
    },

    updateNotification: (newNotification) => {
        // `null` = clear every toast.
        if (newNotification === null) {
            hideTimers.forEach((timer) => {
                window.clearTimeout(timer)
            })
            hideTimers.clear()
            set({ notifications: [] })
            return
        }

        const id = ++notificationIdCounter
        set((state) => ({
            notifications: [...state.notifications, { ...newNotification, id }]
        }))

        const timer = window.setTimeout(() => {
            get().removeNotification(id)
        }, AUTO_HIDE_MS)
        hideTimers.set(id, timer)
    }
}))
