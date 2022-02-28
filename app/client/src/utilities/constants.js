// Paths
export const HOME_PATHNAME = "/";
export const LICENSES_PATHNAME = "/licenses";
export const SEARCH_LICENSES_PATHNAME = "/licenses/search";
export const LICENSE_RESULTS_PATHNAME = "/licenses/results";
export const CREATE_LICENSES_PATHNAME = "/licenses/create";
export const REGISTRANTS_PATHNAME = "/registrants";
export const SEARCH_REGISTRANTS_PATHNAME = "/registrants/search";
export const SITES_PATHNAME = "/sites";
export const SEARCH_SITES_PATHNAME = "/sites/search";
export const CREATE_SITES_PATHNAME = "/sites/create";
export const SITE_RESULTS_PATHNAME = "/sites/results";
export const CONTACTS_PATHNAME = "/contacts";
export const CREATE_CONTACTS_PATHNAME = "/contacts/create";
export const INSPECTIONS_PATHNAME = "/inspections";
export const SEARCH_INSPECTIONS_PATHNAME = "/inspections/search";
export const CREATE_INSPECTIONS_PATHNAME = "/inspections/create";
export const DOCUMENT_GENERATION_PATHNAME = "/documents";
export const REPORTS_PATHNAME = "/documents/reports";
export const SELECT_CERTIFICATES_PATHNAME = "/documents/certificates";
export const DOWNLOAD_CERTIFICATES_PATHNAME =
  "/documents/certificates/download";
export const SELECT_RENEWALS_PATHNAME = "/documents/renewals";
export const SELECT_RENEWALS_APIARY_PATHNAME = "/documents/renewals/apiary";
export const DOWNLOAD_RENEWALS_PATHNAME = "/documents/renewals/download";
export const SELECT_DAIRYNOTICES_PATHNAME = "/documents/dairynotices";
export const DOWNLOAD_DAIRYNOTICES_PATHNAME =
  "/documents/dairynotices/download";
export const SELECT_DAIRYTANKNOTICES_PATHNAME = "/documents/dairytanknotices";
export const DOWNLOAD_DAIRYTANKNOTICES_PATHNAME =
  "/documents/dairytanknotices/download";

export const ADMIN_PATHNAME = "/admin";
export const ADMIN_CONFIG_PATHNAME = "/admin/config";
export const ADMIN_DAIRY_TEST_RESULTS_PATHNAME = "/admin/dairytestresults";
export const ADMIN_PREMISES_ID_PATHNAME = "/admin/premisesid";
export const LICENSE_TYPES_ADMIN_PATHNAME = "/admin/license-types";
export const SITES_ADMIN_PATHNAME = "/admin/sites";
export const INSPECTIONS_ADMIN_PATHNAME = "/admin/inspections";

export const REQUEST_STATUS = {
  IDLE: "idle",
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

export const SEARCH_TYPE = {
  SIMPLE: "simple",
  ADVANCED: "advanced",
};

export const LICENCE_MODE = {
  CREATE: "create",
  VIEW: "view",
  EDIT: "edit",
};

export const REGISTRANT_MODE = {
  CREATE: "create",
  VIEW: "view",
  EDIT: "edit",
};

export const DAIRY_TANK_MODE = {
  CREATE: "create",
  VIEW: "view",
  EDIT: "edit",
};

export const REGISTRANT_STATUS = {
  NEW: "new",
  EXISTING: "existing",
  DELETED: "deleted",
  CANCELLED: "cancelled",
};

export const DAIRY_TANK_STATUS = {
  NEW: "new",
  EXISTING: "existing",
  DELETED: "deleted",
  CANCELLED: "cancelled",
};

export const ADDRESS_TYPES = {
  PRIMARY: "Primary",
  MAILING: "Mailing",
};

export const PHONE_NUMBER_TYPES = {
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
  FAX: "Fax",
};

export const LICENCE_STATUS_TYPES = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  EXPIRED: "Expired",
  INACTIVE: "Inactive",
  PENDING: "Pending",
};

export const COUNTRIES = {
  CANADA: "Canada",
  UNITEDSTATES: "United States",
};

export const COUNTRIES_MAP = [COUNTRIES.CANADA, COUNTRIES.UNITEDSTATES];

export const PROVINCES = {
  BC: "BC",
};

export const SPECIES_SUBCODES = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  SLAUGHTERED: "SLAUGHTERED",
  CALVES: "CALVES",
  TAG: "TAG",
};

export const ADMIN_CONFIG_OPTIONS = {
  MANAGE_USERS: "ManageUsers",
  MANAGE_DAIRY_THRESHOLDS: "ManageDairyThresholds",
  MANAGE_LICENCE_TYPES: "ManageLicenceTypes",
  MANAGE_FUR_SPECIES: "ManageFurSpecies",
  MANAGE_GAME_SPECIES: "ManageGameSpecies",
  MANAGE_SLAUGHTER_SPECIES: "ManageSlaughterSpecies",
};

// Report types
// Value must match mal_print_job_output.document_type
export const REPORTS = {
  ACTION_REQUIRED: "ACTION_REQUIRED",
  APIARY_INSPECTION: "APIARY_INSPECTION",
  APIARY_PRODUCER_REGION: "APIARY_PRODUCER_REGION",
  APIARY_PRODUCER_CITY: "APIARY_PRODUCER_CITY",
  APIARY_SITE: "APIARY_SITE",
  CLIENT_DETAILS: "VETERINARY_DRUG_DETAILS",
  DAIRY_FARM_DETAIL: "DAIRY_FARM_DETAIL",
  DAIRY_FARM_QUALITY: "DAIRY_FARM_QUALITY",
  DAIRY_FARM_TANK: "DAIRY_FARM_TANK",
  DAIRY_TEST_THRESHOLD: "DAIRY_TEST_THRESHOLD",
  LICENCE_LOCATION: "LICENCE_LOCATION",
  LICENCE_EXPIRY: "LICENCE_EXPIRY",
};

export const SYSTEM_ROLES = {
  SYSTEM_ADMIN: 1,
  INSPECTOR: 2,
  USER: 3,
  READ_ONLY: 4,
};

export const DAIRY_TEST_THRESHOLD_IDS = {
  WATER: 1, // CRY
  IH: 2,
  SCC: 3,
  IBC: 4, // SPC1
  FFA: 5,
};
