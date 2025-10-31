# Good Eyes Hospital - Healthcare Management System

A comprehensive healthcare management system built with Next.js frontend and Spring Boot backend.

## Environment Setup

### Local Development

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your local values:
   - Replace `your-mailtrap-token-here` with your actual Mailtrap token
   - Update database credentials if needed
   - Modify JWT secret for local development

3. The `.env` file is gitignored and won't be committed to version control.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Database connection URL | `jdbc:postgresql://161.35.46.156:5432/eye_sante_production` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `dennie` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `GodLovesMe@256` |
| `APP_JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key...` |
| `SPRING_MAIL_HOST` | SMTP host | `live.smtp.mailtrap.io` |
| `SPRING_MAIL_PORT` | SMTP port | `2525` |
| `SPRING_MAIL_USERNAME` | SMTP username | `api` |
| `SPRING_MAIL_PASSWORD` | SMTP password/token | `your-mailtrap-token-here` |
| `SERVER_PORT` | Backend server port | `5025` |

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd eyesante-backend
   ```

2. Build the project:
   ```bash
   ./mvnw clean install
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd isante-front-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Setup

To run the entire stack with Docker Compose:

```bash
docker compose up -d
```

The backend will automatically read environment variables from the `.env` file.

## Features

- Patient Management
- Visit Session Management
- Triage System
- Basic Refraction Exams
- Main Examinations
- Procedures Management
- Treatment Management
- Inventory Management
- Diagnosis Management
- Medical Investigations
- Financial Management (Invoices)
- User Management with Role-based Access Control
- Email Notifications

## API Documentation

The backend API is available at `http://localhost:5025/api`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software.
# good_eyes_hosipital
