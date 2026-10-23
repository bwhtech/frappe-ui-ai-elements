import { inject, provide, ref, type InjectionKey } from "vue";

export interface LogEntry {
	id: number;
	time: string;
	name: string;
	payload?: unknown;
}

type Log = (name: string, payload?: unknown) => void;
const key: InjectionKey<Log> = Symbol("PlaygroundLog");

/** The event log shown under the preview. Demos call `useLog()` to write to it. */
export function provideEventLog() {
	const entries = ref<LogEntry[]>([]);
	let id = 0;
	const log: Log = (name, payload) => {
		const time = new Date().toLocaleTimeString([], { hour12: false });
		entries.value = [{ id: ++id, time, name, payload }, ...entries.value].slice(0, 50);
	};
	provide(key, log);
	return { entries, clear: () => (entries.value = []) };
}

export function useLog(): Log {
	return inject(key, () => {});
}
