<template>
	<!-- Inside a header it sits at the end; as a direct child of CodeBlock it floats top-right on hover. -->
	<div
		data-slot="code-block-actions"
		class="-my-1 ms-auto flex shrink-0 items-center gap-1 [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:right-1.5 [[data-slot=code-block]>&]:top-1.5 [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:m-0 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity group-focus-within/code-block:[[data-slot=code-block]>&]:opacity-100 group-hover/code-block:[[data-slot=code-block]>&]:opacity-100 [@media(pointer:coarse)]:[[data-slot=code-block]>&]:opacity-100"
	>
		<slot />
	</div>
</template>
