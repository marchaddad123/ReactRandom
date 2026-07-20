import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { type InputHTMLAttributes, useId, useState } from "react"
import { cx, ui } from "../lib/ui"

type PasswordFieldProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "className"
> & {
    label?: string
    inputClassName?: string
}

/**
 * Password input with a show/hide eye button.
 * Starts hidden (type="password"); click the eye to reveal the text.
 */
export function PasswordField({
    label = "Password",
    inputClassName,
    id,
    ...inputProps
}: PasswordFieldProps) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const [visible, setVisible] = useState(false)

    return (
        <label
            className={ui.fieldLabel}
            htmlFor={inputId}
        >
            {label}
            <div className="relative mt-1.5">
                <input
                    {...inputProps}
                    id={inputId}
                    type={visible ? "text" : "password"}
                    className={cx(ui.field, "mt-0 pr-12", inputClassName)}
                />
                <button
                    type="button"
                    className="text-muted hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 transition-colors"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                >
                    {visible ? (
                        <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                        <EyeIcon className="h-5 w-5" />
                    )}
                </button>
            </div>
        </label>
    )
}
