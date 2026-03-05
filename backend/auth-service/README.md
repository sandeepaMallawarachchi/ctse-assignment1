# auth-service

Authentication microservice for the CTSE e-commerce platform.
Handles user registration, login, and JWT token validation.

## Tech Stack

- Java 21, Spring Boot 4.0.3
- Spring Security (stateless JWT)
- MongoDB (Spring Data MongoDB)
- JJWT 0.12.6 (HS256)

---

## Running Locally

### Prerequisites
- JDK 21
- Maven (or use the included `mvnw` wrapper)
- MongoDB Atlas cluster (or local MongoDB)

### Steps

```bash
cd backend/auth-service

# Build (skip tests)
./mvnw clean install -DskipTests

# Run
./mvnw spring-boot:run
```

On Windows:
```cmd
mvnw.cmd clean install -DskipTests
mvnw.cmd spring-boot:run
```

The service starts on **port 8082**.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB connection string |
| `MONGODB_DATABASE` | `auth_service_db` | Database name |
| `JWT_SECRET` | *(Base64 key)* | HS256 signing secret (Base64-encoded, min 32 bytes) |
| `JWT_ISSUER` | `auth-service` | JWT issuer claim |
| `JWT_EXP_MINUTES` | `60` | Token expiry in minutes |

To pass env vars at runtime:

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster/db \
JWT_SECRET=your-base64-secret \
./mvnw spring-boot:run
```

### Generating a secure JWT_SECRET

```bash
openssl rand -base64 32
```

---

## API Endpoints

Base URL: `http://localhost:8082`

### Swagger UI
```
http://localhost:8082/swagger-ui.html
```

---

### 1. Register

```bash
curl -X POST http://localhost:8082/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response `201`:**
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "status": 201,
  "message": "User registered successfully",
  "path": "/api/auth/register",
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "userId": "abc123",
    "email": "john@example.com",
    "fullName": "John Doe",
    "roles": ["CUSTOMER"]
  }
}
```

---

### 2. Login

```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response `200`:**
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "status": 200,
  "message": "Login successful",
  "path": "/api/auth/login",
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "userId": "abc123",
    "email": "john@example.com",
    "fullName": "John Doe",
    "roles": ["CUSTOMER"]
  }
}
```

---

### 3. Validate Token

Used by other microservices / API Gateway to verify a JWT.

```bash
curl -X GET http://localhost:8082/api/auth/validate \
  -H "Authorization: Bearer <jwt>"
```

**Response `200` (valid token):**
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "status": 200,
  "message": "Token validated",
  "path": "/api/auth/validate",
  "data": {
    "valid": true,
    "userId": "abc123",
    "email": "john@example.com",
    "roles": ["ROLE_CUSTOMER"]
  }
}
```

**Response `200` (invalid/expired token):**
```json
{
  "data": {
    "valid": false
  }
}
```

---

## Health Check

```bash
curl http://localhost:8082/actuator/health
```

---

## Roles

| Role | Description |
|---|---|
| `CUSTOMER` | Default role assigned on registration |
| `ADMIN` | Elevated privileges — assign directly in MongoDB |

---

## Notes

- Passwords are hashed with BCrypt before storage — never stored in plain text.
- The `JWT_SECRET` must be the same Base64 value used across all services that validate tokens (e.g. `product-catelog-service`).
- Google OAuth2 support is planned — placeholder dependency (`spring-boot-starter-oauth2-client`) can be added when ready.
