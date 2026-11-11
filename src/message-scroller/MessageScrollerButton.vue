<script setup lang="ts">
import { Button } from "frappe-ui";
import { computed } from "vue";
import { injectMessageScroller } from "./context";

const props = withDefaults(defineProps<{ direction?: "start" | "end"; behavior?: ScrollBehavior }>(), {
	direction: "end",
	behavior: "smooth",
});

const controller = injectMessageScroller();
const active = computed(() => controller.scrollable[props.direction]);
const label = computed(() => (props.direction === "end" ? "Scroll to end" : "Scroll to start"));

function scroll() {
	if (props.direction === "end") controller.scrollToEnd({ behavior: props.behavior });
	else controller.scrollToStart({ behavior: props.behavior });
}
</script>

<template>
	<div
		data-slot="message-scroller-button"
		:data-direction="direction"
		:data-active="active"
		class="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 opacity-0 transition-[opacity,transform] duration-200 ease-out-strong motion-reduce:transition-opacity motion-reduce:!translate-y-0 data-[direction=end]:bottom-3 data-[direction=start]:top-3 data-[active=true]:pointer-events-auto data-[active=true]:translate-y-0 data-[active=true]:opacity-100 data-[direction=end]:data-[active=false]:translate-y-2 data-[direction=start]:data-[active=false]:-translate-y-2"
	>
		<slot :active="active" :scroll="scroll">
			<Button
				variant="outline"
				class="rounded-full bg-surface-elevation-2 shadow-lg"
				:icon="direction === 'end' ? 'lucide-arrow-down' : 'lucide-arrow-up'"
				:aria-label="label"
				:tabindex="active ? 0 : -1"
				@click="scroll"
			/>
		</slot>
	</div>
</template>
