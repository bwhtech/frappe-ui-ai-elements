# frappe-ui AI Elements

AI chat and agent components for Vue 3, built on [frappe-ui](https://github.com/frappe/frappe-ui). This is a port of [shadcn AI Elements](https://ui.shadcn.com/docs/ai-elements): the conversation, messages, prompt input, tool calls with approvals, reasoning, plans, tasks, sources, code blocks and more. The components use frappe-ui components and tokens, so they look like a Frappe product and follow light and dark mode.

The components read the [Vercel AI SDK](https://ai-sdk.dev) message format (`UIMessage` and its parts). `MessageParts` renders a whole message, and `ToolPart` renders one tool call in any of its seven states.

> Status: 0.x. The package is not on npm yet, and the API can change between minor versions.

## Install

```bash
npm install @bwhtech/frappe-ui-ai-elements frappe-ui vue ai
```

Until the package is on npm, install it from GitHub: `npm install github:bwhtech/frappe-ui-ai-elements`. npm then runs the `prepare` script, which builds `dist/`.

## Set up

1. Use Tailwind 3 with the frappe-ui preset, and add this package's files to `content`:

   ```js
   // tailwind.config.js
   import preset, { content as frappeUI } from "frappe-ui/tailwind";
   import { content as aiElements } from "@bwhtech/frappe-ui-ai-elements/tailwind";

   export default {
   	presets: [preset],
   	content: [...frappeUI, ...aiElements, "./src/**/*.{vue,ts}"],
   };
   ```

2. Import the styles after frappe-ui's. The second file holds the `shimmer` and `scroll-fade-*` utilities, the code highlighting theme and a few Trace selectors. It uses `@layer utilities`, so import it from a CSS file that Tailwind processes:

   ```css
   @import "frappe-ui/style.css";
   @import "@bwhtech/frappe-ui-ai-elements/styles.css";
   ```

3. Wrap the app in frappe-ui's `<FrappeUIProvider>`.

## Use

```vue
<script setup lang="ts">
import { useChat } from "@ai-sdk/vue";
import { Conversation, ConversationContent, ConversationItem, Message, MessageContent, MessageParts, PromptInput, PromptInputSubmit, PromptInputTextarea } from "@bwhtech/frappe-ui-ai-elements";
import { ref } from "vue";

const { messages, sendMessage, addToolApprovalResponse, status, stop } = useChat();
const input = ref("");
</script>

<template>
	<Conversation>
		<ConversationContent>
			<ConversationItem v-for="message in messages" :key="message.id" :message-id="message.id" :scroll-anchor="message.role === 'user'">
				<Message :from="message.role">
					<MessageContent>
						<MessageParts
							:message="message"
							@approve="(id) => addToolApprovalResponse({ id, approved: true })"
							@deny="(id) => addToolApprovalResponse({ id, approved: false })"
						/>
					</MessageContent>
				</Message>
			</ConversationItem>
		</ConversationContent>
	</Conversation>
	<PromptInput v-model="input" :status="status" @submit="sendMessage({ text: $event.text })" @stop="stop">
		<PromptInputTextarea placeholder="Ask anything" />
		<PromptInputSubmit />
	</PromptInput>
</template>
```

## Demo

`npm run dev` starts the demo app:

- `/` is the gallery. It shows every element with fixture data.
- `/playground.html` is the playground. Pick an element, change its props, try worst-case data, dark mode and narrow widths, or replay a scripted agent turn with approvals. The URL keeps the state, so a link reproduces it.

## Develop

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the demo app. |
| `npm run typecheck` | Type-checks the library and the demo with vue-tsc. |
| `npm run build` | Builds the library into `dist/`: one ES module per source file, and type declarations in `dist/types/`. `vue`, `frappe-ui`, `ai`, `marked`, `dompurify` and `highlight.js` stay external. |
| `npm run build:demo` | Builds the demo app into `demo-dist/`. |
| `npm run build:demo:dist` | Builds the demo against `dist/`, to check the built package works in an app. |

frappe-ui's `.vue` files need the TypeScript 5 API, which TypeScript 7 no longer ships. `scripts/vue-tsc.cjs` and `vite.shared.ts` point vue-tsc and the Vue compiler at the TypeScript 5 copy that frappe-ui installs.

The components follow frappe-ui's [design philosophy](https://github.com/frappe/frappe-ui/blob/main/PHILOSOPHY.md): `variant` and `theme` for colour, `v-model` and `v-model:open` for two-way state, the shared slot names, `data-slot` attributes instead of class props, and `icon` props that take a `lucide-*` string or a component.

## Reference

The structure follows shadcn. Most elements are built on a few building blocks (Trace, MessageScroller, Bubble, CodeBlock, Marker, Shimmer). Each element also keeps the classic AI SDK Elements API (`Tool` + `ToolHeader` + …). Compound parts share state through provide/inject.

### Building blocks

| Part | Props | Slots / emits | Notes |
| --- | --- | --- | --- |
| `Trace` | — | default | A column of step lines. |
| `TraceLine` | `status?: running \| error \| pending` | default | `running` makes the title shimmer. |
| `TraceIcon` | `icon?: lucide-*` | default | |
| `TraceTitle`, `TraceDescription` | — | default | The title truncates. The description is muted and uses tabular numbers. |
| `TraceCollapsible` | `v-model:open`, `defaultOpen` | default `{ open }` | |
| `TraceCollapsibleTrigger` | — | default | A button with a rotating chevron. |
| `TraceCollapsibleContent` | `keepMounted` | default | Animates its height. `class` goes to the inner panel. |
| `MessageScrollerProvider` | `autoScroll`, `defaultScrollPosition: start \| end \| last-anchor`, `scrollEdgeThreshold`, `scrollPreviousItemPeek`, `scrollMargin` | default | Owns scroll state. |
| `MessageScroller`, `MessageScrollerViewport`, `MessageScrollerContent` | — | default | The frame, the scroller, and the `role="log"` column with its tail spacer. |
| `MessageScrollerItem` | `messageId`, `scrollAnchor` | default | Set `scrollAnchor` on the person's turns. |
| `MessageScrollerButton` | `direction: end \| start`, `behavior` | default `{ active, scroll }` | Hides when you are already at that edge. |
| `useMessageScroller()` | — | — | Returns `{ scrollToEnd, scrollToStart, scrollToMessage }`. |
| `useMessageScrollerScrollable()` | — | — | Returns `{ start, end }`. |
| `Bubble` / `BubbleContent` / `BubbleGroup` | `variant: default \| secondary \| muted \| tinted \| outline \| ghost \| destructive`, `align` / `as` | default | |
| `CodeBlock` | `variant: default \| destructive`, `size: default \| sm` | default | |
| `CodeBlockHeader`, `CodeBlockTitle (icon)`, `CodeBlockActions`, `CodeBlockFooter` | | default | When `CodeBlockActions` is a direct child of `CodeBlock`, it floats in the top-right corner and shows on hover. |
| `CodeBlockContent` | `code`, `language`, `wrap`, `lineNumbers`, `startLine` | default (lines) | Uses highlight.js, the same as frappe-ui's editor. |
| `CodeBlockLine` | `variant: default \| added \| removed \| highlighted` | default | |
| `CodeBlockCopyButton` | `value` | emits `copy` | |
| `Marker`, `MarkerIcon (icon)`, `MarkerContent` | `variant: default \| separator \| border` | default | |
| `Shimmer` | `as`, `duration` (s), `spread` (px) | default | You can also use the `shimmer` class directly. |
| `Attachment` | `name`, `size`, `mediaType`, `url`, `state: idle \| uploading \| done \| error`, `removable` | emits `remove` | |

### Elements

| Element | Parts and API | Renders (`UIMessage` part) |
| --- | --- | --- |
| **Chat** | `Conversation (autoScroll = true, defaultScrollPosition)`, `ConversationContent` (attrs go to the column), `ConversationItem (messageId, scrollAnchor)`, `ConversationScrollButton`, `ConversationEmptyState (title, description, icon; #actions)` | The message list |
| **Message** | `Message (from: user \| assistant \| system, align?)`, `MessageContent (bare)` puts the person's text in a muted bubble, `MessageAvatar (name, src)`, `MessageHeader`, `MessageActions` / `MessageFooter`, `MessageAction (label, icon, pressed; @click)`, `MessageCopyAction (value)` | `role` |
| **MessageParts** | `message`, `streaming`. Emits `approve(id)` and `deny(id)`. This is the AI SDK adapter for a whole message. | `text`, `reasoning`, `dynamic-tool`, `tool-*`, `file`, `source-url` |
| **Response** (`MessageResponse`) | `content`, `parseIncomplete = true`, `size: sm \| base` | `text`. Uses marked and DOMPurify. While the text streams, it closes open fences, bold, inline code and links. Fenced code renders as a `CodeBlock`. Finished blocks are cached. A table scrolls sideways in its own focusable region, `[data-slot=response-table]`. Long unbroken text (URLs, ids, inline code) wraps. |
| **PromptInput** | `PromptInput (v-model text, status: ready \| submitted \| streaming \| error, disabled, accept, multiple)` emits `submit({ text, files })` and `stop`. Parts: `PromptInputTextarea (placeholder, maxRows, autofocus)`, `PromptInputHeader`, `PromptInputFooter` / `Toolbar`, `PromptInputTools`, `PromptInputButton (label, icon, iconLeft)`, `PromptInputAttachButton`, `PromptInputSubmit` | Enter sends. Shift+Enter adds a new line. IME composition does not send. `PromptInputSubmit` shows Send, a spinner while submitted, and Stop while streaming. |
| **Tool** | `Tool (v-model:open, defaultOpen)`, `ToolHeader (state, toolName, title, icon, streaming, approved, preliminary, showBadge)`, `ToolContent`, `ToolInput (input)`, `ToolOutput (output, errorText)`. Helpers: `getToolStatus`, `getToolTitle`, `getStatusBadge`, `formatToolOutput` (unwraps MCP `content[].text`), `getToolName`, `humanizeToolName` | `dynamic-tool`, `tool-*`, in every state |
| **ToolPart** | `part`, `streaming`, `icon`. Emits `approve(id)` and `deny(id)`. | AI SDK adapter. `approval-requested` renders as a Confirmation. Other states render as a Tool line. |
| **Confirmation** | `Confirmation (approval, state, icon)`, `ConfirmationTitle (title, description; #description)`, `ConfirmationRequest`, `ConfirmationAccepted`, `ConfirmationRejected`, `ConfirmationActions`, `ConfirmationAction (label, variant, theme; @click)`. Ready-made: `ToolConfirmation (toolName, input, reason; @approve @deny)` | `approval-requested`, `approval-responded`, `output-denied` |
| **Reasoning** | `Reasoning (isStreaming, v-model:open, defaultOpen, duration)`, `ReasoningTrigger` (slot `{ isStreaming, duration }`), `ReasoningContent (content)`, `ReasoningPart (text, streaming, duration)`, `useReasoning()` | `reasoning`. It opens while the model thinks and closes when it finishes. If the person toggles it, their choice wins. The title reads "Thought for Ns", timed on the client when the server does not send a duration. |
| **Loader** | `text` | Spinner and shimmering status text |
| **Suggestion** | `Suggestions (wrap)`, `Suggestion (suggestion, icon; @select)` | Send the label with `sendMessage({ text })` |
| **Task** | `Task (v-model:open, defaultOpen = true)`, `TaskTrigger (title, status, icon)`, `TaskContent`, `TaskItem (status, icon)`, `TaskItemFile (icon)` | `data-task` |
| **Plan** | `Plan (isStreaming, v-model:open, defaultOpen)`, `PlanHeader (icon; #actions)`, `PlanTitle`, `PlanDescription`, `PlanContent (#description, #footer)`, `PlanStep (status: complete \| active \| pending)` | `data-plan` |
| **Queue** | `Queue`, `QueueSection (label, icon, defaultOpen)`, `QueueItem (status: pending \| in_progress \| completed, description, streaming)` | Todos from a `writeTodos`-style tool |
| **ChainOfThought** | `ChainOfThought (title, status, running, icon, v-model:open, defaultOpen)`, `ChainOfThoughtStep (label, description, status: complete \| active \| pending \| error, icon; default slot shows detail)`, `ChainOfThoughtSearchResults (urls)` | Tool parts shown as steps |
| **Checkpoint** | `Checkpoint`, `CheckpointIcon (icon)`, `CheckpointTrigger (label, tooltip; @click)` | `data-checkpoint` |
| **Context** | `usedTokens`, `maxTokens`, `usage { inputTokens, outputTokens, reasoningTokens, cachedInputTokens }`, `modelId`. Default slot goes in the card. | `message.metadata.usage` |
| **Sources** | `Sources (sources, defaultOpen)` or `SourcesTrigger (count)` + `SourcesContent` + `Source (href, title)` | `source-url`, deduped by URL |
| **InlineCitation** | `sources: { url, title?, description?, quote? }[]`. Default slot holds the cited text. | `source-url` |
| **ModelSelector** | `models: { id, name, provider?, description? }[]`, `label`, `v-model` (id) | Use one for the model and one for the effort |
| **FileTree** | `nodes: { path, name, children?, change? }[]`, `v-model:expanded`, `v-model:selected`. Emits `select(path)`. Built on frappe-ui `Tree`. | Files the agent changed |
| **Terminal** | `command`, `output`, `isStreaming`, `exitCode`, `v-model:open`, `#actions` | A command tool, or `data-terminal` |
| **StackTrace** | `trace`, `defaultOpen`. Emits `select(path, line, column)` when a frame with a file is picked. Also exports `parseStack()` (JS and Python stacks). | The stack in `output-error` text |
| **TestResults** | `suites: { name, tests: { name, status, duration?, error? }[] }[]`, `isStreaming`, `duration` | Output of a test tool |
| **Subagent** | `name`, `status: running \| done \| error`, `task`, `model`, `tools`, `result` (markdown), `duration`, `v-model:open`, `defaultOpen`. Nested tool lines go in the default slot. | A subagent tool and its `output.parts` |

### Differences from shadcn

- Visibility tracking in MessageScroller (`useMessageScrollerVisibility`) and preserving the scroll position on prepend are not ported. Follow, anchor, release and the tail spacer are ported.
- InlineCitation shows all sources in one hover card, not in a carousel.
- ModelSelector is a menu without search, as in the current shadcn pattern.
- Tool keeps a status badge next to the line, because frappe apps use badges for status.

### Layout changes

These change only how elements wrap. Props, slots and events are the same.

- `MessageHeader`: in the person's turn, long header text aligns to the end.
- `Response`: tables are wrapped in `[data-slot=response-table]`, which scrolls sideways. Paragraphs, list items and headings break long unbroken strings.
- `ConfirmationTitle`: the title uses the paragraph type scale and breaks long unbroken strings.
- `Marker` (`variant="separator"`) and `Checkpoint`: a long label shrinks and wraps between the lines. The label and the restore button wrap to two rows when there is no space.
- `ModelSelector`: a long model name truncates in the trigger.
- `Subagent`: long model and tool names truncate in their badges. The full name shows on hover.
- `ToolHeader`: the full title shows on hover when it truncates.
- `Shimmer`: long unbroken text wraps.
