import type { ChatStatus, UIMessage } from "ai";
import { ref } from "vue";
import { script, type ScenarioBranch, type ScenarioText } from "./script";

type Part = UIMessage["parts"][number];

class Cancelled extends Error {}

/**
 * A fake agent. Streams a scripted Seva turn into `messages` the way useChat
 * would: parts appear, text grows chunk by chunk, tool parts move through
 * their states, and an approval waits for Approve / Deny (or answers itself
 * when the branch says so). Supports pause, speed and restart.
 */
export class ScenarioPlayer {
	readonly messages = ref<UIMessage[]>([]);
	readonly status = ref<ChatStatus>("ready");
	readonly playing = ref(false);
	readonly finished = ref(false);
	readonly step = ref("Ready");
	/** True while the script waits for the person to approve or deny. */
	readonly waiting = ref(false);

	private run = 0;
	private resume: (() => void) | null = null;
	private answer: ((approved: boolean) => void) | null = null;

	constructor(
		private readonly options: () => { speed: number; branch: ScenarioBranch; text: ScenarioText },
		private readonly onEvent: (name: string, payload?: unknown) => void = () => {},
	) {}

	play() {
		if (this.finished.value) return this.restart();
		this.playing.value = true;
		this.resume?.();
		if (this.messages.value.length === 0) void this.start();
	}

	pause() {
		this.playing.value = false;
	}

	restart() {
		this.run++;
		this.resume?.();
		this.messages.value = [];
		this.status.value = "ready";
		this.waiting.value = false;
		this.finished.value = false;
		this.playing.value = true;
		void this.start();
	}

	/** Cancels the current run, e.g. when the preview unmounts. */
	dispose() {
		this.run++;
		this.playing.value = false;
		this.resume?.();
	}

	/** Called from the preview's Approve / Deny buttons. */
	respond(approved: boolean) {
		this.answer?.(approved);
	}

	private async start() {
		const run = this.run;
		try {
			await script(this.scriptApi(run), this.options());
			this.finished.value = true;
			this.playing.value = false;
			this.step.value = "Done";
			this.onEvent("scenario:done");
		} catch (error) {
			if (!(error instanceof Cancelled)) throw error;
		}
	}

	/** The small API the script is written against. Internal to the playground. */
	scriptApi(run: number) {
		const check = () => {
			if (run !== this.run) throw new Cancelled();
		};
		const wait = async (ms: number) => {
			let left = ms;
			while (left > 0) {
				check();
				if (!this.playing.value) await new Promise<void>((resolve) => (this.resume = resolve));
				check();
				const slice = Math.min(left, 40);
				await new Promise((resolve) => setTimeout(resolve, slice / this.options().speed));
				left -= slice;
			}
			check();
		};
		return {
			wait,
			label: (text: string) => {
				this.step.value = text;
				this.onEvent("scenario:step", text);
			},
			setStatus: (status: ChatStatus) => (this.status.value = status),
			push: (message: UIMessage) => {
				this.messages.value.push(message);
				return this.messages.value[this.messages.value.length - 1];
			},
			addPart: <T extends Part>(message: UIMessage, part: T) => {
				message.parts.push(part);
				return message.parts[message.parts.length - 1] as T;
			},
			stream: async (part: { text: string; state?: "streaming" | "done" }, text: string, chunk = 5) => {
				part.state = "streaming";
				for (let i = 0; i < text.length; i += chunk) {
					part.text = text.slice(0, i + chunk);
					await wait(28);
				}
				part.state = "done";
			},
			update: (part: object, patch: Record<string, unknown>) => Object.assign(part, patch),
			awaitApproval: async (autoAnswer: boolean | null) => {
				check();
				this.status.value = "ready";
				if (autoAnswer !== null) {
					await wait(1600);
					return autoAnswer;
				}
				this.playing.value = false;
				this.waiting.value = true;
				const approved = await new Promise<boolean>((resolve) => (this.answer = resolve));
				this.answer = null;
				this.waiting.value = false;
				check();
				this.playing.value = true;
				return approved;
			},
		};
	}
}

export type ScenarioApi = ReturnType<ScenarioPlayer["scriptApi"]>;
