/**
 * Resident localization helpers for API responses.
 * @format
 */

import labelsEnUs from "./labels_en_us.mjs";
import demoUsers from "./demo_users.js";
import {
	HEALTH_ENUM_GROUPS,
	HEALTH_FREE_TEXT_FIELDS,
	HEALTH_EQUIPMENT_FIELDS,
	VISIT_CATEGORIES,
} from "./health_enums.mjs";

/**
 * @typedef {Object} LocalizedField
 * @property {string} label
 * @property {string | boolean | null | string[]} value
 * @property {{ value: string, label: string }[]=} options
 * @property {string=} notes
 * @property {boolean=} hidden
 * @property {boolean=} readonly
 * @property {"text" | "textarea"=} input_type
 */

/**
 * @typedef {Object} LocalizedVisitAction
 * @property {string} key
 * @property {string} label
 * @property {string | boolean | null} value
 * @property {string} category
 * @property {string} group
 */

/**
 * @typedef {Object} LocalizedVisitEntry
 * @property {LocalizedField} date
 * @property {LocalizedField} caretaker
 * @property {{ label: string, items: LocalizedVisitAction[] }} actions
 */

/**
 * @typedef {Object} LocalizedResident
 * @property {Record<string, LocalizedField>} profile
 * @property {Record<string, LocalizedField>} health
 * @property {Record<string, LocalizedField>} equipment_used
 * @property {{ label: string, entries: Array<Record<string, LocalizedField>> }} update_log
 * @property {{ label: string, entries: LocalizedVisitEntry[] }} visits
 * @property {{ label: string, date: LocalizedField, relative: LocalizedField, display: string }} last_visit
 */

/**
 * @type {Map<string, { label_key: string, type: "boolean" | "text", category_label_key: string, group_label_key: string | null }>}
 */
const VISIT_ACTION_LOOKUP = new Map();

for (const category of VISIT_CATEGORIES) {
	for (const action of category.actions) {
		VISIT_ACTION_LOOKUP.set(action.key, {
			label_key: action.label_key,
			type: action.type,
			category_label_key: category.label_key,
			group_label_key: null,
		});
	}
	for (const group of category.groups) {
		for (const action of group.actions) {
			VISIT_ACTION_LOOKUP.set(action.key, {
				label_key: action.label_key,
				type: action.type,
				category_label_key: category.label_key,
				group_label_key: group.label_key,
			});
		}
	}
}

/**
 * @type {string[]}
 */
const PROFILE_FIELD_ORDER = [
	"uuid",
	"image",
	"active",
	"created_at",
	"updated_at",
	"created_by",
	"updated_by",
	"responsible_staff",
	"first_name",
	"last_name",
	"gender",
	"room",
	"date_of_birth",
	"birthplace",
	"nationality",
	"identification_number",
	"address",
	"blood_type",
	"home_phone",
	"mobile_phone",
];

/**
 * @type {Set<string>}
 */
const PROFILE_HIDDEN_FIELDS = new Set(["uuid", "image", "active"]);

/**
 * @type {Set<string>}
 */
const PROFILE_READONLY_FIELDS = new Set([
	"created_at",
	"created_by",
	"updated_at",
	"updated_by",
]);

/**
 * @type {Set<string>}
 */
const PROFILE_TEXTAREA_FIELDS = new Set(["address"]);

/**
 * @type {string[]}
 */
const BLOOD_TYPE_OPTIONS = [
	"0 rh+",
	"0 rh-",
	"a rh+",
	"a rh-",
	"b rh+",
	"b rh-",
	"ab rh+",
	"ab rh-",
];

/**
 * @type {{ username: string }[]}
 */
const STAFF_USERS = Array.isArray(demoUsers.DEMO_USERS) ? demoUsers.DEMO_USERS : [];

/**
 * @type {Set<string>}
 */
const HEALTH_TEXTAREA_FIELDS = new Set([
	"chronic_illness",
	"medications",
	"allergies",
	"medical_history",
	"relatives",
]);

/**
 * @returns {Map<string, Array<{ value: string, label: string }>>}
 */
const createProfileSelectOptions = () =>
	new Map([
		[
			"gender",
			[
				{ value: "male", label: resolveLabel("gender.long.male", "Male") },
				{ value: "female", label: resolveLabel("gender.long.female", "Female") },
			],
		],
		[
			"responsible_staff",
			STAFF_USERS.map((user) => ({
				value: user.username,
				label: user.username,
			})),
		],
		[
			"blood_type",
			BLOOD_TYPE_OPTIONS.map((value) => ({
				value,
				label: value.toUpperCase(),
			})),
		],
	]);

/**
 * @param {string} dateValue
 * @returns {{ displayDate: string, relative: string }}
 */
const formatVisitDate = (dateValue) => {
	if (!dateValue) {
		return { displayDate: "", relative: "" };
	}
	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.getTime())) {
		return { displayDate: "", relative: "" };
	}
	const displayDate = parsed.toISOString().replace("T", " ").slice(0, 16);
	const now = Date.now();
	const diffMs = parsed.getTime() - now;
	const isFuture = diffMs > 0;
	const absSeconds = Math.floor(Math.abs(diffMs) / 1000);
	let relative = "";
	if (absSeconds < 60) {
		relative = "just now";
	} else if (absSeconds < 3600) {
		const minutes = Math.floor(absSeconds / 60);
		relative = `${minutes} min ${isFuture ? "from now" : "ago"}`;
	} else if (absSeconds < 86400) {
		const hours = Math.floor(absSeconds / 3600);
		relative = `${hours} hr ${isFuture ? "from now" : "ago"}`;
	} else if (absSeconds < 2592000) {
		const days = Math.floor(absSeconds / 86400);
		relative = `${days} day${days === 1 ? "" : "s"} ${isFuture ? "from now" : "ago"}`;
	} else {
		const months = Math.floor(absSeconds / 2592000);
		relative = `${months} mo ${isFuture ? "from now" : "ago"}`;
	}
	return { displayDate, relative };
};

/**
 * @param {Array<Record<string, any>> | undefined} visits
 * @returns {{ label: string, date: LocalizedField, relative: LocalizedField, display: string }}
 */
const buildLastVisitSummary = (visits) => {
	let lastVisitDate = "";
	if (Array.isArray(visits)) {
		for (const visit of visits) {
			if (!visit || typeof visit.date !== "string") {
				continue;
			}
			if (!lastVisitDate || visit.date > lastVisitDate) {
				lastVisitDate = visit.date;
			}
		}
	}
	const { displayDate, relative } = formatVisitDate(lastVisitDate);
	const display = displayDate ? `${displayDate}${relative ? ` (${relative})` : ""}` : "";
	return {
		label: resolveLabel("visits.last_visit", "Last Visit"),
		date: {
			value: displayDate,
			label: resolveLabel("visits.date", "Date"),
		},
		relative: {
			value: relative,
			label: resolveLabel("visits.relative", "Relative"),
		},
		display,
	};
};

/**
 * Resolve label keys to localized strings.
 * @param {string} labelKey
 * @param {string} fallback
 * @returns {string}
 */
const resolveLabel = (labelKey, fallback) => labelsEnUs[labelKey] || fallback;

/**
 * Build the localized payload for a resident.
 * @param {Record<string, any>} resident
 * @returns {LocalizedResident}
 */
const buildLocalizedResident = (resident) => {
	const profileSelectOptions = createProfileSelectOptions();
	/** @type {Record<string, LocalizedField>} */
	const profile = {};
	for (const key of PROFILE_FIELD_ORDER) {
		const value = resident.profile ? resident.profile[key] : null;
		const normalizedValue =
			key === "image" || key === "room"
				? value === undefined
					? null
					: value
				: value ?? "";
		const options = profileSelectOptions.get(key);
		profile[key] = {
			value: normalizedValue,
			label: resolveLabel(`profile.${key}`, key),
			hidden: PROFILE_HIDDEN_FIELDS.has(key),
			readonly: PROFILE_READONLY_FIELDS.has(key),
			input_type: PROFILE_TEXTAREA_FIELDS.has(key) ? "textarea" : "text",
			options,
		};
	}

	const roomValue =
		resident.profile && typeof resident.profile.room === "string"
			? resident.profile.room.trim()
			: "";
	profile.location = {
		value: roomValue ? `Room ${roomValue}` : "Home",
		label: resolveLabel("profile.location", "Location"),
	};

	/** @type {Record<string, LocalizedField>} */
	const health = {};
	for (const group of HEALTH_ENUM_GROUPS) {
		const value = resident.health ? resident.health[group.key] : "";
		const options = [];
		for (const option of group.options) {
			options.push({
				value: option.value,
				label: resolveLabel(option.label_key, option.value),
			});
		}
		health[group.key] = {
			value: value ?? "",
			label: resolveLabel(group.label_key, group.key),
			options,
		};
	}

	for (const field of HEALTH_FREE_TEXT_FIELDS) {
		const value = resident.health ? resident.health[field.key] : "";
		health[field.key] = {
			value: value ?? "",
			label: resolveLabel(field.label_key, field.key),
			notes: resolveLabel(field.notes_key, ""),
			input_type: HEALTH_TEXTAREA_FIELDS.has(field.key) ? "textarea" : "text",
		};
	}

	/** @type {Record<string, LocalizedField>} */
	const equipment_used = {};
	for (const field of HEALTH_EQUIPMENT_FIELDS) {
		const value = resident.equipment_used ? resident.equipment_used[field.key] : false;
		equipment_used[field.key] = {
			value: Boolean(value),
			label: resolveLabel(field.label_key, field.key),
		};
	}

	/** @type {Array<Record<string, LocalizedField>>} */
	const updateLogEntries = Array.isArray(resident.update_log)
		? resident.update_log.map(
				/** @param {Record<string, any>} entry */
				(entry) => ({
					date: {
						value: entry.date || "",
						label: resolveLabel("update_log.date", "Date"),
					},
					user_id: {
						value: entry.user_id || "",
						label: resolveLabel("update_log.user_id", "User ID"),
					},
					fields: {
						value: Array.isArray(entry.fields) ? entry.fields : [],
						label: resolveLabel("update_log.fields", "Fields"),
					},
				})
		  )
		: [];

	/** @type {LocalizedVisitEntry[]} */
	const visitsEntries = Array.isArray(resident.visits)
		? resident.visits.map(
				/** @param {Record<string, any>} entry */
				(entry) => {
					const actions = Array.isArray(entry.actions)
						? entry.actions.map(
								/** @param {{ key: string, value?: string }} action */
								(action) => {
									const meta = VISIT_ACTION_LOOKUP.get(action.key);
									const value =
										typeof action.value === "string"
											? action.value
											: meta && meta.type === "boolean"
												? true
												: "";
									return {
										key: action.key,
										label: resolveLabel(meta ? meta.label_key : "", action.key),
										value,
										category: meta ? resolveLabel(meta.category_label_key, "") : "",
										group: meta && meta.group_label_key
											? resolveLabel(meta.group_label_key, "")
											: "",
									};
								}
						  )
						: [];
					return {
						date: {
							value: entry.date || "",
							label: resolveLabel("visits.date", "Date"),
						},
						caretaker: {
							value: entry.caretaker || "",
							label: resolveLabel("visits.caretaker", "Caretaker"),
						},
						actions: {
							label: resolveLabel("visits.actions", "Actions"),
							items: actions,
						},
					};
				}
		  )
		: [];

	const lastVisit = buildLastVisitSummary(resident.visits);

	return {
		profile,
		health,
		equipment_used,
		update_log: {
			label: resolveLabel("update_log", "Update Log"),
			entries: updateLogEntries,
		},
		visits: {
			label: resolveLabel("visits", "Visits"),
			entries: visitsEntries,
		},
		last_visit: lastVisit,
	};
};

export { buildLocalizedResident };
