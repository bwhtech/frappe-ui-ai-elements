<script setup lang="ts">
// Opens and closes by animating height and opacity with the Web Animations API. A toggle in
// the middle of one starts the next from the height on screen, so the content never jumps.
const running = new WeakMap<Element, Animation>();
// The app's --ease-out-strong (style.css), read once.
const EASE = getComputedStyle(document.documentElement).getPropertyValue("--ease-out-strong").trim() || "cubic-bezier(0.23, 1, 0.32, 1)";

function animate(el: Element, to: { height: string; opacity: number }, duration: number, done: () => void) {
	const node = el as HTMLElement;
	const now = getComputedStyle(node);
	const from = { height: now.height, opacity: Number(now.opacity) };
	running.get(el)?.cancel();
	if (matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
	node.style.overflow = "hidden";
	const animation = node.animate([from, to], { duration, easing: EASE });
	running.set(el, animation);
	animation.onfinish = () => {
		node.style.overflow = "";
		running.delete(el);
		done();
	};
}

function onEnter(el: Element, done: () => void) {
	// Measured at full height; the first frame starts from zero, or from where a cancelled close stopped.
	const height = `${el.scrollHeight}px`;
	if (!running.has(el)) Object.assign((el as HTMLElement).style, { height: "0px", opacity: "0" });
	animate(el, { height, opacity: 1 }, 200, done);
	Object.assign((el as HTMLElement).style, { height: "", opacity: "" });
}

function onLeave(el: Element, done: () => void) {
	animate(el, { height: "0px", opacity: 0 }, 150, done);
}
</script>

<template>
	<Transition :css="false" @enter="onEnter" @leave="onLeave">
		<slot />
	</Transition>
</template>
