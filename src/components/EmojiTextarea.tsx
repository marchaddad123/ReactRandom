import { FaceSmileIcon } from "@heroicons/react/24/outline"
import "emoji-picker-element"
import {
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type TextareaHTMLAttributes
} from "react"
import { createPortal } from "react-dom"
import { cx, ui } from "../lib/ui"

type EmojiClickDetail = {
    unicode?: string
    emoji?: { unicode?: string }
}

type EmojiTextareaProps = Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
> & {
    value: string
    onChange: (value: string) => void
    /** Hard cap (e.g. post max length). Extra emoji that would overflow is ignored. */
    maxLength?: number
}

type PickerCoords = {
    top: number
    left: number
}

/**
 * Textarea + emoji-picker-element.
 * Picker is portaled to document.body (fixed) so sibling panels cannot cover it.
 * Open/close + position are set from events (no setState inside effects).
 */
export function EmojiTextarea({
    value,
    onChange,
    maxLength,
    className,
    id,
    ...textareaProps
}: EmojiTextareaProps) {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const pickerShellRef = useRef<HTMLDivElement>(null)
    // null = closed; object = open at these fixed coords
    const [coords, setCoords] = useState<PickerCoords | null>(null)
    const open = coords !== null

    function getPickerCoords(): PickerCoords | null {
        const button = buttonRef.current
        if (!button) return null

        const rect = button.getBoundingClientRect()
        const gap = 6
        const pickerWidth = Math.min(296, window.innerWidth - 16)
        const pickerHeight = Math.min(264, window.innerHeight * 0.45)
        const spaceBelow = window.innerHeight - rect.bottom
        const placeBelow = spaceBelow >= pickerHeight + gap + 8

        let left = rect.right - pickerWidth
        left = Math.max(8, Math.min(left, window.innerWidth - pickerWidth - 8))

        const top = placeBelow
            ? rect.bottom + gap
            : Math.max(8, rect.top - gap - pickerHeight)

        return { top, left }
    }

    function openPicker() {
        const next = getPickerCoords()
        if (next) setCoords(next)
    }

    function closePicker() {
        setCoords(null)
    }

    function togglePicker() {
        if (open) closePicker()
        else openPicker()
    }

    useEffect(() => {
        if (!open) return

        function onReposition() {
            const next = getPickerCoords()
            if (next) setCoords(next)
        }

        window.addEventListener("resize", onReposition)
        window.addEventListener("scroll", onReposition, true)
        return () => {
            window.removeEventListener("resize", onReposition)
            window.removeEventListener("scroll", onReposition, true)
        }
    }, [open])

    useEffect(() => {
        if (!open) return

        function onPointerDown(event: MouseEvent | TouchEvent) {
            const target = event.target as Node | null
            if (!target) return
            if (buttonRef.current?.contains(target)) return
            if (pickerShellRef.current?.contains(target)) return
            closePicker()
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") closePicker()
        }

        document.addEventListener("mousedown", onPointerDown)
        document.addEventListener("touchstart", onPointerDown)
        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.removeEventListener("mousedown", onPointerDown)
            document.removeEventListener("touchstart", onPointerDown)
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        const picker = pickerShellRef.current?.querySelector("emoji-picker")
        if (!picker) return

        function onEmojiClick(event: Event) {
            const detail = (event as CustomEvent<EmojiClickDetail>).detail
            const emoji = detail.unicode ?? detail.emoji?.unicode
            if (!emoji || !textareaRef.current) return

            const next = insertAtCaret(textareaRef.current, value, emoji)
            if (maxLength !== undefined && next.value.length > maxLength) {
                return
            }

            onChange(next.value)
            requestAnimationFrame(() => {
                const el = textareaRef.current
                if (!el) return
                el.focus()
                el.setSelectionRange(next.caret, next.caret)
            })
        }

        picker.addEventListener("emoji-click", onEmojiClick)
        return () => picker.removeEventListener("emoji-click", onEmojiClick)
    }, [open, value, onChange, maxLength])

    const pickerStyle: CSSProperties | undefined = coords
        ? { top: coords.top, left: coords.left }
        : undefined

    return (
        <div className="relative">
            <textarea
                {...textareaProps}
                id={textareaId}
                ref={textareaRef}
                value={value}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                className={cx(ui.field, "min-h-28 resize-y pr-12", className)}
            />

            <button
                ref={buttonRef}
                type="button"
                className="text-muted hover:text-ink absolute top-2.5 right-2.5 z-20 flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1.5 transition-colors"
                aria-label={open ? "Hide emoji picker" : "Show emoji picker"}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={togglePicker}
            >
                <FaceSmileIcon className="h-5 w-5" />
            </button>

            {coords
                ? createPortal(
                      <div
                          ref={pickerShellRef}
                          role="dialog"
                          aria-label="Emoji picker"
                          className="emoji-picker-shell border-line bg-surface fixed z-[2000] overflow-hidden rounded-xl border shadow-lg"
                          style={pickerStyle}
                      >
                          <emoji-picker className="emoji-picker-el" />
                      </div>,
                      document.body
                  )
                : null}
        </div>
    )
}

function insertAtCaret(
    textarea: HTMLTextAreaElement,
    current: string,
    insert: string
) {
    const start = textarea.selectionStart ?? current.length
    const end = textarea.selectionEnd ?? current.length
    const value = current.slice(0, start) + insert + current.slice(end)
    return { value, caret: start + insert.length }
}
