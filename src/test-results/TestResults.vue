<script setup lang="ts">
import { computed } from "vue";
import { CodeBlock, CodeBlockContent } from "../code-block";
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "../trace";

export interface TestCase {
	name: string;
	status: "passed" | "failed" | "skipped" | "running";
	duration?: number;
	error?: string;
}

export interface TestSuite {
	name: string;
	tests: TestCase[];
}

/** A test run: "Ran 14 tests, 2 failed", then each suite, open when it has a failure. */
const props = defineProps<{ suites: TestSuite[]; isStreaming?: boolean; duration?: number }>();

const tests = computed(() => props.suites.flatMap((suite) => suite.tests));
const failedCount = (list: TestCase[]) => list.filter((test) => test.status === "failed").length;
const failed = computed(() => failedCount(tests.value));
const summary = computed(() => {
	if (props.isStreaming) return `Running ${tests.value.length} tests`;
	return `Ran ${tests.value.length} tests${failed.value ? `, ${failed.value} failed` : ""}`;
});
const icon = { passed: "lucide-check", failed: "lucide-x", skipped: "lucide-circle-slash", running: "lucide-loader-circle" };
const lineStatus = (test: TestCase) => ({ failed: "error", running: "running", skipped: "pending", passed: undefined } as const)[test.status];
const seconds = (ms?: number) => (ms === undefined ? "" : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`);
</script>

<template>
	<Trace data-slot="test-results">
		<TraceCollapsible :default-open="failed > 0">
			<TraceCollapsibleTrigger>
				<TraceLine :status="isStreaming ? 'running' : failed ? 'error' : undefined">
					<TraceIcon icon="lucide-flask-conical" />
					<TraceTitle>{{ summary }}</TraceTitle>
					<TraceDescription v-if="duration">{{ seconds(duration) }}</TraceDescription>
				</TraceLine>
			</TraceCollapsibleTrigger>
			<TraceCollapsibleContent>
				<Trace>
					<TraceCollapsible v-for="suite in suites" :key="suite.name" :default-open="failedCount(suite.tests) > 0">
						<TraceCollapsibleTrigger>
							<TraceLine :status="failedCount(suite.tests) ? 'error' : undefined">
								<TraceIcon icon="lucide-file-code" />
								<TraceTitle>
									{{ suite.name }}, {{ suite.tests.length }} tests<template v-if="failedCount(suite.tests)">, {{ failedCount(suite.tests) }} failed</template>
								</TraceTitle>
							</TraceLine>
						</TraceCollapsibleTrigger>
						<TraceCollapsibleContent>
							<Trace>
								<template v-for="test in suite.tests" :key="test.name">
									<TraceCollapsible v-if="test.error">
										<TraceCollapsibleTrigger>
											<TraceLine :status="lineStatus(test)">
												<TraceIcon :icon="icon[test.status]" />
												<TraceTitle>{{ test.name }}</TraceTitle>
												<TraceDescription v-if="test.duration">{{ seconds(test.duration) }}</TraceDescription>
											</TraceLine>
										</TraceCollapsibleTrigger>
										<TraceCollapsibleContent>
											<CodeBlock size="sm" variant="destructive">
												<CodeBlockContent :code="test.error" wrap class="max-h-64" />
											</CodeBlock>
										</TraceCollapsibleContent>
									</TraceCollapsible>
									<TraceLine v-else :status="lineStatus(test)">
										<TraceIcon :icon="icon[test.status]" :class="test.status === 'passed' && 'text-ink-green-6'" />
										<TraceTitle>{{ test.name }}</TraceTitle>
										<TraceDescription v-if="test.duration">{{ seconds(test.duration) }}</TraceDescription>
									</TraceLine>
								</template>
							</Trace>
						</TraceCollapsibleContent>
					</TraceCollapsible>
				</Trace>
			</TraceCollapsibleContent>
		</TraceCollapsible>
	</Trace>
</template>
