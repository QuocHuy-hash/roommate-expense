# Dockerfile for Node.js + TypeScript backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript
RUN npm run build || true

# Expose port (update if your app uses a different port)
EXPOSE 3000

# Start the app (update if your start script is different)
CMD ["npm", "start"]
