// Worst-case data for the "worst case" toggle: long, unbroken, non-Latin, emoji, huge.

export const worst = {
	name: "Sri Venkateswara Annadana Seva Samithi Volunteer Coordination and Emergency Relief Registry 🙏🏽🍛",
	toolName: "create_or_update_volunteer_availability_schedule_with_emergency_contacts_and_preferred_areas",
	unbroken: "volunteer_availability_schedule_https://example.org/desk/volunteer/VOL-2026-000000000001?with=a&very=long&query=string",
	hindi: "हमें स्वयंसेवकों का नाम, फ़ोन नंबर, क्षेत्र और खाली दिन ट्रैक करने हैं। क्या आप यह बना सकते हैं? 🙂",
	marathi: "आम्हाला स्वयंसेवकांची नावे, फोन, भाग आणि मोकळे दिवस नोंदवायचे आहेत. कृपया एक यादी तयार करा. ✅",
	emoji: "🎉🧑‍🤝‍🧑📋✅❌🔥🍞🥫🚚📞🗓️",
	command: "bench --site food-bank.localhost execute frappe.core.doctype.data_import.data_import.import_file --kwargs '{\"doctype\":\"Volunteer\",\"file_path\":\"/home/frappe/volunteers-2026-final-FINAL-v3.csv\"}'",
};

export function hugeJson(rows = 60) {
	return {
		doctype: worst.toolName,
		records: Array.from({ length: rows }, (_, i) => ({
			name: `VOL-${String(i).padStart(5, "0")}`,
			full_name: i % 3 ? worst.hindi : worst.name,
			notes: i % 2 ? worst.unbroken : worst.marathi,
			tags: worst.emoji,
		})),
	};
}

/** Picks the worst-case value when the toggle is on. */
export function pick<T>(isWorst: boolean, normal: T, bad: T): T {
	return isWorst ? bad : normal;
}
