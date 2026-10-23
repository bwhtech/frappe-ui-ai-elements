import { computed, inject, provide, type ComputedRef, type InjectionKey } from "vue";
import type { ToolState } from "../tool/state";

export interface ConfirmationApproval {
	id: string;
	approved?: boolean;
	reason?: string;
}

interface ConfirmationContext {
	approval: ComputedRef<ConfirmationApproval | undefined>;
	state: ComputedRef<ToolState>;
}

const key: InjectionKey<ConfirmationContext> = Symbol("Confirmation");

export function provideConfirmation(approval: () => ConfirmationApproval | undefined, state: () => ToolState) {
	provide(key, { approval: computed(approval), state: computed(state) });
}

export function useConfirmation(component: string) {
	const context = inject(key, null);
	if (!context) throw new Error(`<${component}> must be used inside <Confirmation>`);
	return context;
}
