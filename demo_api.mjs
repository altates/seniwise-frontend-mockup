/**
 * Demo API routes for the mock server.
 * @format
 */

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import labelsEnUs from "./labels_en_us.mjs";
import demoUsers from "./demo_users.js";
import { buildLocalizedResident } from "./resident_localization.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @type {Array<Record<string, unknown>>}
 */
const demoResidents = JSON.parse(
	fs.readFileSync(path.join(__dirname, "demo_residents.json"), "utf8")
);

/**
 * @type {Map<string, { username: string, name: string, email: string }>}
 */
const usersByUsername = demoUsers.USERS_BY_USERNAME;

/**
 * @type {number}
 */
const RESIDENTS_PAGE_SIZE = 20;

/**
 * @type {string[]}
 */
const RESIDENTS_SORT_FIELDS = [
	"name",
	"responsible_staff",
	"birth_date",
	"gender",
	"room",
	"last_visit_date",
	"last_visit_staff",
];

/**
 * @type {Array<{ key: string, label: string, sortable: boolean, sort_key: string, link_template?: string }>}
 */
const RESIDENTS_LIST_COLUMNS = [
	{
		key: "name",
		label: labelsEnUs["residents.column.name"] || "Name",
		sortable: true,
		sort_key: "name",
		link_template: "/residents/{uuid}",
	},
	{
		key: "responsible_staff",
		label: labelsEnUs["residents.column.responsible_staff"] || "Responsible Staff",
		sortable: true,
		sort_key: "responsible_staff",
	},
	{
		key: "birth_date",
		label: labelsEnUs["residents.column.birth_date"] || "Birth Date",
		sortable: true,
		sort_key: "birth_date",
	},
	{
		key: "room",
		label: labelsEnUs["residents.column.room"] || "Room",
		sortable: true,
		sort_key: "room",
	},
	{
		key: "gender_short",
		label: labelsEnUs["residents.column.gender"] || "Gender",
		sortable: true,
		sort_key: "gender",
	},
	{
		key: "last_visit_display",
		label: labelsEnUs["residents.column.last_visit"] || "Last Visit",
		sortable: true,
		sort_key: "last_visit_date",
	},
];

/**
 * @returns {import("express").Router}
 */
const createDemoApiRouter = () => {
	const router = express.Router();

	/**
	 * Return paginated residents for list views.
	 * @param {import("express").Request} req
	 * @param {import("express").Response} res
	 * @returns {void}
	 */
	router.get("/residents", (req, res) => {
		const queryRaw = typeof req.query.q === "string" ? req.query.q.trim() : "";
		const query = queryRaw.toLowerCase();
		const requestedPage =
			typeof req.query.p === "string" && Number.isFinite(Number(req.query.p))
				? Math.max(0, Number.parseInt(req.query.p, 10))
				: 0;
		const sortByRaw = typeof req.query.sort_by === "string" ? req.query.sort_by : "name";
		const sortBy = RESIDENTS_SORT_FIELDS.includes(sortByRaw) ? sortByRaw : "name";
		const sortOrder = req.query.sort_order === "desc" ? "desc" : "asc";
		const direction = sortOrder === "desc" ? -1 : 1;

		const residentsWithMeta = demoResidents.map((resident) => {
			const profile = resident.profile || {};
			const firstName = typeof profile.first_name === "string" ? profile.first_name : "";
			const lastName = typeof profile.last_name === "string" ? profile.last_name : "";
			const name = `${firstName} ${lastName}`.trim();
			const responsibleStaffUsername =
				typeof profile.responsible_staff === "string" ? profile.responsible_staff : "";
			const responsibleStaffName = usersByUsername.has(responsibleStaffUsername)
				? usersByUsername.get(responsibleStaffUsername).name
				: responsibleStaffUsername;
			const birthDate = typeof profile.date_of_birth === "string" ? profile.date_of_birth : "";
			let birthDateDisplay = birthDate;
			if (birthDate) {
				const parsedBirthDate = new Date(`${birthDate}T00:00:00Z`);
				if (!Number.isNaN(parsedBirthDate.getTime())) {
					const now = new Date();
					let age = now.getUTCFullYear() - parsedBirthDate.getUTCFullYear();
					const monthDiff = now.getUTCMonth() - parsedBirthDate.getUTCMonth();
					const dayDiff = now.getUTCDate() - parsedBirthDate.getUTCDate();
					if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
						age -= 1;
					}
					birthDateDisplay = `${birthDate} (${age})`;
				}
			}
			const genderValue = typeof profile.gender === "string" ? profile.gender : "";
			const genderShort =
				labelsEnUs[`gender.short.${genderValue}`] || (genderValue ? genderValue[0].toUpperCase() : "");
			const genderLong =
				labelsEnUs[`gender.long.${genderValue}`] || genderValue;
			const roomValue = typeof profile.room === "string" ? profile.room : "";
			const roomDisplay = roomValue ? roomValue : "-";

			let lastVisitDate = "";
			let lastVisitCaretakerUsername = "";
			if (Array.isArray(resident.visits)) {
				for (const visit of resident.visits) {
					if (!visit || typeof visit.date !== "string") {
						continue;
					}
					if (!lastVisitDate || visit.date > lastVisitDate) {
						lastVisitDate = visit.date;
						lastVisitCaretakerUsername =
							typeof visit.caretaker === "string" ? visit.caretaker : "";
					}
				}
			}

			const lastVisitCaretakerName = usersByUsername.has(lastVisitCaretakerUsername)
				? usersByUsername.get(lastVisitCaretakerUsername).name
				: lastVisitCaretakerUsername;
			let lastVisitDisplayDate = "";
			if (lastVisitDate) {
				const parsed = new Date(lastVisitDate);
				if (!Number.isNaN(parsed.getTime())) {
					lastVisitDisplayDate = parsed.toISOString().replace("T", " ").slice(0, 16);
				}
			}
			let lastVisitRelative = "";
			if (lastVisitDate) {
				const parsed = new Date(lastVisitDate);
				const parsedTime = parsed.getTime();
				if (!Number.isNaN(parsedTime)) {
					const now = Date.now();
					const diffMs = parsedTime - now;
					const isFuture = diffMs > 0;
					const absSeconds = Math.floor(Math.abs(diffMs) / 1000);
					if (absSeconds < 60) {
						lastVisitRelative = "just now";
					} else if (absSeconds < 3600) {
						const minutes = Math.floor(absSeconds / 60);
						lastVisitRelative = `${minutes} min ${isFuture ? "from now" : "ago"}`;
					} else if (absSeconds < 86400) {
						const hours = Math.floor(absSeconds / 3600);
						lastVisitRelative = `${hours} hr ${isFuture ? "from now" : "ago"}`;
					} else if (absSeconds < 2592000) {
						const days = Math.floor(absSeconds / 86400);
						lastVisitRelative = `${days} day${days === 1 ? "" : "s"} ${isFuture ? "from now" : "ago"}`;
					} else {
						const months = Math.floor(absSeconds / 2592000);
						lastVisitRelative = `${months} mo ${isFuture ? "from now" : "ago"}`;
					}
				}
			}

			let lastVisitDisplay = "";
			if (lastVisitDisplayDate) {
				lastVisitDisplay = lastVisitDisplayDate;
				if (lastVisitRelative) {
					lastVisitDisplay = `${lastVisitDisplay} (${lastVisitRelative})`;
				}
			}

			return {
				uuid: profile.uuid || "",
				firstName,
				lastName,
				name,
				responsibleStaffName,
				birthDate,
				birthDateDisplay,
				genderValue,
				genderShort,
				genderLong,
				roomValue,
				roomDisplay,
				lastVisitDate,
				lastVisitCaretakerName,
				lastVisitDisplay,
			};
		});

		const filteredResidents = query
			? residentsWithMeta.filter((resident) => {
					const firstName = resident.firstName.toLowerCase();
					const lastName = resident.lastName.toLowerCase();
					const fullName = resident.name.toLowerCase();
					return (
						firstName.includes(query) ||
						lastName.includes(query) ||
						fullName.includes(query)
					);
			  })
			: residentsWithMeta;

		filteredResidents.sort((a, b) => {
			let compareValue = 0;
			if (sortBy === "responsible_staff") {
				compareValue = a.responsibleStaffName.localeCompare(b.responsibleStaffName, "en", {
					sensitivity: "base",
				});
			} else if (sortBy === "birth_date") {
				compareValue = a.birthDate.localeCompare(b.birthDate, "en", {
					sensitivity: "base",
				});
			} else if (sortBy === "gender") {
				compareValue = a.genderValue.localeCompare(b.genderValue, "en", {
					sensitivity: "base",
				});
			} else if (sortBy === "room") {
				compareValue = a.roomValue.localeCompare(b.roomValue, "en", {
					sensitivity: "base",
				});
			} else if (sortBy === "last_visit_date") {
				compareValue = a.lastVisitDate.localeCompare(b.lastVisitDate, "en", {
					sensitivity: "base",
				});
			} else if (sortBy === "last_visit_staff") {
				compareValue = a.lastVisitCaretakerName.localeCompare(b.lastVisitCaretakerName, "en", {
					sensitivity: "base",
				});
			} else {
				const firstCompare = a.firstName.localeCompare(b.firstName, "en", {
					sensitivity: "base",
				});
				if (firstCompare !== 0) {
					compareValue = firstCompare;
				} else {
					compareValue = a.lastName.localeCompare(b.lastName, "en", {
						sensitivity: "base",
					});
				}
			}

			if (compareValue === 0) {
				compareValue = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
			}

			return compareValue * direction;
		});

		const totalItems = filteredResidents.length;
		const totalPages = Math.ceil(totalItems / RESIDENTS_PAGE_SIZE);
		const maxPage = totalPages > 0 ? totalPages - 1 : 0;
		const currentPage = Math.min(requestedPage, maxPage);
		const startIndex = currentPage * RESIDENTS_PAGE_SIZE;
		const pageItems = filteredResidents.slice(startIndex, startIndex + RESIDENTS_PAGE_SIZE);

		res.json({
			success: true,
			error: null,
			result: {
				pagination: {
					current: currentPage,
					total: totalPages,
					totalItems,
				},
				search: {
					query: queryRaw,
					placeholder: labelsEnUs["residents.search.name"] || "Search by name",
				},
				sort: {
					by: sortBy,
					order: sortOrder,
				},
				columns: RESIDENTS_LIST_COLUMNS,
				items: pageItems.map((resident) => ({
					uuid: resident.uuid,
					name: resident.name,
					responsible_staff: resident.responsibleStaffName,
					birth_date: resident.birthDateDisplay,
					room: resident.roomDisplay,
					gender: resident.genderValue,
					gender_short: resident.genderShort,
					gender_long: resident.genderLong,
					last_visit_date: resident.lastVisitDate,
					last_visit_staff: resident.lastVisitCaretakerName,
					last_visit_display: resident.lastVisitDisplay,
				})),
			},
		});
	});

	/**
	 * Return a resident profile image.
	 * @param {import("express").Request} req
	 * @param {import("express").Response} res
	 * @returns {void}
	 */
	router.get("/residents/:uuid/image", (req, res) => {
		const { uuid } = req.params;
		const resident = demoResidents.find(
			/** @param {Record<string, any>} entry */
			(entry) => entry.profile && entry.profile.uuid === uuid
		);

		if (!resident || !resident.profile) {
			res.status(404).send("Resident not found.");
			return;
		}

		const imageFile =
			typeof resident.profile.image_file === "string" ? resident.profile.image_file : "";
		if (!imageFile) {
			res.status(404).send("Resident image not found.");
			return;
		}

		const imagesRoot = path.join(__dirname, "demo-images");
		const filePath = path.join(imagesRoot, imageFile);
		const normalizedPath = path.normalize(filePath);
		if (!normalizedPath.startsWith(imagesRoot)) {
			res.status(400).send("Invalid image path.");
			return;
		}

		res.sendFile(normalizedPath);
	});

	/**
	 * Return resident details as an API response.
	 * @param {import("express").Request} req
	 * @param {import("express").Response} res
	 * @returns {void}
	 */
	router.get("/residents/:uuid", (req, res) => {
		const { uuid } = req.params;
		const resident = demoResidents.find(
			/** @param {Record<string, any>} entry */
			(entry) => entry.profile && entry.profile.uuid === uuid
		);

		if (!resident) {
			res.status(404).json({
				success: false,
				error: { code: 404, message: "Resident not found." },
				result: null,
			});
			return;
		}

		res.json({
			success: true,
			error: null,
			result: buildLocalizedResident(resident),
		});
	});

	return router;
};

export default createDemoApiRouter;
