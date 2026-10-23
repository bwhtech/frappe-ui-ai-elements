<template>
	<span
		data-slot="marker-content"
		class="min-w-0 [overflow-wrap:anywhere] group-data-[variant=separator]/marker:flex-initial group-data-[variant=separator]/marker:text-center [&_a:hover]:text-ink-gray-8 [&_a]:underline [&_a]:underline-offset-2"
	>
		<slot />
	</span>
</template>
