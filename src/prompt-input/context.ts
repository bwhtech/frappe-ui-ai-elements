import { inject, provide, type InjectionKey, type Ref } from "vue";
import type { ChatStatus } from "ai";

export interface PromptInputContext {
	text: Ref<string>;
	files: Ref<File[]>;
	status: Ref<ChatStatus>;
	disabled: Ref<boolean>;
	canSubmit: Ref<boolean>;
	submit: () => void;
	stop: () => void;
	openFileDialog: () => void;
	removeFile: (file: File) => void;
}

const key: InjectionKey<PromptInputContext> = Symbol("PromptInput");

export function providePromptInput(context: PromptInputContext) {
	provide(key, context);
}

export function usePromptInput(component: string) {
	const context = inject(key, null);
	if (!context) throw new Error(`<${component}> must be used inside <PromptInput>`);
	return context;
}
