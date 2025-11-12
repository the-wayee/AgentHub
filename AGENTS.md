# Repository Guidelines

## Project Structure & Module Organization
- Backend (Spring Boot, Java 17): `src/main/java/com/xiaoguai/agentx`
  - Layers: `interfaces` (REST), `application` (use cases/services), `domain` (entities, factories), `infrastrcture` (persistence, email, utils).
  - Config: `src/main/resources/application.yml`
- Tests: `src/test/java` (JUnit 5 + Spring Boot)
- Frontend (Next.js + TypeScript): `AgentHub-Front/`
- Ops: `Dockerfile`, `docker-compose.yml`, `init.sql`

## Build, Test, and Development Commands
- Backend dev: `./mvnw spring-boot:run` (API on `http://localhost:8080/api`)
- Backend build: `./mvnw clean package` (artifact in `target/`)
- Backend tests: `./mvnw test`
- Frontend dev: `cd AgentHub-Front && npm install && npm run dev`
- Frontend build/start: `cd AgentHub-Front && npm run build && npm start`
- All via Docker: `docker compose up -d --build`

## Coding Style & Naming Conventions
- Java: 4 spaces; classes `PascalCase`; methods/fields `camelCase`; constants `UPPER_SNAKE_CASE`.
- Package root: `com.xiaoguai.agentx`. Controllers end with `Controller`; DTOs under `interfaces.dto.*`; services under `application.*`.
- Keep DDD boundaries: interface → application → domain → infrastrcture.
- Frontend: follow ESLint rules in `AgentHub-Front/.eslintrc.json`; components `PascalCase`; hooks `useXxx`.

## Testing Guidelines
- Prefer unit tests; use JUnit 5. Integration tests may use `@SpringBootTest` and a local PostgreSQL; mock external services.
- Naming: `*Tests.java` mirroring package paths.
- Run: `./mvnw test`. Frontend checks: `npm run lint`, `npm run type-check`.
- Aim for meaningful coverage on domain and application layers.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `type(scope): short description` (e.g., `feat(back): add agent workflow`).
- PRs include: purpose, changes, test steps, linked issues, and screenshots/GIFs for UI.
- Ensure tests pass, update docs, and keep diffs focused.

## Security & Configuration Tips
- Do not commit secrets. Configure via env vars consumed by `application.yml` (e.g., `DB_HOST`, `DB_USERNAME`, `SILICONFLOW_API_KEY`, mail settings).
- Seed DB with `init.sql` if needed. Review `docker-compose.yml` for local defaults.
