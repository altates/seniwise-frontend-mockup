/**
 * @typedef {Object} DemoUser
 * @property {string} username
 * @property {string} name
 * @property {string} email
 */

/**
 * @type {string}
 */
const DEMO_PASSWORD = "ortak12lar";

/**
 * @type {DemoUser[]}
 */
const DEMO_USERS = [
	{
		username: "reha",
		name: "Reha Yurdakul",
		email: "reha@seniwise.com",
	},
	{
		username: "atesh",
		name: "Ates Yurdakul",
		email: "atesh@seniwise.com",
	},
	{
		username: "korhan",
		name: "Korhan Ozmen",
		email: "korhan@seniwise.com",
	},
	{
		username: "huseyin",
		name: "Huseyin Avci",
		email: "huseyin@seniwise.com",
	},
	{
		username: "mehmet",
		name: "Mehmet Bilginsoy",
		email: "mehmet@seniwise.com",
	},
];

/**
 * @type {Map<string, DemoUser>}
 */
const USERS_BY_USERNAME = new Map(
	DEMO_USERS.map((user) => [user.username, user])
);

module.exports = {
	DEMO_PASSWORD,
	DEMO_USERS,
	USERS_BY_USERNAME,
};
