import { defineComponent, h, type Component } from "vue";
import BasicsDemo from "./demos/BasicsDemo.vue";
import CodeBlockDemo from "./demos/CodeBlockDemo.vue";
import ConfirmationDemo from "./demos/ConfirmationDemo.vue";
import ConversationDemo from "./demos/ConversationDemo.vue";
import DevDemo from "./demos/DevDemo.vue";
import LoaderDemo from "./demos/LoaderDemo.vue";
import MessageDemo from "./demos/MessageDemo.vue";
import MessageScrollerDemo from "./demos/MessageScrollerDemo.vue";
import MetaDemo from "./demos/MetaDemo.vue";
import PromptInputDemo from "./demos/PromptInputDemo.vue";
import QuestionnaireDemo from "./demos/QuestionnaireDemo.vue";
import ReasoningDemo from "./demos/ReasoningDemo.vue";
import ResponseDemo from "./demos/ResponseDemo.vue";
import ScenarioDemo from "./demos/ScenarioDemo.vue";
import StepsDemo from "./demos/StepsDemo.vue";
import SuggestionDemo from "./demos/SuggestionDemo.vue";
import ToolDemo from "./demos/ToolDemo.vue";
import type { Control, Entry, Option } from "./types";

const askKinds = ["single", "multiple", "text", "number", "date", "boolean"];
const toolStates = ["input-streaming", "input-available", "approval-requested", "approval-responded", "output-available", "output-error", "output-denied"];

// Shared demos pick their element with a fixed `kind`.
function withKind(demo: Component, kind: string) {
	return defineComponent({
		props: { v: { type: Object, required: true }, worst: Boolean },
		setup: (props) => () => h(demo, { ...props, kind }),
	});
}

const bool = (key: string, label: string, value = false): Control => ({ key, label, type: "boolean", default: value });
const range = (key: string, label: string, min: number, max: number, value: number, step = 1, unit?: string): Control => ({
	key, label, type: "range", min, max, step, default: value, unit,
});
const select = (key: string, label: string, options: Option[], value = optionValue(options[0])): Control => ({ key, label, type: "select", options, default: value });
const optionValue = (option: Option) => (typeof option === "string" ? option : option.value);
const segment = (key: string, label: string, options: string[], value = options[0]): Control => ({ key, label, type: "segment", options, default: value });
const text = (key: string, label: string, value: string): Control => ({ key, label, type: "text", default: value });

export const entries: Entry[] = [
	{
		id: "scenario", group: "Scenario", label: "Seva conversation",
		description: "A scripted agent streams a whole Seva turn through Conversation and MessageParts: reasoning, load_skill, search, questions (ask_user), an approval and the reply. Your answers change what it builds. Answer, then Approve or Deny in the preview to steer it.",
		controls: [
			select("ask", "Questions", [
				{ label: "Answer them yourself", value: "interactive" },
				{ label: "Auto: public form, 3 fields", value: "form" },
				{ label: "Auto: staff only, 1 field", value: "staff" },
				{ label: "Skip: the agent does not ask", value: "skip" },
			], "interactive"),
			select("branch", "Approval", ["interactive", "approve", "deny", "error"]), range("speed", "Speed", 0.25, 4, 1, 0.25, "×"), bool("autoplay", "Autoplay on load", true)],
		demo: ScenarioDemo,
	},
	{
		id: "conversation", group: "Chat", label: "Conversation",
		description: "The thread container. Follows the live end, anchors the person's turn, shows a scroll button.",
		controls: [range("count", "Messages", 0, 16, 6), segment("position", "Opens at", ["end", "start", "last-anchor"]), bool("autoScroll", "Auto-scroll", true), bool("empty", "Empty state"), text("emptyTitle", "Empty title", "What should we build?")],
		demo: ConversationDemo,
	},
	{
		id: "message-scroller", group: "Chat", label: "Message Scroller",
		description: "Load older messages above the reader: the row you are reading stays put, also while a reply streams. The readout shows useMessageScrollerVisibility().",
		controls: [range("initial", "Rows at first", 4, 40, 8), range("batch", "Older rows per load", 1, 20, 6), range("delay", "Load delay", 0, 2000, 600, 100, "ms"), bool("preserve", "Keep place on prepend", true), bool("autoLoad", "Load on reaching the top", true), bool("autoScroll", "Auto-scroll", true), bool("visibility", "Visibility readout", true)],
		demo: MessageScrollerDemo,
	},
	{
		id: "message", group: "Chat", label: "Message",
		description: "One turn. The person's text sits in a bubble; the agent's is markdown with actions.",
		controls: [segment("from", "From", ["assistant", "user"]), bool("actions", "Actions", true), bool("avatar", "Avatar"), text("header", "Header", ""), { key: "text", label: "Text", type: "textarea", default: "I created a **Volunteer** list. Open it at /desk/volunteer." }],
		demo: MessageDemo,
	},
	{
		id: "response", group: "Chat", label: "Response",
		description: "Streaming-safe markdown. Press Stream it to replay the sample character by character.",
		controls: [select("sample", "Sample", ["reply", "table", "code", "lists"]), range("speed", "Chars per tick", 1, 40, 6), bool("parseIncomplete", "Repair incomplete markdown", true), segment("size", "Size", ["base", "sm"])],
		demo: ResponseDemo,
	},
	{
		id: "prompt-input", group: "Chat", label: "Prompt Input",
		description: "Enter sends, Shift+Enter adds a line. The submit button follows the status.",
		controls: [segment("status", "Status", ["ready", "submitted", "streaming", "error"]), bool("attachments", "Attachments"), bool("model", "Model selector", true), bool("context", "Context ring", true), bool("disabled", "Disabled"), text("placeholder", "Placeholder", "Describe what you need…")],
		demo: PromptInputDemo,
	},
	{
		id: "suggestion", group: "Chat", label: "Suggestion",
		description: "One-click prompts in a row that scrolls sideways, or wraps.",
		controls: [range("count", "Count", 1, 8, 4), bool("wrap", "Wrap"), bool("icon", "Icon")],
		demo: SuggestionDemo,
	},
	{
		id: "tool", group: "Agent steps", label: "Tool",
		description: "One tool call in every state. ToolPart is the AI SDK adapter; turn it off to see the composed parts.",
		controls: [select("state", "State", toolStates, "output-available"), bool("adapter", "Use ToolPart adapter", true), bool("approved", "Approved (approval-responded)", true), text("toolName", "Tool name", "create_document"), bool("long", "Long input and output"), text("errorText", "Error text", "ValidationError: Fieldname phone is a reserved keyword"), bool("streaming", "Chat is streaming", true), bool("badge", "Status badge", true), bool("defaultOpen", "Open by default")],
		demo: ToolDemo,
	},
	{
		id: "confirmation", group: "Agent steps", label: "Confirmation",
		description: "Approve or deny a tool before it runs. Answering shows the outcome.",
		controls: [segment("variant", "Variant", ["compound", "tool"]), text("title", "Title", "Create the Volunteer DocType with 4 fields?"), text("details", "Details", "Nothing runs until you approve.")],
		demo: ConfirmationDemo,
	},
	{
		id: "questionnaire", group: "Agent steps", label: "Questionnaire",
		description: "The agent asks (an ask_user call); the person steps through with Back, Next, Skip and Submit. Keys: 1–9 pick, arrows move, Enter continues. More than 6 options switch to a picker.",
		controls: [
			range("count", "Questions", 1, 4, 3),
			select("kind1", "Question 1", askKinds, "multiple"),
			select("kind2", "Question 2", askKinds, "single"),
			select("kind3", "Question 3", askKinds, "date"),
			select("kind4", "Question 4", askKinds, "boolean"),
			range("options", "Options per choice question", 2, 20, 3),
			bool("allowOther", "Allow Other…", true),
			bool("required", "Required", true),
			bool("streaming", "Reply streaming (disabled)"),
			bool("echo", "Show as output-available after submit", true),
		],
		demo: QuestionnaireDemo,
	},
	{
		id: "reasoning", group: "Agent steps", label: "Reasoning",
		description: "Closed until you open it, also while it streams.",
		controls: [bool("streaming", "Streaming"), range("duration", "Duration (0 = unknown)", 0, 120, 0, 1, "s"), segment("length", "Text", ["short", "medium", "long", "empty"]), bool("defaultOpen", "Open by default")],
		demo: ReasoningDemo,
	},
	{
		id: "task", group: "Agent steps", label: "Task",
		description: "A task and its steps.",
		controls: [range("count", "Steps", 1, 8, 3), segment("status", "Status", ["running", "none", "error"])],
		demo: withKind(StepsDemo, "task"),
	},
	{
		id: "plan", group: "Agent steps", label: "Plan",
		description: "Planned steps and progress.",
		controls: [range("count", "Steps", 1, 8, 5), range("done", "Done", 0, 8, 2), bool("streaming", "Streaming", true), bool("description", "Description", true)],
		demo: withKind(StepsDemo, "plan"),
	},
	{
		id: "queue", group: "Agent steps", label: "Queue",
		description: "Todos split into to do and completed.",
		controls: [range("count", "Todos", 1, 8, 5), range("done", "Completed", 0, 8, 2), bool("streaming", "Streaming", true), bool("description", "Descriptions")],
		demo: withKind(StepsDemo, "queue"),
	},
	{
		id: "chain-of-thought", group: "Agent steps", label: "Chain of Thought",
		description: "A summary that opens into the steps.",
		controls: [range("count", "Steps", 1, 8, 3), bool("streaming", "Running"), bool("error", "A step failed"), bool("results", "Search results", true)],
		demo: withKind(StepsDemo, "chain"),
	},
	{
		id: "subagent", group: "Agent steps", label: "Subagent",
		description: "A subagent run with its task, model, tools and result.",
		controls: [segment("status", "Status", ["done", "running", "error"]), bool("model", "Model badge", true), range("tools", "Tools", 0, 6, 2), bool("result", "Result", true)],
		demo: withKind(DevDemo, "subagent"),
	},
	{
		id: "code-block", group: "Developer", label: "Code Block",
		description: "highlight.js with frappe-ui's GitHub theme.",
		controls: [select("language", "Language", ["python", "json", "typescript", "bash", "sql", "text"]), bool("wrap", "Wrap"), bool("lineNumbers", "Line numbers"), bool("long", "Long code"), bool("header", "Header", true), segment("size", "Size", ["default", "sm"]), segment("variant", "Variant", ["default", "destructive"])],
		demo: CodeBlockDemo,
	},
	{
		id: "terminal", group: "Developer", label: "Terminal",
		description: "A command and its output; opens once output arrives while it runs.",
		controls: [text("command", "Command", "bench build --app seva"), bool("streaming", "Streaming"), segment("exitCode", "Exit code", ["0", "1", "none"]), bool("long", "Long output")],
		demo: withKind(DevDemo, "terminal"),
	},
	{
		id: "stack-trace", group: "Developer", label: "Stack Trace",
		description: "A failed call; your frames first, library frames folded.",
		controls: [segment("language", "Stack", ["js", "python"]), bool("defaultOpen", "Open by default", true)],
		demo: withKind(DevDemo, "stack"),
	},
	{
		id: "test-results", group: "Developer", label: "Test Results",
		description: "Suites with failures open themselves.",
		controls: [range("failures", "Failures", 0, 2, 1), bool("streaming", "Running")],
		demo: withKind(DevDemo, "tests"),
	},
	{
		id: "file-tree", group: "Developer", label: "File Tree",
		description: "Changed files as a folder tree, on frappe-ui's Tree.",
		controls: [bool("changes", "Change markers", true), bool("expandAll", "Expanded", true)],
		demo: withKind(DevDemo, "files"),
	},
	{
		id: "sources", group: "Context", label: "Sources",
		description: "The links used for a reply.",
		controls: [range("count", "Sources", 1, 8, 3), bool("titles", "Titles", true)],
		demo: withKind(MetaDemo, "sources"),
	},
	{
		id: "inline-citation", group: "Context", label: "Inline Citation",
		description: "A source chip in the sentence; hover or focus it.",
		controls: [range("count", "Sources", 1, 4, 2), bool("titles", "Titles", true), bool("quote", "Quote")],
		demo: withKind(MetaDemo, "citation"),
	},
	{
		id: "context", group: "Context", label: "Context",
		description: "Context window usage.",
		controls: [range("used", "Used tokens", 0, 200000, 48000, 1000), select("max", "Context window", ["128000", "200000", "1000000"], "200000"), bool("breakdown", "Usage breakdown", true)],
		demo: withKind(MetaDemo, "context"),
	},
	{
		id: "model-selector", group: "Context", label: "Model Selector",
		description: "A menu that picks the model or the effort.",
		controls: [bool("grouped", "Group by provider", true)],
		demo: withKind(MetaDemo, "model"),
	},
	{
		id: "checkpoint", group: "Context", label: "Checkpoint",
		description: "A point in the thread you can return to.",
		controls: [text("label", "Label", "Volunteer DocType created"), text("tooltip", "Tooltip", "Remove every later turn")],
		demo: withKind(MetaDemo, "checkpoint"),
	},
	{
		id: "loader", group: "Building blocks", label: "Loader & Shimmer",
		description: "Live status text.",
		controls: [text("text", "Text", "Reading your DocTypes…"), range("duration", "Sweep", 0.5, 5, 2, 0.5, "s"), segment("as", "Element", ["span", "p", "h3"], "p")],
		demo: LoaderDemo,
	},
	{
		id: "basics", group: "Building blocks", label: "Bubble, Marker, Attachment",
		description: "The small parts the elements are built from.",
		controls: [
			select("variant", "Bubble variant", ["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"], "muted"),
			segment("align", "Bubble align", ["start", "end"]),
			text("text", "Bubble text", "We need to track volunteers."),
			segment("marker", "Marker", ["default", "separator", "border"]),
			select("mediaType", "Attachment type", ["text/csv", "image/png", "application/pdf"]),
			select("state", "Attachment state", ["idle", "uploading", "done", "error"]),
			bool("removable", "Removable", true),
		],
		demo: BasicsDemo,
	},
];

export const groups = [...new Set(entries.map((entry) => entry.group))];
