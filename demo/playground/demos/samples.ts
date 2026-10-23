// Markdown samples for the Response and Message demos.
export const markdownSamples: Record<string, string> = {
	reply: `I created a **Volunteer** list for you. Each volunteer has a *name*, a phone number and an area.

Open it in the Desk at [/desk/volunteer](https://example.org/desk/volunteer).`,
	table: `| Field | Type | Notes |
| --- | --- | --- |
| Full Name | Text | Required |
| Phone | Phone | Validated |
| Area | Link to Territory | Pick from your existing areas |
| Available Days | Multi-select | Monday to Sunday |`,
	code: `Add this to a server script:

\`\`\`python
import frappe

def free_volunteers(day: str):
    return frappe.get_all("Volunteer", filters={"available_days": ["like", f"%{day}%"]}, fields=["full_name", "phone"])
\`\`\`

Then call it from a report.`,
	lists: `## Next steps

1. Add a few volunteers
2. Make a **sign-up form**
   - public, no login
   - sends an email to the coordinator
3. Share the link

> Tip: \`Available Days\` uses a child table.

---

- [x] DocType created
- [ ] Web form`,
};
