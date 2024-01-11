FROM docker.io/node:16.15.1-alpine

# Set environment variable to avoid update notifications
ENV NO_UPDATE_NOTIFIER=true

# Set a custom npm cache directory
ENV NPM_CONFIG_CACHE=/opt/app-root/src/app/.npm-cache

# Set working directory
WORKDIR /opt/app-root/src/app

# Copy application source code and set ownership
COPY . /opt/app-root/src

# Create the npm cache directory and ensure the correct ownership
RUN mkdir -p $NPM_CONFIG_CACHE && chown -R 1001:1001 /opt/app-root/src/app

# Install dependencies and build the application
RUN npm run all:ci \
    && npm run all:build \
    && npm run client:purge

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["sh", "-c", "chown -R 1001:1001 /opt/app-root/src/app/.npm-cache && npm run start"]
