# Workspace overview — FarmVeda

Generated: 2026-11-14

## What this folder is

This workspace contains **FarmVeda**, a mobile-first farm monitoring and management application. The main app is a React 18 + TypeScript + Vite progressive web app (PWA). It provides farm and field records, sensor readings, irrigation planning, weather views, analytics, multilingual UI (English, Hindi, Kannada), onboarding, local demo authentication, and a voice assistant called Survam AI.

## What is present

### Root configuration and documentation

- `README.md` — describes FarmVeda's frontend features and local run/build commands. Some statements describe an earlier frontend-only architecture; see the backend section below for the current optional API implementation.
- `package.json`, `package-lock.json` — frontend scripts and locked JavaScript dependencies. Scripts include `npm run dev`, `npm run build`, and `npm run preview`.
- `index.html`, `vite.config.ts` — Vite app entry and development server configuration (port 3000).
- `tsconfig.json`, `tsconfig.node.json` — TypeScript compiler configuration.
- `tailwind.config.js`, `postcss.config.js`, `src/index.css` — styling setup.
- `.env.example` — example frontend API base URL (`VITE_API_BASE_URL`).
- `.gitignore` — ignore rules for generated/local files.

### Frontend source: `src/`

- `App.tsx`, `main.tsx` — application composition, routing-by-selected-view/state, local data loading, and feature event handling.
- `components/` — UI grouped by feature: authentication, onboarding, dashboard, farms/fields, sensors, analytics, irrigation, weather, schedule, insights, assistant, profile, settings, navigation, and shared UI.
- `context/AuthContext.tsx` — frontend user/session context; the existing UI includes local/demo authentication behavior.
- `db/dexieDb.ts`, `db/dbService.ts`, `db/seedData.ts` — IndexedDB/Dexie schema, data operations, and demo seed data. Device-local data remains the app's fallback and supports export/import/reset flows.
- `i18n/LanguageContext.tsx`, `i18n/translations.ts` — language state and translations.
- `services/sensorSimulator.ts` — simulated sensor readings/pulse behavior.
- `services/weatherService.ts` — frontend weather behavior (the frontend-only mode is simulated).
- `services/survamAiService.ts` — local rule-based assistant responses and agricultural prompts; it is not a cloud AI integration.
- `services/apiClient.ts` — optional HTTP client for the backend, enabled when `VITE_API_BASE_URL` is set.
- `types/index.ts` — shared frontend data types.
- `utils/crypto.ts` — cryptographic/helper functions.
- `vite-env.d.ts` — Vite environment type declarations.

### PWA assets: `public/`

- `manifest.json` — install metadata.
- `sw.js` — service worker/offline caching behavior.
- `icon-192.svg`, `icon-512.svg` — app icons.

### Optional backend: `backend/`

- `app/main.py` — FastAPI application, SQLAlchemy models, validation, authentication, historical analytics, configurable weather providers, and crop-threshold/six-hour-trend watering advice. Advice is explicitly non-actuating and experimental.
- `alembic.ini`, `alembic/` — database migration configuration and initial schema migration.
- `requirements.txt` — Python API and database dependencies.
- `Dockerfile`, `docker-compose.yml` — API container and PostgreSQL service configuration.
- `tests/test_validation.py` — backend validation tests.
- `scripts/seed_synthetic_demo.py` — creates a demo account with clearly labeled synthetic sensor history and irrigation events.
- `README.md` — backend setup, endpoint, weather-provider, and sensor-ingestion notes.
- `.env.example` — backend configuration template. A local `backend/.env` also exists; its values are intentionally not reproduced here.

The backend supports accounts, farms, fields, sensors, sensor-reading ingestion, analytics, weather snapshots, and irrigation schedules/recommendations. Reading validation converts declared units, checks ranges and timestamps, and rejects duplicates. Weather is disabled by default and can be enabled later with provider credentials; recent cached snapshots can be returned during provider failure. Recommendations combine crop moisture thresholds with an explainable six-hour linear trend estimate. This is a synthetic-data demo heuristic, not a trained or real-world validated prediction. Recommendations are advisory and do not control physical hardware.

### Generated/local directories

- `node_modules/` — installed frontend dependencies; generally not source to edit.
- `dist/` — generated Vite production output; regenerate with the build command.
- `backend/.venv/` and `backend/.pytest_cache/` — local Python environment and test cache.
- `.git/` — repository metadata.

## What is happening in the app/code

1. On startup the frontend initializes its local IndexedDB database and loads farms, fields, sensors, schedules, recommendations, assistant history, and preferences for the current local user.
2. When `VITE_API_BASE_URL` is configured, the frontend loads farms, fields, sensors, and sensor history from the API, requests irrigation advice for the selected field, and the Sensors view can send explicitly labeled simulated pings to backend ingestion. If the remote load fails, it logs an error and continues displaying local records.
3. Farm/field/sensor changes are written to the backend when configured, and local database operations are also used. The backend README describes remote authentication/full syncing as incremental work, so this is a mixed/local-first integration rather than a complete remote-only migration.
4. Without the API configured, the frontend periodically simulates a sensor data pulse for an active field about every 40 seconds. With the API configured, simulated readings are sent only when the user explicitly triggers a ping and are labeled `synthetic_demo`.
5. The UI presents analytics, weather/advisories, irrigation controls, schedules, insights, and the Survam assistant. The frontend weather and assistant behavior can be simulated/local; backend weather access is separately provider-configured.
6. The PWA manifest and service worker provide installability and offline-related behavior.

## Current repository state observed

Git reports these uncommitted paths: modified `src/App.tsx` and `src/context/AuthContext.tsx`; untracked `.env.example`, `backend/`, `src/services/apiClient.ts`, and `src/vite-env.d.ts`. This means backend/API integration work is present in the working tree but has not all been committed. No files under `node_modules`, `dist`, or local environment directories are listed in that status output.

This report describes files and code paths found in the workspace. It does **not** establish whether the Vite server, FastAPI server, or PostgreSQL container is currently running; runtime processes were not checked.

## Run commands

From the workspace root:

- `npm run dev` — start the frontend development server (Vite is configured for port 3000).
- `npm run build` — type-check and create production output in `dist/`.
- `npm run preview` — serve the production build locally.

For backend setup and required environment variables, see `backend/README.md`. The backend is optional for the frontend; set `VITE_API_BASE_URL` in a local frontend environment file to enable its API client.

## File inventory

Source/configuration files found (excluding dependency trees, generated build output, and caches):

```text
.env.example
.gitignore
README.md
index.html
package-lock.json
package.json
postcss.config.js
tailwind.config.js
tsconfig.json
tsconfig.node.json
vite.config.ts
public/icon-192.svg
public/icon-512.svg
public/manifest.json
public/sw.js
src/App.tsx
src/main.tsx
src/index.css
src/vite-env.d.ts
src/components/analytics/MoistureChart.tsx
src/components/assistant/FloatingMicButton.tsx
src/components/assistant/SurvamAssistantModal.tsx
src/components/assistant/VoiceWaveform.tsx
src/components/auth/AuthLayout.tsx
src/components/auth/AuthPage.tsx
src/components/auth/ForgotPasswordForm.tsx
src/components/auth/LoginForm.tsx
src/components/auth/SignUpForm.tsx
src/components/common/Header.tsx
src/components/common/InstallPrompt.tsx
src/components/common/Logo.tsx
src/components/common/OfflineBanner.tsx
src/components/dashboard/MetricsGrid.tsx
src/components/dashboard/NextScheduleCard.tsx
src/components/dashboard/TreeForgeDashboard.tsx
src/components/farms/FarmDetailModal.tsx
src/components/farms/FarmList.tsx
src/components/farms/FarmRegistrationForm.tsx
src/components/farms/FarmRegistrationModal.tsx
src/components/farms/FieldModal.tsx
src/components/insights/InsightsList.tsx
src/components/irrigation/IrrigationControls.tsx
src/components/navigation/BottomNav.tsx
src/components/navigation/Sidebar.tsx
src/components/onboarding/OnboardingWizard.tsx
src/components/profile/UserProfileView.tsx
src/components/schedule/ActivityModal.tsx
src/components/schedule/ScheduleTimeline.tsx
src/components/sensors/SensorDataInputForm.tsx
src/components/sensors/SensorList.tsx
src/components/sensors/SensorManualInputModal.tsx
src/components/sensors/SensorRegistrationModal.tsx
src/components/settings/SettingsView.tsx
src/components/weather/WeatherOverview.tsx
src/context/AuthContext.tsx
src/db/dbService.ts
src/db/dexieDb.ts
src/db/seedData.ts
src/i18n/LanguageContext.tsx
src/i18n/translations.ts
src/services/apiClient.ts
src/services/sensorSimulator.ts
src/services/survamAiService.ts
src/services/weatherService.ts
src/types/index.ts
src/utils/crypto.ts
backend/.env.example
backend/.gitignore
backend/Dockerfile
backend/README.md
backend/alembic.ini
backend/alembic/env.py
backend/alembic/script.py.mako
backend/alembic/versions/0001_initial_schema.py
backend/app/__init__.py
backend/app/main.py
backend/requirements.txt
backend/scripts/seed_synthetic_demo.py
backend/tests/test_validation.py
backend/docker-compose.yml
```
