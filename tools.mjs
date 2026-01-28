/** @format */

import labelsEnUs from "./labels_en_us.mjs";

/**
 * Format a date value into a short relative string (e.g., "5 min ago").
 * @param {string | number | Date | null | undefined} value
 * @returns {string}
 */
const formatRelative = (value) => {
	if (!value) {
		return "";
	}
	const parsed = new Date(value);
	const parsedTime = parsed.getTime();
	if (Number.isNaN(parsedTime)) {
		return "";
	}
	const now = Date.now();
	const diffMs = parsedTime - now;
	const isFuture = diffMs > 0;
	const absSeconds = Math.floor(Math.abs(diffMs) / 1000);
	if (absSeconds < 60) {
		return "just now";
	}
	if (absSeconds < 3600) {
		const minutes = Math.floor(absSeconds / 60);
		return `${minutes} min ${isFuture ? "from now" : "ago"}`;
	}
	if (absSeconds < 86400) {
		const hours = Math.floor(absSeconds / 3600);
		return `${hours} hr ${isFuture ? "from now" : "ago"}`;
	}
	if (absSeconds < 2592000) {
		const days = Math.floor(absSeconds / 86400);
		return `${days} day${days === 1 ? "" : "s"} ${isFuture ? "from now" : "ago"}`;
	}
	const months = Math.floor(absSeconds / 2592000);
	return `${months} mo ${isFuture ? "from now" : "ago"}`;
};

/**
 * Resolve a localization key and interpolate template placeholders.
 * @param {string} key
 * @param {Array<string | number>=} values
 * @returns {string}
 */
const labels = (key, values = []) => {
	const lookupKey = typeof key === "string" ? key : "";
	if (!lookupKey || !Object.prototype.hasOwnProperty.call(labelsEnUs, lookupKey)) {
		const invalidKey = typeof key === "string" ? key : String(key);
		return `INVALID_KEY("${invalidKey}")`;
	}
	const template = labelsEnUs[lookupKey];
	if (typeof template !== "string") {
		return `INVALID_KEY("${lookupKey}")`;
	}
	const tokens = Array.isArray(values) ? values : [values];
	const output = [];
	for (let i = 0; i < template.length; i += 1) {
		const char = template[i];
		const nextChar = template[i + 1];
		if (char === "\\" && nextChar === "$") {
			output.push("$");
			i += 1;
			continue;
		}
		if (char === "$") {
			let cursor = i + 1;
			let numberText = "";
			while (cursor < template.length) {
				const digit = template[cursor];
				if (digit < "0" || digit > "9") {
					break;
				}
				numberText += digit;
				cursor += 1;
			}
			if (numberText) {
				const index = Number.parseInt(numberText, 10) - 1;
				const value = index >= 0 && index < tokens.length ? tokens[index] : "";
				output.push(value == null ? "" : String(value));
				i = cursor - 1;
				continue;
			}
		}
		output.push(char);
	}
	return output.join("");
};

export { formatRelative, labels };
