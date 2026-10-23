import { inject, provide, type InjectionKey, type Ref } from "vue";

const key: InjectionKey<Ref<boolean>> = Symbol("Plan");

export function providePlanStreaming(streaming: Ref<boolean>) {
	provide(key, streaming);
}

export function usePlanStreaming() {
	return inject(key, null);
}
