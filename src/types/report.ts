/** Fat nested report — keep this OUT of list/row UI state. */
export type Report = {
    meta: {
        title: string
        owner: string
        tags: string[]
    }
    filters: {
        showDone: boolean
        showDraft: boolean
        query: string
    }
    sections: Array<{
        id: string
        name: string
        rows: Array<{
            id: string
            label: string
            checked: boolean
            note: string
        }>
    }>
    extras: {
        scores: number[]
        nested: {
            a: { b: { c: string[] } }
        }
    }
}

export function createInitialReport(owner: string): Report {
    return {
        meta: {
            title: `${owner}'s weekly report`,
            owner,
            tags: ["react", "zustand", "query"]
        },
        filters: {
            showDone: true,
            showDraft: true,
            query: ""
        },
        sections: [
            {
                id: "s1",
                name: "Checklist",
                rows: Array.from({ length: 12 }, (_, index) => ({
                    id: `r${index + 1}`,
                    label: `Task ${index + 1}`,
                    checked: index % 3 === 0,
                    note: ""
                }))
            },
            {
                id: "s2",
                name: "Notes",
                rows: Array.from({ length: 8 }, (_, index) => ({
                    id: `n${index + 1}`,
                    label: `Note row ${index + 1}`,
                    checked: false,
                    note: `Detail ${index + 1}`
                }))
            }
        ],
        extras: {
            scores: Array.from({ length: 40 }, (_, index) => index * 3),
            nested: {
                a: { b: { c: ["alpha", "beta", "gamma"] } }
            }
        }
    }
}
