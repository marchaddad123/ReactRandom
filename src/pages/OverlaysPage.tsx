import { useState } from "react"
import { DialogUI } from "../components/ui/DialogUI"
import { Modal } from "../components/ui/Modal"
import { cx, ui } from "../lib/ui"

export function OverlaysPage() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dangerDialogOpen, setDangerDialogOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [animateDialogClosed, setAnimateDialogClosed] = useState(false)
    const [animateDangerClosed, setAnimateDangerClosed] = useState(false)

    return (
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>Headless UI ports</p>
            <h2 className={ui.title}>DialogUI & Modal</h2>
            <p className={ui.lede}>
                React ports of your Nuxt <code>DialogUI.vue</code> and{" "}
                <code>Modal.vue</code> — same structure, transitions, and close
                flow (<code>show_content</code> → leave → <code>onClosing</code>
                ).
            </p>

            <div className={ui.actions}>
                <button
                    type="button"
                    className={cx(ui.btn, ui.btnPrimary)}
                    onClick={() => setDialogOpen(true)}
                >
                    Open DialogUI
                </button>
                <button
                    type="button"
                    className={cx(ui.btn, ui.btnSecondary)}
                    onClick={() => setDangerDialogOpen(true)}
                >
                    Danger dialog
                </button>
                <button
                    type="button"
                    className={cx(ui.btn, ui.btnTertiary)}
                    onClick={() => setModalOpen(true)}
                >
                    Open Modal
                </button>
            </div>

            {dialogOpen ? (
                <DialogUI
                    title="Centered dialog"
                    panelSize="default"
                    animateBeforeClosing={animateDialogClosed}
                    onAnimateBeforeClosingChange={setAnimateDialogClosed}
                    onClosing={() => setDialogOpen(false)}
                >
                    <p className="m-0 text-sm text-gray-700">
                        Same panel layout as Nuxt: header, scroll body, backdrop
                        fade + scale. Close via X, backdrop, or Escape.
                    </p>
                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            className={cx(ui.btn, ui.btnTertiary)}
                            onClick={() => setAnimateDialogClosed(true)}
                        >
                            Close via animateBeforeClosing
                        </button>
                    </div>
                </DialogUI>
            ) : null}

            {dangerDialogOpen ? (
                <DialogUI
                    title="Delete this item?"
                    danger
                    panelSize="default"
                    animateBeforeClosing={animateDangerClosed}
                    onAnimateBeforeClosingChange={setAnimateDangerClosed}
                    onClosing={() => setDangerDialogOpen(false)}
                >
                    <p className="m-0 text-sm text-gray-700">
                        Danger accent + warning icon — matches Nuxt{" "}
                        <code>danger</code> prop.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            className={cx(ui.btn, ui.btnTertiary)}
                            onClick={() => setAnimateDangerClosed(true)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={cx(ui.btn, ui.btnPrimary)}
                            onClick={() => setAnimateDangerClosed(true)}
                        >
                            Delete
                        </button>
                    </div>
                </DialogUI>
            ) : null}

            {modalOpen ? (
                <Modal
                    title="Sheet modal"
                    customClass="max-w-screen-lg bg-white"
                    onClosing={() => setModalOpen(false)}
                    footer={
                        <div className="flex justify-end gap-2 border-t border-gray-200 bg-white p-4">
                            <button
                                type="button"
                                className={cx(ui.btn, ui.btnTertiary)}
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={cx(ui.btn, ui.btnPrimary)}
                                onClick={() => setModalOpen(false)}
                            >
                                Confirm
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-3 p-4 text-sm text-gray-700">
                        <p className="m-0">
                            Slides up from the bottom (Nuxt Modal). Drag the
                            header down past 50% or with velocity to dismiss
                            (Hammer).
                        </p>
                        {Array.from({ length: 8 }, (_, index) => (
                            <p
                                key={index}
                                className="m-0"
                            >
                                Scrollable row {index + 1}
                            </p>
                        ))}
                    </div>
                </Modal>
            ) : null}
        </section>
    )
}
