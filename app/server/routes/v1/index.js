const router = require('express').Router();
const httpContext = require("express-http-context");
const { currentUser } = require('../../middleware/authentication');


const userRouter = require("./user");
const licenceTypesRouter = require("./licenceTypes");
const licenceStatusesRouter = require("./licenceStatuses");
const licencesRouter = require("./licences");
const sitesRouter = require("./sites");
const regionalDistrictsRouter = require("./regionalDistricts");
const regionsRouter = require("./regions");
const commentsRouter = require("./comments");
const licenceSpeciesRouter = require("./licenceSpecies");
const slaughterhouseSpeciesRouter = require("./slaughterhouseSpecies");
const documentsRouter = require("./documents");
const citiesRouter = require("./cities");
const adminRouter = require("./admin");
const dairyFarmTestThresholdsRouter = require("./dairyFarmTestThresholds");
const inspectionsRouter = require("./inspections");
const constants = require("../../utilities/constants");
const roleValidation = require("../../middleware/roleValidation");

router.use(currentUser);

router.use((req, res, next) => {
    if (req.currentUser) {
        httpContext.set("currentUser", req.currentUser);
    }
    next();
});

// Base v1 Responder
router.get('/', (_req, res) => {
    res.status(200).json({
        endpoints: [
            '/user',
            '/licence-types',
            '/licence-statuses',
            '/licences',
            '/sites',
            '/regional-districts',
            '/regions',
            '/config',
            '/comments',
            '/licence-species',
            '/slaughterhouse-species',
            '/documents',
            '/cities',
            '/dairyfarmtestthresholds',
            '/inspections',
            '/admin'
        ]
    });
});

router.use("/user", userRouter);
router.use(
    "/licence-types",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    licenceTypesRouter
);
router.use(
    "/licence-statuses",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    licenceStatusesRouter
);
router.use(
    "/licences",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    licencesRouter
);
router.use(
    "/sites",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    sitesRouter
);
router.use(
    "/regional-districts",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    regionalDistrictsRouter
);
router.use(
    "/regions",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    regionsRouter
);
router.use(
    "/comments",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    commentsRouter.router
);
router.use(
    "/licence-species",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    licenceSpeciesRouter
);
router.use(
    "/slaughterhouse-species",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    slaughterhouseSpeciesRouter
);
router.use(
    "/documents",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    documentsRouter
);
router.use(
    "/cities",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    citiesRouter
);
router.use(
    "/dairyfarmtestthresholds",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    dairyFarmTestThresholdsRouter
);
router.use(
    "/inspections",
    roleValidation([
        constants.SYSTEM_ROLES.READ_ONLY,
        constants.SYSTEM_ROLES.USER,
        constants.SYSTEM_ROLES.INSPECTOR,
        constants.SYSTEM_ROLES.SYSTEM_ADMIN,
    ]),
    inspectionsRouter
);
router.use(
    "/admin",
    roleValidation([constants.SYSTEM_ROLES.SYSTEM_ADMIN]),
    adminRouter
);

module.exports = router;
