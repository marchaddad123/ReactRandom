/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

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
