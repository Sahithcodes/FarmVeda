# FarmVeda backend

## Existing frontend architecture

The repository currently contains a React 18 + TypeScript + Vite PWA (not Next.js). UI components, English/Hindi/Kannada translations, Web Speech voice guidance and the service worker live under `../src`. Farm, field, sensor, telemetry, irrigation, schedules, recommendations and user records are held in Dexie/IndexedDB (`src/db/dexieDb.ts`, `src/db/dbService.ts`). Login/signup are local demo authentication; the weather service and periodic sensor pulse are simulated. Settings can export/import JSON and reset/clear local data. These features and records remain intact.

This backend provides a PostgreSQL-backed API and an optional frontend HTTP client. When `VITE_API_BASE_URL` is set, authentication, farms, fields, sensors, sensor history, readings, and irrigation advice use the API. Some screens (including weather display, daily activities, and settings) remain device-local/demo behavior; local IndexedDB is still used for app preferences and offline support.

## Architecture and structure

FastAPI modular monolith, SQLAlchemy 2, Pydantic 2, Psycopg 3, Alembic and PostgreSQL. Sensor readings are UTC-normalized, range-checked and uniquely keyed by `(sensor_id, recorded_at)`. Batch ingestion commits each accepted item independently and explicitly lists rejects. Irrigation recommendations are configurable rule-based advisories, not ML; irrigation event endpoints only persist records and do not control hardware.

`app/main.py` currently contains the application models, request schemas, routes and service helpers; routes are grouped by URL prefix. `alembic/` contains migration configuration. This compact layout can be split into modules without changing API contracts.

## Local setup on Windows (native PostgreSQL)

Prerequisites: Python 3.11+, PostgreSQL installed and running as a Windows service, and Node.js/npm for the frontend. Docker and Docker Compose are optional and not needed for this workflow. If PostgreSQL is installed but `psql` is not on PATH, use pgAdmin's Query Tool instead. Create a database user and database (replace the sample password with your own):

```powershell
psql -U postgres -h localhost -c "CREATE USER farmveda WITH LOGIN PASSWORD 'ChooseYourOwnPassword';"
psql -U postgres -h localhost -c "CREATE DATABASE farmveda OWNER farmveda;"
```

Copy `.env.example` to `.env` only if it does not already exist, then set `DATABASE_URL=postgresql+psycopg://farmveda:YOUR_PASSWORD@localhost:5432/farmveda`. URL-encode reserved characters in the password. Set `JWT_SECRET_KEY` to a long random value. Ensure `FRONTEND_ORIGIN=http://localhost:3000` matches Vite's configured port. Keep local credentials private.

PowerShell, backend terminal:

```powershell
Set-Location "C:\Users\venka\all works\Infosys\backend"
if (!(Test-Path .env)) { Copy-Item .env.example .env }
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
python scripts\seed_synthetic_demo.py
python scripts\seed_farmveda_demo.py
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

`seed_synthetic_demo.py` creates the `demo@farmveda.com` account if missing, plus the Synthetic Demo Farm, its field and sensor, 120 historical readings, and eight watering events. Its existing-account path verifies the linked synthetic data and does not replace the password. All generated historical data is marked `synthetic_demo` and is for interface demonstration only, not real-world model validation.

`seed_farmveda_demo.py` registers the two UI demo farms (Annapurna Organic Farm and Kaveri Riverfield), their four fields and four matching sensors. It uses stable IDs and looks up existing records by ID/name/code, so it can be run repeatedly. It never deletes records or rewrites reading history. It creates 48 varied, crop-appropriate readings per new sensor only when that sensor has no existing readings; those rows are labelled `source=synthetic_demo` and `quality_status=synthetic`. It preserves the existing Synthetic Demo Farm and its readings, including manual readings. The existing demo account is required; the script aligns the account display name with the UI but never changes its email, ID or password.

After running both seed scripts, the demo account should list three farms total: Synthetic Demo Farm (existing), Annapurna Organic Farm and Kaveri Riverfield. The new frontend farm data uses 8.5 acres for Annapurna and 5 acres for Kaveri; configured field areas add up to the farm areas.

Frontend terminal:

```powershell
Set-Location "C:\Users\venka\all works\Infosys"
if (!(Test-Path .env.local)) { Set-Content .env.local "VITE_API_BASE_URL=http://localhost:8000/api/v1" }
npm install
npm.cmd run dev -- --host localhost
```

Vite is configured for port 3000; backend `FRONTEND_ORIGIN` defaults to `http://localhost:3000`. Open the Vite URL, create an account in the app (or sign in with the synthetic demo account), and use `http://127.0.0.1:8000/docs` for the API docs. Configure a unique `JWT_SECRET_KEY` before deployment. Weather is disabled by default; set `WEATHER_PROVIDER=openweathermap` plus `OPENWEATHER_API_KEY` in backend `.env` later to enable live weather. Never put provider credentials in frontend environment variables.

### Verify registered demo data in Swagger

1. Sign in at `POST /api/v1/auth/login` and authorize Swagger with the returned access token.
2. Call `GET /api/v1/farms`; use the returned IDs for each farm.
3. Call `GET /api/v1/farms/{farm_id}/fields` for Annapurna Organic Farm and confirm North Paddy Block, East Sugarcane Plot and Veggie Polyhouse.
4. Call the same endpoint for Kaveri Riverfield and confirm South Wheat Acre.
5. Call `GET /api/v1/sensors`; verify each sensor's `farm_id` and `field_id` point to the corresponding records. Or use `GET /api/v1/fields/{field_id}/sensors` for each field.
6. Call `GET /api/v1/analytics/sensors/{sensor_id}/history` and confirm generated rows use `source: synthetic_demo`.
7. For a manual ingestion check, copy the selected sensor's exact `id`, `sensor_code`, `farm_id` and `field_id` into `POST /api/v1/ingestion/readings`. The response returns those resolved IDs; they must match the submitted sensor relationship.

### Swagger authentication

For protected endpoints, run login and copy the `access_token` value. Click **Authorize** in Swagger and paste the token value without adding `Bearer `; Swagger's HTTP Bearer security scheme adds that prefix to requests. The generated cURL for `/api/v1/auth/me` should then include an `Authorization: Bearer ...` header. Logout is stateless in this implementation: it confirms logout but cannot revoke already issued JWTs; clients should discard both tokens, which remain cryptographically valid until expiry.

## Local verification

Run backend checks from `backend` with the existing virtual environment active: `python -m pytest`. API tests use a disposable in-memory SQLite database; they do not modify the PostgreSQL demo database. PostgreSQL schema, migration head, seed links, and authenticated read routes are checked separately during local verification. `GET /health` verifies the API process; authenticated CRUD and analytics endpoints are listed below and in `/docs`.

### Swagger manual sequence

1. Open `http://127.0.0.1:8000/docs` and run `GET /health`.
2. Run `POST /api/v1/auth/login` with the demo email and your demo password. Login returns `access_token` and `refresh_token`.
3. Click **Authorize**, paste only the `access_token` value, and confirm. The generated `/api/v1/auth/me` cURL should contain `Authorization: Bearer ...`.
4. Verify `/api/v1/auth/me`, then `GET /api/v1/farms`, farm detail, that farm's fields, sensors, and sensor history. Use IDs returned by those requests.
5. Verify analytics summary and metric endpoints, then `GET /api/v1/irrigation/recommendation/{field_id}`. The recommendation route is read-only and labels synthetic inputs.
6. Verify irrigation status, schedules, and history for the field.
7. With weather disabled and no recent stored snapshot, `GET /api/v1/weather/current` or `/forecast` returns HTTP 503 with a clear unavailable/cached-data message. This is expected; it does not fabricate conditions. If a recent cached provider response exists, the API returns that snapshot instead.

Use Swagger's **Authorize** button; entering an access token in a request body or query parameter will not authenticate protected calls. Clear Swagger authorization when finished. The backend's logout endpoint is stateless and does not revoke a token already issued; discard access and refresh tokens and allow the access token to expire.

### PowerShell API smoke check

After starting the API, run this in a third PowerShell window. It registers a throwaway account and creates a farm, field, sensor, reading, then requests an advisory. Change the email if you run it more than once:

```powershell
$base = 'http://localhost:8000/api/v1'
$auth = Invoke-RestMethod "$base/auth/register" -Method Post -ContentType 'application/json' -Body (@{full_name='API Demo';email='api-demo@example.com';password='YOUR_TEST_PASSWORD';preferred_language='en'} | ConvertTo-Json)
$headers = @{ Authorization = "Bearer $($auth.access_token)" }
$farm = Invoke-RestMethod "$base/farms" -Method Post -Headers $headers -ContentType 'application/json' -Body (@{farm_name='API Demo Farm';total_area=3;area_unit='Acres';latitude=12.97;longitude=77.59} | ConvertTo-Json)
$field = Invoke-RestMethod "$base/farms/$($farm.id)/fields" -Method Post -Headers $headers -ContentType 'application/json' -Body (@{field_name='Tomato Demo';crop_type='tomato';soil_type='Loamy';area=1;area_unit='Acres'} | ConvertTo-Json)
$sensor = Invoke-RestMethod "$base/sensors" -Method Post -Headers $headers -ContentType 'application/json' -Body (@{sensor_code='API-DEMO-001';farm_id=$farm.id;field_id=$field.id;sensor_name='API Demo Sensor'} | ConvertTo-Json)
$reading = @{sensor_code=$sensor.sensor_code;soil_moisture=42;temperature=29;humidity=65;rainfall=0;timestamp=(Get-Date).ToUniversalTime().ToString('o');source='manual'} | ConvertTo-Json
Invoke-RestMethod "$base/ingestion/readings" -Method Post -Headers $headers -ContentType 'application/json' -Body $reading
Invoke-RestMethod "$base/analytics/field/$($field.id)/summary?period=7d" -Headers $headers
Invoke-RestMethod "$base/irrigation/recommendation/$($field.id)" -Headers $headers
```

This smoke check validates API requests against the configured PostgreSQL database. The synthetic seed account is separate and is intended for the frontend demo.

## Sensor ingestion

Register a user, farm, field and sensor, then include the returned access token:

```http
POST /api/v1/ingestion/readings
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "sensor_code": "SM-001",
  "soil_moisture": 32.5,
  "temperature": 29.4,
  "humidity": 72.0,
  "rainfall": 0.0,
  "irrigation_status": false,
  "timestamp": "2026-11-13T10:30:00Z",
  "temperature_unit": "C",
  "rainfall_unit": "mm",
  "source": "sensor"
}
```

Temperature may declare `F` and rainfall may declare `in`; fractional moisture conversion requires `moisture_unit: "fraction"`. Timestamp must include timezone. Future timestamps (>5 minutes) and out-of-range values are rejected. Batch endpoint accepts an array (up to 500) and returns `accepted` and indexed `rejected` entries; duplicates return a validation error. Readings missing a metric are stored as null, never fabricated.

## Main endpoints

- Auth: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`.
- Farms: `/farms` CRUD; fields: `/farms/{farm_id}/fields` and `/fields/{field_id}` CRUD.
- Sensors: `/sensors` CRUD and `/fields/{field_id}/sensors`.
- Ingestion: `/ingestion/readings`, `/ingestion/readings/batch`.
- Analytics: `/analytics/{moisture|temperature|humidity}/{field_id}`, `/analytics/sensors/{sensor_id}/history`, `/analytics/field/{field_id}/summary`. Periods: `24h`, `7d`, `30d`, or `from_at`/`to_at` on metric history.
- Weather: `/weather/current?farm_id=...`, `/weather/forecast?farm_id=...&days=5`, `/weather/history?farm_id=...`.
- Irrigation: `/irrigation/recommendation/{field_id}`, `/{field_id}/status`, `/{field_id}/schedules`, `/schedules/{schedule_id}`, `/{field_id}/history`, `/{field_id}/events`.

## Weather

Set `WEATHER_PROVIDER=openweathermap` with `OPENWEATHER_API_KEY`, or `WEATHER_PROVIDER=tomorrow` with `TOMORROW_API_KEY`. Missing coordinates return 422. Requests time out after 8 seconds. A provider failure returns a stored snapshot up to three hours old with `data_status: cached`; absent cache yields 503. The API never invents live conditions. Historical snapshots are stored in PostgreSQL.

## Tests and troubleshooting

Run `python -m pytest` in this directory. Tests use an in-memory database and do not reset or delete PostgreSQL records. For local PostgreSQL troubleshooting, check the Windows service (`Get-Service *postgres*`), port 5432 (`Test-NetConnection 127.0.0.1 -Port 5432`), `DATABASE_URL`, and the configured CORS origin. Run `alembic current` to inspect the applied migration; use `alembic upgrade head` only when the database is behind.
