# Local Supabase Development Setup

## 1. Install Supabase CLI

```bash
# Install Supabase CLI globally
npm install -g supabase

# Or using npx (recommended)
npx supabase --version
```

## 2. Initialize Supabase Project

```bash
# Initialize Supabase in your project
npx supabase init

# This creates a supabase/ folder with configuration
```

## 3. Start Local Supabase Stack

```bash
# Start local development stack (Docker required)
npx supabase start

# This will output local URLs and keys, like:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Create Development Environment

Create `.env.local` for development:

```env
# Local Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_URL=http://localhost:3000

# Analytics (Optional for dev)
VITE_GOOGLE_ANALYTICS_ID=
VITE_GOOGLE_TAG_MANAGER_ID=
VITE_FACEBOOK_PIXEL_ID=
```

## 5. Apply Your Migrations

```bash
# Apply existing migrations to local database
npx supabase db reset

# Or apply migrations manually
npx supabase db push
```

## 6. Configure Your Project

Update your development scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "dev:local": "vite --mode local",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset"
  }
}
```

## 7. Environment Configuration

Create multiple environment files:

### `.env.local` (Local development)
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_APP_URL=http://localhost:3000
```

### `.env.development` (Remote dev database)
```env
VITE_SUPABASE_URL=https://rbtpymslbrrorsnvrvvl.supabase.co
VITE_SUPABASE_ANON_KEY=your-remote-dev-key
VITE_APP_URL=http://localhost:3000
```

### `.env.production` (Production)
```env
VITE_SUPABASE_URL=https://rbtpymslbrrorsnvrvvl.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-key
VITE_APP_URL=https://linktree.alexkm.com
```

## 8. Linking Remote Project (Optional)

If you want to sync with your remote Supabase project:

```bash
# Link to your remote project
npx supabase link --project-ref rbtpymslbrrorsnvrvvl

# Pull remote schema to local
npx supabase db pull

# Generate types from remote
npx supabase gen types typescript --linked > src/types/supabase.ts
```

## 9. Useful Commands

```bash
# Start local stack
npx supabase start

# Stop local stack
npx supabase stop

# Reset local database
npx supabase db reset

# Open local Studio (database GUI)
npx supabase studio

# Generate migration from changes
npx supabase db diff --use-migra -f new_migration

# Push migrations to remote
npx supabase db push

# View logs
npx supabase logs db
```

## 10. Development Workflow

### For Pure Local Development:
1. `npx supabase start`
2. Use `.env.local` with local URLs
3. `npm run dev:local`

### For Remote Development:
1. Use `.env.development` with remote URLs
2. `npm run dev`

### Switching Between Environments:
```bash
# Use local
cp .env.local .env
npm run dev

# Use remote dev
cp .env.development .env
npm run dev

# Use production
cp .env.production .env
npm run build
```

## 11. Docker Requirements

Local Supabase requires Docker:

### Windows:
- Install Docker Desktop
- Ensure WSL2 is enabled
- Start Docker Desktop before running `supabase start`

### Check Docker:
```bash
docker --version
docker-compose --version
```

## 12. Configuration Files

After `supabase init`, you'll have:

### `supabase/config.toml`
```toml
[api]
port = 54321
schemas = ["public", "graphql_public"]

[db]
port = 54322

[studio]
port = 54323

[inbucket]
port = 54324

[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://linktree.alexkm.com"]
```

## Benefits of Local Development

- ✅ No API rate limits
- ✅ Offline development
- ✅ Fast iteration
- ✅ Safe to experiment
- ✅ Email testing with Inbucket
- ✅ Full database control

## Troubleshooting

### Port Conflicts:
```bash
# Stop local stack
npx supabase stop

# Check what ports are used
npx supabase status
```

### Docker Issues:
```bash
# Restart Docker Desktop
# Then restart Supabase
npx supabase stop
npx supabase start
```

### Migration Issues:
```bash
# Reset everything
npx supabase db reset
```