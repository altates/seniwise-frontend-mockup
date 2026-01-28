/**
 * Health enum and field metadata with localization keys only.
 * @format
 */

/**
 * @typedef {Object} LookupOption
 * @property {string} value
 * @property {string} label_key
 */

/**
 * @typedef {Object} LookupGroup
 * @property {string} key
 * @property {string} label_key
 * @property {LookupOption[]} options
 */

/**
 * @typedef {Object} LookupField
 * @property {string} key
 * @property {string} label_key
 */

/**
 * @typedef {Object} LookupFieldWithNotes
 * @property {string} key
 * @property {string} label_key
 * @property {string} notes_key
 */

/**
 * Health enum groups for resident general health information.
 * @type {LookupGroup[]}
 */
export const HEALTH_ENUM_GROUPS = [
	{
		key: "independence",
		label_key: "health.category.independence",
		options: [
			{
				value: "independent",
				label_key: "health.independence.independent",
			},
			{
				value: "partial-assistance",
				label_key: "health.independence.partial-assistance",
			},
			{
				value: "full-care",
				label_key: "health.independence.full-care",
			},
		],
	},
	{
		key: "mobility",
		label_key: "health.category.mobility",
		options: [
			{
				value: "normal",
				label_key: "health.mobility.normal",
			},
			{
				value: "bedridden",
				label_key: "health.mobility.bedridden",
			},
			{
				value: "wheelchair-dependent",
				label_key: "health.mobility.wheelchair-dependent",
			},
			{
				value: "crutches-or-cane",
				label_key: "health.mobility.crutches-or-cane",
			},
			{
				value: "slow-or-unstable-walking",
				label_key: "health.mobility.slow-or-unstable-walking",
			},
		],
	},
	{
		key: "motor_function",
		label_key: "health.category.motor-function",
		options: [
			{
				value: "normal-hand-function",
				label_key: "health.motor-function.normal-hand-function",
			},
			{
				value: "limited-hand-function",
				label_key: "health.motor-function.limited-hand-function",
			},
			{
				value: "fine-motor-difficulty",
				label_key: "health.motor-function.fine-motor-difficulty",
			},
		],
	},
	{
		key: "vision",
		label_key: "health.category.vision",
		options: [
			{
				value: "normal",
				label_key: "health.vision.normal",
			},
			{
				value: "impaired",
				label_key: "health.vision.impaired",
			},
			{
				value: "blind",
				label_key: "health.vision.blind",
			},
		],
	},
	{
		key: "hearing",
		label_key: "health.category.hearing",
		options: [
			{
				value: "normal",
				label_key: "health.hearing.normal",
			},
			{
				value: "impaired",
				label_key: "health.hearing.impaired",
			},
			{
				value: "deaf",
				label_key: "health.hearing.deaf",
			},
		],
	},
	{
		key: "cognitive_status",
		label_key: "health.category.cognitive-status",
		options: [
			{
				value: "normal-cognition",
				label_key: "health.cognitive-status.normal-cognition",
			},
			{
				value: "mild-cognitive-impairment",
				label_key: "health.cognitive-status.mild-cognitive-impairment",
			},
			{
				value: "dementia-alzheimers-symptoms",
				label_key: "health.cognitive-status.dementia-alzheimers-symptoms",
			},
		],
	},
];

/**
 * Free-text health fields captured for a resident.
 * @type {LookupFieldWithNotes[]}
 */
export const HEALTH_FREE_TEXT_FIELDS = [
	{
		key: "chronic_illness",
		label_key: "health.free-text.chronic-illness",
		notes_key: "health.free-text.chronic-illness.notes",
	},
	{
		key: "medications",
		label_key: "health.free-text.medications",
		notes_key: "health.free-text.medications.notes",
	},
	{
		key: "allergies",
		label_key: "health.free-text.allergies",
		notes_key: "health.free-text.allergies.notes",
	},
	{
		key: "medical_history",
		label_key: "health.free-text.medical-history",
		notes_key: "health.free-text.medical-history.notes",
	},
];

/**
 * Boolean equipment/assistive devices used by a resident.
 * @type {LookupField[]}
 */
export const HEALTH_EQUIPMENT_FIELDS = [
	{
		key: "artificial_pacemaker",
		label_key: "health.equipment.artificial-pacemaker",
	},
	{
		key: "catheter",
		label_key: "health.equipment.catheter",
	},
	{
		key: "chemotherapy_port",
		label_key: "health.equipment.chemotherapy-port",
	},
	{
		key: "cochlear_implant",
		label_key: "health.equipment.cochlear-implant",
	},
	{
		key: "contact_lens",
		label_key: "health.equipment.contact-lens",
	},
	{
		key: "cpap",
		label_key: "health.equipment.cpap",
	},
	{
		key: "eyeglasses",
		label_key: "health.equipment.eyeglasses",
	},
	{
		key: "hearing_aid",
		label_key: "health.equipment.hearing-aid",
	},
	{
		key: "cardio_defibrillator_iacd",
		label_key: "health.equipment.cardio-defibrillator-iacd",
	},
	{
		key: "insulin_pump",
		label_key: "health.equipment.insulin-pump",
	},
	{
		key: "oxygen",
		label_key: "health.equipment.oxygen",
	},
	{
		key: "prosthetic_heart_valves",
		label_key: "health.equipment.prosthetic-heart-valves",
	},
	{
		key: "bioprosthetic",
		label_key: "health.equipment.bioprosthetic",
	},
];

/**
 * @typedef {Object} VisitAction
 * @property {string} key
 * @property {string} label_key
 * @property {string} icon
 * @property {"boolean" | "text"} type
 */

/**
 * @typedef {Object} VisitGroup
 * @property {string} key
 * @property {string} label_key
 * @property {string} icon
 * @property {VisitAction[]} actions
 */

/**
 * @typedef {Object} VisitCategory
 * @property {string} key
 * @property {string} label_key
 * @property {string} icon
 * @property {VisitAction[]} actions
 * @property {VisitGroup[]} groups
 */

/**
 * Visit categories and actions for caretaker visits.
 * @type {VisitCategory[]}
 */
export const VISIT_CATEGORIES = [
	{
		key: "medical-care",
		label_key: "visits.category.medical-care",
		icon: "fa-briefcase-medical",
		actions: [
			{
				key: "medication-administration",
				label_key: "visits.action.medication-administration",
				icon: "fa-pills",
				type: "boolean",
			},
			{
				key: "wound-care-dressing",
				label_key: "visits.action.wound-care-dressing",
				icon: "fa-bandage",
				type: "boolean",
			},
			{
				key: "injections-iv-therapy",
				label_key: "visits.action.injections-iv-therapy",
				icon: "fa-syringe",
				type: "boolean",
			},
			{
				key: "medical-reporting-referrals",
				label_key: "visits.action.medical-reporting-referrals",
				icon: "fa-file-medical",
				type: "boolean",
			},
		],
		groups: [
			{
				key: "vital-measurements",
				label_key: "visits.group.vital-measurements",
				icon: "fa-stethoscope",
				actions: [
					{
						key: "blood-pressure",
						label_key: "visits.action.blood-pressure",
						icon: "fa-heart-pulse",
						type: "text",
					},
					{
						key: "pulse",
						label_key: "visits.action.pulse",
						icon: "fa-wave-square",
						type: "text",
					},
					{
						key: "temperature",
						label_key: "visits.action.temperature",
						icon: "fa-thermometer-half",
						type: "text",
					},
					{
						key: "oxygen-saturation",
						label_key: "visits.action.oxygen-saturation",
						icon: "fa-lungs",
						type: "text",
					},
				],
			},
		],
	},
	{
		key: "personal-care",
		label_key: "visits.category.personal-care",
		icon: "fa-user-nurse",
		actions: [
			{
				key: "toileting-incontinence-care",
				label_key: "visits.action.toileting-incontinence-care",
				icon: "fa-toilet",
				type: "boolean",
			},
			{
				key: "dressing-undressing-assistance",
				label_key: "visits.action.dressing-undressing-assistance",
				icon: "fa-shirt",
				type: "boolean",
			},
			{
				key: "feeding-assistance",
				label_key: "visits.action.feeding-assistance",
				icon: "fa-utensils",
				type: "boolean",
			},
			{
				key: "companionship-emotional-support",
				label_key: "visits.action.companionship-emotional-support",
				icon: "fa-heart",
				type: "boolean",
			},
		],
		groups: [
			{
				key: "personal-hygiene",
				label_key: "visits.group.personal-hygiene",
				icon: "fa-shower",
				actions: [
					{
						key: "in-bed-body-cleaning",
						label_key: "visits.action.in-bed-body-cleaning",
						icon: "fa-bed",
						type: "boolean",
					},
					{
						key: "bathing-shower-assistance",
						label_key: "visits.action.bathing-shower-assistance",
						icon: "fa-shower",
						type: "boolean",
					},
					{
						key: "hair-cutting-care",
						label_key: "visits.action.hair-cutting-care",
						icon: "fa-scissors",
						type: "boolean",
					},
					{
						key: "nail-care",
						label_key: "visits.action.nail-care",
						icon: "fa-hand-sparkles",
						type: "boolean",
					},
				],
			},
			{
				key: "mobility-support",
				label_key: "visits.group.mobility-support",
				icon: "fa-person-walking",
				actions: [
					{
						key: "assisted-walking",
						label_key: "visits.action.assisted-walking",
						icon: "fa-walking",
						type: "boolean",
					},
					{
						key: "transfers-bed-to-chair",
						label_key: "visits.action.transfers-bed-to-chair",
						icon: "fa-exchange-alt",
						type: "boolean",
					},
					{
						key: "wheelchair-use",
						label_key: "visits.action.wheelchair-use",
						icon: "fa-wheelchair",
						type: "boolean",
					},
				],
			},
		],
	},
	{
		key: "housekeeping",
		label_key: "visits.category.housekeeping",
		icon: "fa-broom",
		actions: [
			{
				key: "room-cleaning-tidying",
				label_key: "visits.action.room-cleaning-tidying",
				icon: "fa-broom",
				type: "boolean",
			},
			{
				key: "laundry-clothing-care",
				label_key: "visits.action.laundry-clothing-care",
				icon: "fa-soap",
				type: "boolean",
			},
			{
				key: "bed-linen-changes",
				label_key: "visits.action.bed-linen-changes",
				icon: "fa-bed",
				type: "boolean",
			},
			{
				key: "shared-space-maintenance",
				label_key: "visits.action.shared-space-maintenance",
				icon: "fa-users",
				type: "boolean",
			},
		],
		groups: [
			{
				key: "environmental-hygiene",
				label_key: "visits.group.environmental-hygiene",
				icon: "fa-spray-can",
				actions: [
					{
						key: "disinfection",
						label_key: "visits.action.disinfection",
						icon: "fa-spray-can-sparkles",
						type: "boolean",
					},
					{
						key: "odor-control",
						label_key: "visits.action.odor-control",
						icon: "fa-wind",
						type: "boolean",
					},
				],
			},
		],
	},
	{
		key: "supportive-services",
		label_key: "visits.category.supportive-services",
		icon: "fa-handshake-angle",
		actions: [],
		groups: [
			{
				key: "meal-service-dietary-monitoring",
				label_key: "visits.group.meal-service-dietary-monitoring",
				icon: "fa-utensils",
				actions: [
					{
						key: "regular-meals",
						label_key: "visits.action.regular-meals",
						icon: "fa-utensils",
						type: "boolean",
					},
					{
						key: "tube-feeding",
						label_key: "visits.action.tube-feeding",
						icon: "fa-hand-holding-medical",
						type: "boolean",
					},
					{
						key: "iv-nutrition",
						label_key: "visits.action.iv-nutrition",
						icon: "fa-vial",
						type: "boolean",
					},
					{
						key: "other-nutrition-methods",
						label_key: "visits.action.other-nutrition-methods",
						icon: "fa-bottle-water",
						type: "boolean",
					},
					{
						key: "meal-refused",
						label_key: "visits.action.meal-refused",
						icon: "fa-ban",
						type: "boolean",
					},
				],
			},
			{
				key: "activity-support",
				label_key: "visits.group.activity-support",
				icon: "fa-people-group",
				actions: [
					{
						key: "rehabilitation-exercises",
						label_key: "visits.action.rehabilitation-exercises",
						icon: "fa-dumbbell",
						type: "boolean",
					},
					{
						key: "group-activities",
						label_key: "visits.action.group-activities",
						icon: "fa-users",
						type: "boolean",
					},
				],
			},
		],
	},
];
