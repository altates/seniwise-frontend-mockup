/** @format */

import crypto from "crypto";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import demoUsers from "./demo_users.js";
import createDemoApiRouter from "./demo_api.mjs";
import * as viewTools from "./tools.mjs";

const { DEMO_PASSWORD, USERS_BY_USERNAME } = demoUsers;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const apiHost = process.env.API_HOST || `http://localhost:${port}`;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

/**
 * @typedef {Object} Session
 * @property {string} username
 * @property {string} name
 * @property {string} email
 */

/**
 * @type {Map<string, Session>}
 */
const sessionStore = new Map();

/**
 * Attach session details to locals when a valid session cookie is present.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
app.use((req, res, next) => {
	const cookieHeader = req.headers.cookie || "";
	const cookies = {};

	if (cookieHeader) {
		cookieHeader.split(";").forEach((chunk) => {
			const [rawName, ...rest] = chunk.split("=");
			if (!rawName) {
				return;
			}
			const name = rawName.trim();
			const value = rest.join("=").trim();
			if (!name) {
				return;
			}
			cookies[name] = decodeURIComponent(value);
		});
	}

	const sessionId = cookies.seniwise_session;
	if (sessionId && sessionStore.has(sessionId)) {
		res.locals.session = sessionStore.get(sessionId);
		res.locals.session_id = sessionId;
	}

	next();
});

/**
 * Attach view helper functions to response locals.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
app.use((req, res, next) => {
	res.locals.tools = viewTools;
	res.locals.labels = viewTools.labels;
	next();
});

/**
 * Require authentication for all non-login routes.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
app.use((req, res, next) => {
	if (req.path.startsWith("/api") || req.path === "/login" || req.path === "/logout") {
		next();
		return;
	}
	if (res.locals.session) {
		next();
		return;
	}
	res.redirect("/login");
});

/**
 * Track the current path for menu highlighting.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
app.use((req, res, next) => {
	let currentPath = req.path;
	if (currentPath.length > 1 && currentPath.endsWith("/")) {
		currentPath = currentPath.slice(0, -1);
	}
	res.locals.current_path = currentPath;
	next();
});

/**
 * Render the login form.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
app.get("/login", (req, res) => {
	if (res.locals.session) {
		res.redirect("/");
		return;
	}
	res.render("login", { error: null });
});

/**
 * Handle login submissions and create a session.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
app.post("/login", (req, res) => {
	const username =
		typeof req.body.username === "string" ? req.body.username.trim() : "";
	const password =
		typeof req.body.password === "string" ? req.body.password : "";
	const user = USERS_BY_USERNAME.get(username);

	if (!user || password !== DEMO_PASSWORD) {
		res.status(401).render("login", { error: "Invalid username or password." });
		return;
	}

	const sessionId = crypto.randomBytes(24).toString("hex");
	sessionStore.set(sessionId, {
		username: user.username,
		name: user.name,
		email: user.email,
	});

	res.setHeader(
		"Set-Cookie",
		`seniwise_session=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax`,
	);
	res.redirect("/");
});

/**
 * Clear the current session and redirect to login.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
app.get("/logout", (req, res) => {
	const sessionId = res.locals.session_id;
	if (sessionId) {
		sessionStore.delete(sessionId);
	}
	res.setHeader(
		"Set-Cookie",
		"seniwise_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
	);
	res.redirect("/login");
});

/**
 * Render the home page.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
app.get("/", (req, res) => {
	res.redirect("/residents");
});

/**
 * Render the residents list page.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
app.get("/residents", (req, res) => {
	res.render("list-residents");
});

/**
 * Proxy residents data for AJAX table requests.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
app.get("/residents/json", async (req, res) => {
	const apiUrl = new URL("/api/residents", apiHost);
	const queryKeys = ["q", "p", "sort_by", "sort_order"];
	for (const key of queryKeys) {
		if (typeof req.query[key] === "string") {
			apiUrl.searchParams.set(key, req.query[key]);
		}
	}

	try {
		const response = await fetch(apiUrl.toString(), {
			headers: { Accept: "application/json" },
		});
		const statusCode = response.status || 502;
		let payload = null;
		try {
			payload = await response.json();
		} catch (error) {
			payload = null;
		}

		if (!response.ok || !payload || payload.success !== true) {
			const errorPayload =
				payload && payload.error && typeof payload.error === "object"
					? payload.error
					: { code: statusCode, message: "Unable to fetch residents." };
			res.status(errorPayload.code || statusCode).json({
				success: false,
				error: errorPayload,
				result: payload ? payload.result ?? null : null,
			});
			return;
		}

		res.json(payload);
	} catch (error) {
		res.status(502).json({
			success: false,
			error: { code: 502, message: "Unable to reach residents API." },
			result: null,
		});
	}
});

/**
 * Proxy resident profile image requests.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
app.get("/residents/:uuid/image", async (req, res) => {
	const { uuid } = req.params;
	const apiUrl = new URL(`/api/residents/${uuid}/image`, apiHost);

	try {
		const response = await fetch(apiUrl.toString());
		if (!response.ok) {
			res.redirect("/media/default-avatar.png");
			return;
		}
		const contentType = response.headers.get("content-type");
		if (contentType) {
			res.setHeader("Content-Type", contentType);
		}
		const buffer = Buffer.from(await response.arrayBuffer());
		res.send(buffer);
	} catch (error) {
		res.redirect("/media/default-avatar.png");
	}
});

/**
 * Render the resident detail page.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
app.get("/residents/:uuid", async (req, res) => {
	const { uuid } = req.params;
	const apiResponse = await fetch(`${apiHost}/api/residents/${uuid}`);

	if (!apiResponse.ok) {
		res.status(404).render("404", { message: "Resident not found." });
		return;
	}

	const payload = await apiResponse.json();
	if (!payload || payload.success !== true || !payload.result) {
		res.status(404).render("404", { message: "Resident not found." });
		return;
	}

	const profile = payload.result.profile || {};
	const firstName = profile.first_name ? profile.first_name.value : "";
	const lastName = profile.last_name ? profile.last_name.value : "";
	const residentName = `${firstName} ${lastName}`.trim();
	const requestedTab = typeof req.query.tab === "string" ? req.query.tab : "";
	const allowedTabs = new Set(["overview", "visits", "edit-log"]);
	const activeTab = allowedTabs.has(requestedTab) ? requestedTab : "overview";

	res.render("view-resident", {
		resident: payload.result,
		resident_name: residentName || "Resident",
		active_tab: activeTab,
	});
});

/**
 * Render the resident "Add Visit" page.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
app.get("/residents/:uuid/add-visit", async (req, res) => {
	const { uuid } = req.params;
	const apiResponse = await fetch(`${apiHost}/api/residents/${uuid}/add-visit`);

	if (!apiResponse.ok) {
		res.status(404).render("404", { message: "Resident not found." });
		return;
	}

	const payload = await apiResponse.json();
	if (!payload || payload.success !== true || !payload.result) {
		res.status(404).render("404", { message: "Resident not found." });
		return;
	}

	const resident = payload.result && typeof payload.result.resident === "object" ? payload.result.resident : {};
	const visitCategories = Array.isArray(payload.result.visit_categories) ? payload.result.visit_categories: [];
	const residentPayload = {
		uuid,
		...resident,
	};

	res.render("add-visit", {
		resident: residentPayload,
		visit_categories: visitCategories,
	});
});

/**
 * "Accept" data from the resident "Add Visit" page.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
app.post("/residents/:uuid/add-visit", async (req, res) => {
	
	res.send(JSON.stringify({
		"success": true,
		"error": null
	}));

});

app.use("/api", createDemoApiRouter());

app.listen(port, () => {
	console.log(`Mockup server listening on http://localhost:${port}`);
});
