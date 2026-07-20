/// <reference types="vite/client" />

declare module "lazysizes" {
    type LazySizesConfig = {
        expand?: number
        [key: string]: unknown
    }

    const lazySizes: {
        cfg: LazySizesConfig
        init: () => void
    }

    export default lazySizes
}

/** emoji-picker-element is a web component — teach JSX about the tag. */
declare namespace React {
    namespace JSX {
        interface IntrinsicElements {
            "emoji-picker": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >
        }
    }
}
