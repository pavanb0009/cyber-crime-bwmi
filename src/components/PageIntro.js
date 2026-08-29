import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PageIntro({ title, aside, }) {
    return (_jsx("section", { className: "page-shell pb-4 pt-6 sm:pb-5 sm:pt-7", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h1", { className: "text-[1.35rem] font-semibold tracking-[-0.02em] text-paper sm:text-[1.55rem]", children: title }), aside] }) }));
}
