<script setup lang="ts">
import {
	CodeBlock,
	CodeBlockActions,
	CodeBlockContent,
	CodeBlockCopyButton,
	CodeBlockFooter,
	CodeBlockHeader,
	CodeBlockLine,
	CodeBlockTitle,
} from "@bwhtech/frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";

const python = `import frappe

def get_free_volunteers(day: str) -> list[dict]:
    """Volunteers free on the given day, by area."""
    return frappe.get_all(
        "Volunteer",
        filters={"available_days": ["like", f"%{day}%"]},
        fields=["full_name", "phone", "area"],
        order_by="area asc",
    )
`;
const json = `{"doctype": "Volunteer", "fields": [{"fieldname": "full_name", "fieldtype": "Data", "reqd": 1}, {"fieldname": "a_really_long_field_name_that_should_scroll_sideways_instead_of_breaking_the_layout", "fieldtype": "Data"}]}`;
</script>

<template>
	<DemoBlock id="code-block" title="Code Block" description="highlight.js tokens with frappe-ui's GitHub theme, copy, line numbers, diff lines and an error variant.">
		<div class="flex flex-col gap-4">
			<CodeBlock>
				<CodeBlockHeader>
					<CodeBlockTitle icon="lucide-file-code">volunteer.py</CodeBlockTitle>
					<CodeBlockActions><CodeBlockCopyButton :value="python" /></CodeBlockActions>
				</CodeBlockHeader>
				<CodeBlockContent :code="python" language="python" line-numbers />
			</CodeBlock>
			<CodeBlock size="sm">
				<CodeBlockActions><CodeBlockCopyButton :value="json" /></CodeBlockActions>
				<CodeBlockContent :code="json" language="json" />
			</CodeBlock>
			<CodeBlock size="sm">
				<CodeBlockHeader><CodeBlockTitle icon="lucide-git-compare">volunteer.json</CodeBlockTitle></CodeBlockHeader>
				<CodeBlockContent>
					<CodeBlockLine>"fields": [</CodeBlockLine>
					<CodeBlockLine variant="removed">  { "fieldname": "phone", "fieldtype": "Data" },</CodeBlockLine>
					<CodeBlockLine variant="added">  { "fieldname": "phone", "fieldtype": "Data", "options": "Phone" },</CodeBlockLine>
					<CodeBlockLine variant="highlighted">  { "fieldname": "area", "fieldtype": "Link" }</CodeBlockLine>
					<CodeBlockLine>]</CodeBlockLine>
				</CodeBlockContent>
				<CodeBlockFooter class="text-xs">1 removed, 1 added</CodeBlockFooter>
			</CodeBlock>
			<CodeBlock size="sm" variant="destructive">
				<CodeBlockHeader><CodeBlockTitle icon="lucide-circle-x">Error</CodeBlockTitle></CodeBlockHeader>
				<CodeBlockContent code="frappe.exceptions.ValidationError: Fieldname phone is a reserved keyword" wrap />
			</CodeBlock>
		</div>
	</DemoBlock>
</template>
