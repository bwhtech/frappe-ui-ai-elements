# Changelog

## 1.0.0

The first release on npm. It brings back the changes made while the components ran in Ponder Chat. From this version, the package follows semantic versioning: a breaking change gets a new major version.

The package name is now `frappe-ui-ai-elements`. Before, it was `@bwhtech/frappe-ui-ai-elements`. Change your imports and your Tailwind config.

The package now needs frappe-ui 1.1.0 or a later 1.x version.

### Added

- `Response` renders LaTeX maths with KaTeX: `$$…$$`, `\[…\]`, `$…$` and `\(…\)`. A single `$` follows Pandoc's rules, so amounts of money stay text.
- `Response` renders ```` ```mermaid ```` fences as diagrams with Pele. Pele loads only when a reply has a diagram.
- `Response` takes `citations`. A link to a cited page shows as a chip, with a card on hover or focus. `collectCitations(message)`, `citationKey(url)` and `CitationCard` are exported. `MessageParts` passes the citations itself.
- `Response` aligns a table column to the right when all its cells are numbers.
- `provideFileViewer(viewer)` and `useViewOnClick()` open files in the chat in the app's own viewer.
- `provideToolLabels(labeler)` gives tools the app's own names and approval questions, and an optional "Always allow" button.
- `provideToolRenderers` takes `{ foldable }`, for drawn tools that fold with the steps around them.
- `getToolPhase(state, context)` gives one phase for every tool state. `ToolHeader` takes `failed`, for an output that reports a failure itself.
- `PromptInput` takes `ready` and exposes `submit()`. `PromptInputQueue` takes `v-model:editing`.
- `ToolConfirmation` takes `question`, `approvalId` and `alwaysAllow`.
- The `touch-target` and `ease-out-strong` utilities, and the `--ease-out-strong` variable.

### Changed

- `MessageParts` puts the person's text in a bubble and their files in a row under it. Set `bare` on `MessageContent` for the person's turns to get this layout. Without `bare`, the text stays in the `MessageContent` bubble, as before.
- `MessageParts` keys rows by tool call id, so a card keeps its state when the rows move.
- `Attachment` is a one-line chip with an icon coloured by file type.
- `ModelSelector` is a Combobox with search, which scrolls in a fixed height.
- `Loader` has no spinner. It looks like the reasoning line, and its default text is "Thinking".
- `ReasoningTrigger` shows the brain icon while it streams, not a spinner.
- A failed step shows in gray, not red. `ToolGroup` shows the failed count in gray. A denied call counts as skipped, not as a change.
- An approved call that waits for other approvals shows "Approved", not "Running".
- `MessageScroller` lets the reader go on a scrollbar drag, find-in-page or focus move. Keys typed in a field do not release it.
- `CollapseTransition` animates height and opacity with the Web Animations API. A toggle in the middle of an animation starts from the height on screen.
- `PromptInput` highlights only for a drag that carries files.
- `PromptInputTextarea` does not take focus on touch screens, so the keyboard does not cover the chat.
- Touch screens get larger hit areas and more space between step rows.
- Animations use `--ease-out-strong` and stop for `prefers-reduced-motion`.
- Body text uses the `p-md` type scale. Muted text uses `ink-gray-5` for contrast.

## 0.1.0

The first version, installed from GitHub.
