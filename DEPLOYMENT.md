# Deployment Guide

This guide covers the deployment strategies for the Reverse Marketplace application.

---

## 1. Quick Start with Docker Compose (Recommended)

Docker Compose provides a complete, containerized environment orchestrating:
1. **MySQL 8.0** database with persistent volume.
2. **Spring Boot (Java 17)** backend service.
3. **Nginx + React 19** frontend with SPA routing and API reverse proxying.

### Prerequisites
* Docker & Docker Compose installed

### Steps
1. (Optional) Copy `.env.example` to `.env` and adjust passwords or ports if desired:
   ```bash
   cp .env.example .env
   ```
2. Build and launch all services:
   ```bash
   docker compose up --build -d
   ```
3. Access the application:
   * **Frontend UI**: [http://localhost](http://localhost) (or port configured in `FRONTEND_PORT`)
   * **Backend REST API**: [http://localhost:8081](http://localhost:8081)
4. View logs:
   ```bash
   docker compose logs -f
   ```
5. Stop services:
   ```bash
   docker compose down
   ```

---

## 2. Cloud PaaS Deployment (Render, Railway, Heroku, AWS)

### Backend Service (Web Service)
* **Build Command**: `./mvnw clean package -DskipTests` (or use Dockerfile)
* **Start Command**: `java -jar target/marketplace-0.0.1-SNAPSHOT.jar`
* **Environment Variables**:
  * `PORT`: `8081` (or provided dynamically by the platform)
  * `SPRING_DATASOURCE_URL`: `jdbc:mysql://<db-host>:<port>/<db-name>`
  * `SPRING_DATASOURCE_USERNAME`: `<db-user>`
  * `SPRING_DATASOURCE_PASSWORD`: `<db-password>`
  * `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update`
  * `APP_CORS_ALLOWED_ORIGINS`: Comma-separated frontend origins, including `https://reverse-market-sandy.vercel.app` for the current Vercel deployment.
  * `APP_JWT_SECRET`: `<your-random-32+-byte-secret-key>`
  * `ADMIN_REGISTRATION_KEY`: `<your-secure-admin-key>`

### Frontend Service (Static Site or Static Host)
* **Build Command**: `npm run build`
* **Publish Directory**: `dist`
* **Environment Variables**:
  * `VITE_API_BASE_URL`: `https://your-backend-domain.com`

---

## 3. Traditional VPS / Linux Server Deployment (Ubuntu / Debian)

### Step 3.1: Build Backend JAR
```bash
cd backend
./mvnw clean package -DskipTests
```
Run as a systemd service (`/etc/systemd/system/marketplace.service`):
```ini
[Unit]
Description=Reverse Marketplace Backend Service
After=syslog.target network.target mysql.service

[Service]
User=www-data
WorkingDirectory=/var/www/marketplace/backend
ExecStart=/usr/bin/java -jar /var/www/marketplace/backend/marketplace-0.0.1-SNAPSHOT.jar
Environment="PORT=8081"
Environment="SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/reverse_marketplace"
Environment="SPRING_DATASOURCE_USERNAME=marketplace_user"
Environment="SPRING_DATASOURCE_PASSWORD=secure_password"
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Step 3.2: Build and Serve Frontend
```bash
cd frontend
npm ci
VITE_API_BASE_URL="" npm run build
```
Copy `frontend/dist/*` to `/var/www/marketplace/frontend`.
Use the provided `frontend/nginx.conf` template for your Nginx virtual host.

---

## 4. Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend HTTP listening port | `8081` |
| `SPRING_DATASOURCE_URL` | JDBC MySQL connection URL | `jdbc:mysql://localhost:3306/reverse_marketplace` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `naveen2006` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Hibernate schema mode | `update` |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,http://localhost:3000,http://localhost:80,http://localhost` |
| `APP_JWT_SECRET` | Secret key used to sign and verify JWT tokens | Hardcoded key in properties (customizable in prod) |
| `APP_JWT_EXPIRATION_MS` | JWT expiration duration in milliseconds | `3600000` (1 hour) |
| `ADMIN_REGISTRATION_KEY` | Secret key required to register ADMIN role | From environment or property |
| `VITE_API_BASE_URL` | Frontend API endpoint (leave empty for reverse proxy) | `http://localhost:8081` |
