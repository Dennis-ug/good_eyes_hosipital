#!/bin/bash

# Set required environment variables for the backend
export SPRING_MAIL_HOST=live.smtp.mailtrap.io
export SPRING_MAIL_PORT=2525
export SPRING_MAIL_USERNAME=api
export SPRING_MAIL_PASSWORD=your-mailtrap-token-here
export SPRING_MAIL_FROM=noreply@rossumtechsystems.com
export SPRING_MAIL_PROPERTIES_MAIL_SMTP_CONNECTIONTIMEOUT=10000
export SPRING_MAIL_PROPERTIES_MAIL_SMTP_TIMEOUT=10000
export SPRING_MAIL_PROPERTIES_MAIL_SMTP_WRITETIMEOUT=10000

# Start the backend
cd eyesante-backend
./mvnw spring-boot:run
