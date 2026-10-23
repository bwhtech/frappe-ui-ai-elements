<template>
	<!-- The message footer: a row of ghost icon buttons that follows the turn's alignment. -->
	<div
		data-slot="message-footer"
		class="-ml-1.5 flex min-w-0 max-w-full items-center gap-0.5 text-ink-gray-5 group-data-[align=end]/message:-mr-1.5 group-data-[align=end]/message:ml-0 group-data-[align=end]/message:justify-end"
	>
		<slot />
	</div>
</template>
