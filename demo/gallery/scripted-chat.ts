import type { ChatStatus, DynamicToolUIPart, UIMessage } from "ai";
import { ref } from "vue";
import { reasoningText, replyMarkdown, userMessage } from "./fixtures";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A fake useChat: streams a scripted reasoning → tool → reply turn, so the gallery needs no model. */
export function useScriptedChat(initial: UIMessage[] = []) {
	const messages = ref<UIMessage[]>([...initial]);
	const status = ref<ChatStatus>("ready");
	let stopped = false;

	async function streamText(part: { text: string; state?: "streaming" | "done" }, text: string, chunk = 6) {
		// `stopped` changes in stop(), which runs while this loop awaits.
		// oxlint-disable-next-line no-unmodified-loop-condition
		for (let i = 0; i < text.length && !stopped; i += chunk) {
			part.text = text.slice(0, i + chunk);
			await sleep(24);
		}
		part.state = "done";
	}

	async function send(text: string) {
		stopped = false;
		messages.value.push(userMessage(text));
		status.value = "submitted";
		await sleep(700);
		messages.value.push({ id: `a${Date.now()}`, role: "assistant", parts: [] });
		const reply = messages.value[messages.value.length - 1];
		status.value = "streaming";

		reply.parts.push({ type: "reasoning", text: "", state: "streaming" });
		await streamText(reply.parts[0] as { text: string }, reasoningText, 4);
		if (stopped) return finish();

		reply.parts.push({
			type: "dynamic-tool",
			toolName: "search_doctypes",
			toolCallId: `t${Date.now()}`,
			state: "input-available",
			input: { query: "volunteer" },
		});
		await sleep(1200);
		const call = reply.parts[1] as DynamicToolUIPart;
		Object.assign(call, { state: "output-available", output: { content: [{ type: "text", text: '{"results":[]}' }] } });

		reply.parts.push({ type: "text", text: "", state: "streaming" });
		await streamText(reply.parts[2] as { text: string }, replyMarkdown);
		finish();
	}

	function finish() {
		status.value = "ready";
	}

	function stop() {
		stopped = true;
		finish();
	}

	return { messages, status, send, stop, reset: () => (messages.value = [...initial]) };
}
