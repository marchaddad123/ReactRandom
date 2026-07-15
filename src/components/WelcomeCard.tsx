type WelcomeCardProps = {
    name: string
    currentStack: string
}

export function WelcomeCard({ name, currentStack }: WelcomeCardProps) {
    return (
        <section className="card">
            <p className="eyebrow">React + TypeScript</p>
            <h1>Welcome, {name}</h1>
            <p>
                You already know {currentStack}. This small project shows the
                React equivalents of props, reactive state, derived values, and
                events.
            </p>
        </section>
    )
}
