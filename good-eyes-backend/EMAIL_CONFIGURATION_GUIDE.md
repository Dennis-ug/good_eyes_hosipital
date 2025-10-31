# Email Configuration Guide

## Issue
The email functionality for new user account creation is not working. The error in the logs shows:
```
Failed to send admin confirmation email: Authentication failed
```

## Root Cause
The email service is failing because the email configuration environment variables are not properly set or the email credentials are incorrect.

## Solution

### 1. Check Current Email Configuration

The application is configured to use these environment variables for email:
- `SPRING_MAIL_HOST`
- `SPRING_MAIL_PORT`
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`
- `SPRING_MAIL_FROM`

### 2. Configure Email Settings

You have several options for email configuration:

#### Option A: Gmail SMTP (Recommended for Production)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"

3. Set these environment variables:
```bash
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
SPRING_MAIL_FROM=your-email@gmail.com
```

#### Option B: Mailtrap (For Testing)

1. Sign up for a free Mailtrap account
2. Get your SMTP credentials from Mailtrap
3. Set these environment variables:
```bash
SPRING_MAIL_HOST=live.smtp.mailtrap.io
SPRING_MAIL_PORT=2525
SPRING_MAIL_USERNAME=api
SPRING_MAIL_PASSWORD=your-mailtrap-token
SPRING_MAIL_FROM=noreply@rossumtechsystems.com
```

#### Option C: Disable Email Notifications (Temporary Fix)

If you want to temporarily disable email notifications while fixing the configuration:

1. Modify the user creation request to set `sendEmailNotification: false`
2. Or modify the backend code to handle email failures gracefully

### 3. Test Email Configuration

Create a simple test script to verify email configuration:

```bash
#!/bin/bash

# Test email configuration
curl -X POST "http://localhost:5025/api/auth/create-user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "test_user_email",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "roles": ["USER"],
    "sendEmailNotification": true,
    "customMessage": "Testing email configuration"
  }'
```

### 4. Environment Variables Setup

Create or update your `.env` file in the backend directory:

```bash
# Email Configuration
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
SPRING_MAIL_FROM=your-email@gmail.com

# Email SMTP Properties
SPRING_MAIL_PROPERTIES_MAIL_SMTP_CONNECTIONTIMEOUT=10000
SPRING_MAIL_PROPERTIES_MAIL_SMTP_TIMEOUT=10000
SPRING_MAIL_PROPERTIES_MAIL_SMTP_WRITETIMEOUT=10000
```

### 5. Restart the Application

After updating the environment variables:

```bash
# Stop the backend
cd eyesante-backend
mvn spring-boot:run
```

### 6. Verify Email Functionality

1. Create a new user through the frontend or API
2. Check the backend logs for email success/failure messages
3. Check the recipient's email inbox for the welcome email

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check if the email credentials are correct
   - For Gmail, ensure 2FA is enabled and app password is used
   - For Mailtrap, verify the API token is correct

2. **Connection Timeout**
   - Check if the SMTP host and port are correct
   - Verify network connectivity
   - Check firewall settings

3. **Email Not Sent**
   - Check if `sendEmailNotification` is set to `true`
   - Verify the recipient email address is valid
   - Check spam/junk folders

### Debug Steps

1. Enable debug logging for email:
```yaml
logging:
  level:
    org.springframework.mail: DEBUG
    com.rossumtechsystems.eyesante_backend.service.EmailService: DEBUG
```

2. Check the application logs for detailed error messages

3. Test email configuration with a simple SMTP test tool

## Security Notes

- Never commit email passwords to version control
- Use environment variables for sensitive configuration
- Consider using a dedicated email service for production
- Regularly rotate email passwords and tokens

## Next Steps

1. Configure the email settings according to your preferred option
2. Test the email functionality
3. Monitor the logs for any remaining issues
4. Consider implementing email templates for better formatting
