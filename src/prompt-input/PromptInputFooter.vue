<template>
	<!-- The toolbar under the textarea. Put PromptInputTools on the left and PromptInputSubmit last. -->
	<div data-slot="prompt-input-footer" class="flex min-w-0 items-center justify-between gap-1 px-2 pb-2">
		<slot />
	</div>
</template>
