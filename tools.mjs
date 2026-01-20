/** @format */

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

export { formatRelative };
