/** @type {import('prettier').Config} */
export default {
    semi: false,
    singleQuote: false,
    endOfLine: "lf",
    tabWidth: 4,
    useTabs: false,
    printWidth: 80,
    trailingComma: "none",
    singleAttributePerLine: true,
    bracketSpacing: true,
    bracketSameLine: false,
    overrides: [
        {
            files: "*.md",
            options: {
                tabWidth: 2,
                proseWrap: "preserve"
            }
        }
    ]
}
