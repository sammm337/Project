FROM node:18-alpine

# --- 1. Build Shared Module ---
WORKDIR /app/shared
# Copy shared package.json and install dependencies
COPY shared/package*.json ./
RUN npm install
# Copy shared source code
COPY shared/. .
# Build shared module (compiles TS to dist)
RUN npm run build

# --- 2. Build Media Service ---
WORKDIR /app/media-service

# Copy media-service package.json and install dependencies (includes multer)
COPY media-service/package*.json ./
RUN npm install

# Copy media-service source code
COPY media-service/. .

# Build media-service
RUN npm run build

EXPOSE 3008

CMD ["npm", "start"]