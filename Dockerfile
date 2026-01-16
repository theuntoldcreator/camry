# Update to a newer version. Ideally this matches package.json's minor version.
FROM mcr.microsoft.com/playwright:v1.50.1-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
# We use 'npm ci' for a clean install. 
# We DO NOT need 'npx playwright install' because the base image has them.
# We skip the postinstall script to avoid redundant browser download attempts or sudo issues.
RUN npm ci --ignore-scripts

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV HEADLESS=true
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
