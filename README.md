# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ee8c4636-8315-4e7f-88e7-62994729addc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Render with TiDB

1. Create a TiDB database and copy its PostgreSQL connection string.
2. In Render, create a new Web Service from this repo.
3. Set these environment variables in Render:
   - `DATABASE_URL` for the TiDB connection string
   - `GEMINI_API_KEY`
   - `SQL_SSL=true`
4. Use the included `render.yaml`, or set the commands manually:
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. If you prefer individual connection fields instead of `DATABASE_URL`, set:
   - `SQL_HOST`
   - `SQL_PORT` to `4000`
   - `SQL_USER`
   - `SQL_PASSWORD`
   - `SQL_DB_NAME`
   - `SQL_SSL=true`
