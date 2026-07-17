import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import {
    FormProvider,
    useForm,
    useFormContext,
    type SubmitHandler
} from "react-hook-form"
import { createUser, deleteUser, listUsers } from "../api/users"
import { DialogUI } from "../components/ui/DialogUI"
import { USERS_QUERY_KEY } from "../lib/usersQuery"
import { cx, ui } from "../lib/ui"
import { useNotificationStore } from "../store/useNotificationStore"
import { createUserSchema, type CreateUserInput } from "../types/createUser"
import type { User } from "../types/user"

const emptyCreateUser: CreateUserInput = {
    name: "",
    email: "",
    role: ""
}

function CreateUserFormFields() {
    const {
        register,
        formState: { errors, isDirty, isSubmitting }
    } = useFormContext<CreateUserInput>()

    return (
        <div className="space-y-4">
            <label className={ui.fieldLabel}>
                Name
                <input
                    className={ui.field}
                    placeholder="Ada Lovelace"
                    {...register("name")}
                />
                {errors.name ? (
                    <p className="text-danger mt-1 mb-0 text-xs">
                        {errors.name.message}
                    </p>
                ) : null}
            </label>

            <label className={ui.fieldLabel}>
                Email
                <input
                    type="email"
                    className={ui.field}
                    placeholder="ada@example.com"
                    {...register("email")}
                />
                {errors.email ? (
                    <p className="text-danger mt-1 mb-0 text-xs">
                        {errors.email.message}
                    </p>
                ) : null}
            </label>

            <label className={ui.fieldLabel}>
                Role
                <input
                    className={ui.field}
                    placeholder="Engineer"
                    {...register("role")}
                />
                {errors.role ? (
                    <p className="text-danger mt-1 mb-0 text-xs">
                        {errors.role.message}
                    </p>
                ) : null}
            </label>

            <button
                type="submit"
                className={cx(ui.btn, ui.btnPrimary)}
                disabled={!isDirty || isSubmitting}
            >
                {isSubmitting ? "Creating…" : "Create User"}
            </button>
        </div>
    )
}

export function UsersPage() {
    const queryClient = useQueryClient()
    const updateNotification = useNotificationStore(
        (state) => state.updateNotification
    )

    // Which user the confirm dialog is about (null = dialog closed)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    const { data: users = [], isPending } = useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: listUsers
    })

    // Rebuild when the list changes so unique-email checks stay current.
    const schema = useMemo(
        () => createUserSchema(users.map((user) => user.email)),
        [users]
    )

    const form = useForm<CreateUserInput>({
        resolver: zodResolver(schema),
        defaultValues: emptyCreateUser,
        mode: "onSubmit"
    })

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (user) => {
            void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
            form.reset(emptyCreateUser)
            updateNotification({
                message: `Created ${user.name} (${user.id})`,
                error: false
            })
        },
        onError: (error) => {
            updateNotification({
                message:
                    error instanceof Error ? error.message : "Create failed",
                error: true
            })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: (deletedId) => {
            void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
            updateNotification({
                message: `Deleted user ${deletedId}`,
                error: false
            })
            // Close dialog after the request finishes
            setUserToDelete(null)
        },
        onError: (error) => {
            updateNotification({
                message:
                    error instanceof Error ? error.message : "Delete failed",
                error: true
            })
        }
    })

    const onSubmit: SubmitHandler<CreateUserInput> = async (data) => {
        await createMutation.mutateAsync(data)
    }

    const isDeleting = deleteMutation.isPending

    return (
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>Query + React Hook Form + Zod</p>
            <h2 className={ui.title}>Create users</h2>
            <p className={ui.lede}>
                List from <code>useQuery</code>. Form sends{" "}
                <code>CreateUserInput</code> only — <code>createUser</code>{" "}
                assigns <code>id</code> (uN+1) and builds the report. Delete
                asks in a dialog, then shows Deleting… until the API finishes.
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <div>
                    <h3 className="font-display text-ink m-0 mb-3 text-base">
                        Users
                    </h3>
                    {isPending ? (
                        <p className="text-muted text-sm">Loading users…</p>
                    ) : users.length === 0 ? (
                        <p className="text-muted text-sm">No users yet.</p>
                    ) : (
                        <ul className="divide-line border-line m-0 list-none divide-y border p-0">
                            {users.map((user) => (
                                <li
                                    key={user.id}
                                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                                >
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-ink text-sm font-semibold">
                                            {user.name}{" "}
                                            <span className="text-muted font-normal">
                                                ({user.id})
                                            </span>
                                        </span>
                                        <span className="text-muted text-xs">
                                            {user.email} · {user.role}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-danger shrink-0 cursor-pointer border-0 bg-transparent text-xs font-medium hover:underline"
                                        onClick={() => setUserToDelete(user)}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <h3 className="font-display text-ink m-0 mb-3 text-base">
                        New user
                    </h3>
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CreateUserFormFields />
                        </form>
                    </FormProvider>
                </div>
            </div>

            {userToDelete ? (
                <DialogUI
                    title="Delete this user?"
                    danger
                    // Block X / backdrop / Escape while the request runs
                    notCloseable={isDeleting}
                    onClosing={() => {
                        if (!isDeleting) setUserToDelete(null)
                    }}
                >
                    <p className="m-0 text-sm text-gray-700">
                        Are you sure you want to delete{" "}
                        <strong>{userToDelete.name}</strong> ({userToDelete.id}
                        )?
                    </p>
                    <p className="text-ink m-0 mt-2 text-sm">
                        This action cannot be undone.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            className={cx(ui.btn, ui.btnTertiary)}
                            disabled={isDeleting}
                            onClick={() => setUserToDelete(null)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={cx(ui.btn, ui.btnDanger)}
                            disabled={isDeleting}
                            onClick={() =>
                                deleteMutation.mutate(userToDelete.id)
                            }
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </button>
                    </div>
                </DialogUI>
            ) : null}
        </section>
    )
}
