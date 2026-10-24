import { inject, provide, type InjectionKey, type Ref } from "vue";
import type { BuildPlan } from "./build-plan";

const key: InjectionKey<Ref<boolean>> = Symbol("Plan");

export function providePlanStreaming(streaming: Ref<boolean>) {
	provide(key, streaming);
}

export function usePlanStreaming() {
	return inject(key, null);
}

const buildPlanKey: InjectionKey<Ref<BuildPlan | null>> = Symbol("BuildPlan");

/** The thread's latest plan with live statuses, so its card ticks items off as update_plan calls arrive. */
export function provideBuildPlan(plan: Ref<BuildPlan | null>) {
	provide(buildPlanKey, plan);
}

export function useBuildPlan() {
	return inject(buildPlanKey, null);
}
