# SASS-E Self-Hosting Deployment Guide

This guide will help you run SASS-E on your local machine or home server.

## Prerequisites

- **Docker** and **Docker Compose** installed
- **At least 2GB RAM** available
- **OpenAI API key** (or alternative LLM provider)
- **Port 3000** available

## Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/DavSah-1/SASS-E.git
cd SASS-E
```

### 2. Configure Environment

```bash
# Copy the template
cp .env.localhost.template .env

# Edit the .env file
nano .env  # or use your preferred editor
```

**Required configurations:**
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `LLM_API_KEY`: Your OpenAI API key (starts with `sk-`)
- `DB_ROOT_PASSWORD`: Choose a secure password
- `DB_PASSWORD`: Choose a secure password

### 3. Start the Application

```bash
# Build and start all services
docker-compose up -d

# Watch the logs
docker-compose logs -f app
```

### 4. Initialize the Database

```bash
# Run database migrations
docker-compose exec app pnpm db:push
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Configuration Details

### Database

The application uses MySQL 8.0 by default. Data is persisted in a Docker volume named `db_data`.

**To access the database directly:**
```bash
docker-compose exec db mysql -u sass_e_user -p sass_e
```

### LLM Provider Options

#### Option 1: OpenAI (Recommended)
```env
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=sk-your-key-here
```

#### Option 2: Anthropic Claude
```env
LLM_API_URL=https://api.anthropic.com/v1
LLM_API_KEY=sk-ant-your-key-here
```

#### Option 3: Local LLM with Ollama
```bash
# Install Ollama first: https://ollama.ai
ollama serve
ollama pull llama2
```

```env
LLM_API_URL=http://host.docker.internal:11434/v1
LLM_API_KEY=ollama
```

### File Storage

By default, files are stored in the Docker volume `uploads`.

**To use MinIO (self-hosted S3):**

1. Add MinIO to `docker-compose.yml`:
```yaml
  minio:
    image: minio/minio
    container_name: sass-e-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
```

2. Update `.env`:
```env
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=sass-e-uploads
```

3. Create the bucket:
```bash
# Access MinIO console at http://localhost:9001
# Login with minioadmin/minioadmin
# Create bucket named "sass-e-uploads"
```

## Authentication

For localhost deployment, the app uses a simplified authentication system. The first user to register becomes the admin.

**To set yourself as admin:**
1. Update `.env`:
```env
OWNER_OPEN_ID=your_email@example.com
OWNER_NAME=Your Name
```

2. Restart the application:
```bash
docker-compose restart app
```

## Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f db
```

### Backup Database
```bash
# Create backup
docker-compose exec db mysqldump -u root -p${DB_ROOT_PASSWORD} sass_e > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db mysql -u root -p${DB_ROOT_PASSWORD} sass_e < backup_20240122.sql
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker-compose exec app pnpm db:push
```

### Stop Services
```bash
# Stop but keep data
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Check what's using the port
lsof -i :3000

# Or change the port in docker-compose.yml:
ports:
  - "8080:3000"  # Access at http://localhost:8080
```

### Database Connection Failed
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Application Won't Start
```bash
# Check logs
docker-compose logs app

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Out of Memory
```bash
# Check Docker resources
docker stats

# Increase Docker memory limit in Docker Desktop settings
# Minimum 2GB recommended, 4GB preferred
```

## Performance Optimization

### Production Build
The Dockerfile already uses production builds. For better performance:

1. **Enable caching:**
```yaml
# Add to docker-compose.yml under app service
environment:
  NODE_ENV: production
  NODE_OPTIONS: --max-old-space-size=2048
```

2. **Use a reverse proxy:**
```bash
# Install Caddy for automatic HTTPS
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -v caddy_data:/data \
  -v caddy_config:/config \
  caddy:latest \
  caddy reverse-proxy --from localhost --to localhost:3000
```

## Security Considerations

For localhost use:
- ✅ Default configuration is acceptable
- ✅ Database is not exposed externally
- ✅ JWT secret should still be strong

For internet-facing deployment:
- ⚠️ Use proper OAuth (Auth0, Keycloak, etc.)
- ⚠️ Enable HTTPS with valid certificates
- ⚠️ Use strong passwords for all services
- ⚠️ Keep all services updated
- ⚠️ Consider using a firewall

## Next Steps

1. **Customize branding**: Update `VITE_APP_TITLE` and `VITE_APP_LOGO` in `.env`
2. **Add users**: Register accounts through the web interface
3. **Configure hubs**: Enable/disable features in the pricing settings
4. **Set up backups**: Schedule regular database backups
5. **Monitor usage**: Check logs regularly for errors

## Support

- **GitHub Issues**: https://github.com/DavSah-1/SASS-E/issues
- **Documentation**: See README.md for feature details
- **Logs**: Always check `docker-compose logs` first

## License

See LICENSE file in the repository.
