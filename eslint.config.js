import js from "@eslint/js"
import prettierRecommended from "eslint-plugin-prettier/recommended"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
    globalIgnores([
        "dist/**",
        "node_modules/**",
        "logs/**",
        "*.log",
        ".DS_Store",
        ".fleet/**",
        ".idea/**",
        ".env",
        ".env.*",
        "!.env.example"
    ]),
    {
        files: ["**/*.{js,mjs,cjs,ts,tsx}"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite
        ],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.browser
        },
        rules: {
            "no-console":
                process.env.NODE_ENV === "production" ? "warn" : "off",
            "no-debugger":
                process.env.NODE_ENV === "production" ? "warn" : "off",
            // Keep components/functions split — similar to a team size budget.
            "max-lines-per-function": [
                "error",
                {
                    max: 300,
                    skipBlankLines: true,
                    skipComments: true
                }
            ],
            "max-lines": [
                "error",
                {
                    max: 300,
                    skipBlankLines: true,
                    skipComments: true
                }
            ]
        }
    },
    {
        files: ["**/*.config.{js,mjs,cjs,ts}", "eslint.config.js"],
        languageOptions: {
            globals: globals.node
        },
        rules: {
            "max-lines": "off",
            "max-lines-per-function": "off"
        }
    },
    {
        // Context modules commonly export both Provider and useX hooks.
        files: ["src/store/**/*.{ts,tsx}"],
        rules: {
            "react-refresh/only-export-components": "off"
        }
    },
    prettierRecommended
])
