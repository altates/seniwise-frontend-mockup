# Introduction

* This is for a patient tracking tool called Seniwise Portal.
* We need a lightweight UI framework as we are not using bootstrap or React or anything else.
* Custom UI components are prefixed `sui-` like `sui-menu` or `sui-avatar`
* Public file structure (under `./public/`) is:
  * /media -> images/icons
  * /style -> CSS files
  * /webfonts -> Custom webfont
  * /fontawesome -> Self explanatory
  * /scripts
* Public page end-points should be:
  * / -> Homepage
  * /residents -> Residents list
    * /residents/<UUID> -> View resident
  * /residents/json -> Residents list (AJAX proxy)
  * /onboarding -> Onboard patient/resident
  * /notifications
  * /settings
  * /login (if logged out)
  * /logout (if logged in)
* This is a mockup server running to provide these files + some fake APIs we can use.
  * `/api/...` represents the external API host (mocked locally for now). Client-side code must never call `/api` directly.
  * Use proxy endpoints on the frontend server (e.g., `/residents/json`, `/residents/:uuid`, `/residents/:uuid/image`) to fetch data/images from the API host and wrap responses.
* The following files are used and should be updated as we go:
  * `demo_users.js` -> Demo table for users.
  * `demo_residents.json` -> Demo table for residents.
  * `health_enums.mjs` -> Enum values
  * `labels_en_us.mjs` -> Localization (EN-US)
  * When we add/modify/change things, make sure to keep these updated.

# Important Notes

* ALWAYS read the codebase beforehand to prevent duplication of functionality.
* If a function is ONLY used in one place, make it inline and do NOT separate it to a different function.
* Write clean, understandable code. Document EVERYTHING with JSDoc.
* Before making changes, ask if you have any questions and give me a summary of changes you'll be doing.
  * Do not make changes before confirmation.
* After making changes, give me the summary again.

# Authentication

Mockup server must support some mockup authentication. Usernames can be:
- reha -> Reha Yurdakul
- atesh -> Ates Yurdakul
- korhan -> Korhan Ozmen
- huseyin -> Huseyin Avci
- mehmet -> Mehmet Bilginsoy
Password for all are hardcoded to be `ortak12lar`. Once "logged in", session should be stored
and delivered to EJS templates under `locals.session` with:

```json
{
  "username": "reha",
  "name": "Reha Yurdakul",
  "email": "reha@seniwise.com"
}
```

If not logged in, redirect to `/login` which will make a `POST` to `/login` with `username` and `password` for "checking."

# Resident Data

A resident has the following stored for them. For now, these can be stored in `demo_residents.js`.

### Profile
- First/last name (string)
- Image (string or null, API URL)
- Gender (enum)
- Room (string or null)
- Date of Birth (date)
- Birthplace (string)
- Nationality (string, country code)
- Identification Number (string)
- Address (string)
- Blood type (enum)
- Phone - Home (string)
- Phone - Mobile (string)
- Responsible Staff (username)

### General Health Information

(All these must be in English and as enums.)

| Category         | Enum value                         | Human label                                        |
| ---------------- | ---------------------------------- | -------------------------------------------------- |
| Independence     | `independent`                      | Independent in daily activities                    |
| Independence     | `partial-assistance`               | Needs partial assistance                           |
| Independence     | `full-care`                        | Requires full assistance                           |
| Mobility         | `normal`                           | Normal                                             |
| Mobility         | `bedridden`                        | Bedridden                                          |
| Mobility         | `wheelchair-dependent`             | Wheelchair-dependent                               |
| Mobility         | `crutches-or-cane`                 | Uses crutches or cane                              |
| Mobility         | `slow-or-unstable-walking`         | Slow or unstable walking                           |
| Motor Function   | `normal-hand-function`             | Normal hand function                               |
| Motor Function   | `limited-hand-function`            | Limited or no hand function                        |
| Motor Function   | `fine-motor-difficulty`            | Difficulty w/motor skills (e.g., buttoning clothes)|
| Vision           | `normal`                           | Normal                                             |
| Vision           | `impaired`                         | Impaired                                           |
| Vision           | `blind`                            | Blind                                              |
| Hearing          | `normal`                           | Normal                                             |
| Hearing          | `impaired`                         | Impaired                                           |
| Hearing          | `deaf`                             | Deaf                                               |
| Cognitive Status | `normal-cognition`                 | Normal cognition                                   |
| Cognitive Status | `mild-cognitive-impairment`        | Mild cognitive impairment                          |
| Cognitive Status | `dementia-alzheimers-symptoms`     | Dementia or Alzheimer's symptoms                   |

These are all free-text:

| Field             | Notes                                                           |
| ----------------- | --------------------------------------------------------------- |
| `chronic_illness` | Chronic conditions description                                  |
| `medications`     | Medications in use                                              |
| `allergies`       | Allergy details                                                 |
| `medical_history` | Surgeries, injuries, and related history                        |
| `relatives`       | Relatives and contact details (freeform)                        |

These are booleans:

| Field                        | Human label                  |
| ---------------------------- | ---------------------------- |
| `artificial_pacemaker`       | Artificial Pacemaker         |
| `catheter`                   | Catheter                     |
| `chemotherapy_port`          | Chemotherapy Port            |
| `cochlear_implant`           | Cochlear Implant             |
| `contact_lens`               | Contact Lens                 |
| `cpap`                       | CPAP                         |
| `eyeglasses`                 | Eyeglasses                   |
| `hearing_aid`                | Hearing Aid                  |
| `cardio_defibrillator_iacd`  | CardioDefibrillator (IACD)   |
| `insulin_pump`               | Insulin Pump                 |
| `oxygen`                     | Oxygen                       |
| `prosthetic_heart_valves`    | Prosthetic Heart Valves      |
| `bioprosthetic`              | Bioprosthetic                |

Keys should follow `snake_structure` while enum values follow `kebab-case`.

Example:

```json
{
  "profile": {
    "first_name": "Mehmet",
    "last_name": "Suyabasan",
    "birthplace": "Ankara",
    "nationality": "TR",
    "address": "123 Fake Street",
    "blood_type": "0 rh+",
    "home_phone": null,
    "mobile_phone": "9294530506"
  },
  "health": {
    "independence": "independent",
    "mobility": "wheelchair-dependent",
	...
    "chronic_illness": "Bazen nerede oldugunu unutuyor.."
	...
  },
  "equipment_used": {
    "artificial_pacemaker": true
  }
}
```

## Localization

When the front-end fetches this information, translation/display values must be sent with the data.

```json
{
  "profile": {
    "first_name": {
		"value": "Mehmet",
		"label": "First Name"
	},
	...
  },
  "health": {
    "independence": {
		"value": "independent",
		"label": "Independence Level"
	},
	...
  },
  "equipment_used": {
    "artificial_pacemaker": {
		"value": true,
		"label": "Artificial Pacemaker"
	}
  }
}
```

## Visits

The system is used to log caretakers visiting residents. Each visit, the caretaker can perform one or more of these:

- **Medical Care**
  - Medication administration (boolean)
  - Vital measurements (free text)
    - Blood pressure
    - Pulse
    - Temperature
    - Oxygen saturation
  - Wound care & dressing (boolean)
  - Injections / IV therapy (boolean)
  - Medical reporting & referrals (boolean)

- **Personal Care** (all boolean)
  - Personal hygiene
    - In-bed body cleaning
    - Bathing / shower assistance
    - Hair cutting & care
    - Nail care
  - Toileting & incontinence care
  - Dressing & undressing assistance
  - Feeding assistance
  - Mobility support
    - Assisted walking
    - Transfers (bed to chair)
    - Wheelchair use
  - Companionship & emotional support

- **Housekeeping** (all boolean)
  - Room cleaning & tidying
  - Laundry & clothing care
  - Bed linen changes
  - Environmental hygiene
    - Disinfection
    - Odor control
  - Shared space maintenance

- **Supportive Services** (all boolean)
  - Meal service & dietary monitoring
    - Regular meals
    - Tube feeding
    - IV nutrition
    - Other nutrition methods
    - Meal refused / not eaten
  - Activity support
    - Rehabilitation exercises
    - Group activities

Each of these need a key. When a visit is complete, the caretaker will `check` or `enter data` if they've done any of them.
Once done, they should be logged as:

```json
{
	"date": "<ISO timestamp>",
	"caretaker": "<username>",
	"actions": [
		{
			"key": "medication-administration"
		},
		{
			"key": "temperature",
			"value": "38.4 c"
		}
	]
}
```

# API

* API Responses should follow this format:
```json
{
	"success": true,
	"error": null,
	"result": ...
}
```

* Whereas `error` can contain an object containing an HTML error code + a user-readable message, like so:
```json
{
	"success": false,
	"error": { "code": 404, "message": "This page could not be found." },
	"result": ...
}
```

* If an API contains pagination, information about that must be delivered, in this format:
```json
{
  "success": true,
  "error": null,
  "result": {
    "pagination": {
      "current": 2,
      "total": 10,
      "totalItems": 198
    },
    "items": [...]
  }
}
```

* Fake APIs should contain:
  * /api/residents/?q=<optional query>&p=<optional page, zero-indexed>&sort_by=<optional field>&sort_order=<optional order> -> Returns paginated residents, 20 per page.
    * If `q` is set, search is performed on first name and last name for now.
    * `sort_by` can be: `name`, `responsible_staff`, `birth_date`, `gender`, `room`, `last_visit_date`, `last_visit_staff`
    * `sort_order` can be: `asc` or `desc`
  * /api/residents/<UUID> -> Returns resident information
  * /api/residents/<UUID>/image -> Returns resident profile image
