[![img](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# nr-mals

The Ministry of Agriculture Licencing System (MALS) was created with intent of being a single licensing application, replacing various disparate Animal Industry Branch licensing applications.

## Architecture

MALS is a full-stack web application deployed on OpenShift using containers:

- **Backend**: Node.js (Express), located in `backend/`, runs as a container in OpenShift, exposes REST APIs and handles business logic.
- **Frontend**: React, located in `frontend/`, runs as a container in OpenShift, provides the user interface and interacts with backend APIs.
- **Database**: PostgreSQL, managed via Spilo and Patroni for high availability, Prisma ORM (`backend/prisma/schema.prisma`).
- **Containerization**: Dockerfiles for backend, frontend, migrations, and database services.
- **Orchestration**: Uses `docker-compose.yml` for local development; Helm charts for OpenShift deployment.

See the architecture diagram in `.diagrams/architecture.mmd` for a visual overview.

## Technologies Used

- **Backend**: Node.js, Express, Prisma, JWT, Keycloak (authentication), ESLint, Prettier, Vitest (testing)
- **Frontend**: React, Redux Toolkit, React Bootstrap, Keycloak JS, Playwright (e2e testing), TypeScript, Sass
- **Database**: PostgreSQL
- **DevOps**: GitHub Actions for CI/CD, SonarCloud for code analysis, Trivy for security scanning
- **Containerization**: Docker, Helm, OpenShift

## Database

- **Schema**: Defined in `backend/prisma/schema.prisma` using Prisma ORM
- **Models**: Covers licensing, inspections, inventory, registrants, premises, and more
- **Migrations**: Managed via Prisma and SQL scripts in `migrations/sql/`

## CI/CD & GitHub Actions

- Automated tests and code analysis for backend and frontend on PRs and pushes (`.github/workflows/analysis.yml`)
- Security scanning with Trivy
- Helm-based deployment to OpenShift (`.github/workflows/.deployer.yml`)
- PR validation workflows (`.github/workflows/pr-validate.yml`)

## Getting Started

- See `HOWTO.md` for setup instructions
- Local development: `docker-compose up` to start all services
- Deployment: Use Helm charts in `charts/app/` for OpenShift

## License

Apache-2.0
