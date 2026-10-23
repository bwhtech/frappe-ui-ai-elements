<script setup lang="ts">
// Animates height between 0 and the content height on enter and leave.
function setHeight(el: Element, value: string) {
	(el as HTMLElement).style.height = value;
}

function onEnter(el: Element) {
	setHeight(el, "0px");
	requestAnimationFrame(() => setHeight(el, `${el.scrollHeight}px`));
}

function onLeave(el: Element) {
	setHeight(el, `${el.scrollHeight}px`);
	requestAnimationFrame(() => setHeight(el, "0px"));
}

function clear(el: Element) {
	setHeight(el, "");
}
</script>

<template>
	<Transition
		enter-active-class="overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none"
		leave-active-class="overflow-hidden transition-[height] duration-150 ease-in motion-reduce:transition-none"
		@enter="onEnter"
		@after-enter="clear"
		@leave="onLeave"
		@after-leave="clear"
	>
		<slot />
	</Transition>
</template>
