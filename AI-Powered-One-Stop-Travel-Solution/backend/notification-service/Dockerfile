# FROM node:18-alpine

# WORKDIR /app/notification-service

# COPY notification-service/package*.json ./
# RUN npm install

# COPY shared /app/shared
# COPY notification-service/. .

# RUN npm run build

# EXPOSE 3009

# CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

# 1. Install system build tools
RUN apk add --no-cache python3 make g++

# 2. Copy package.json files for BOTH Service and Shared
COPY notification-service/package*.json ./notification-service/
COPY shared/package*.json ./shared/

# 3. Install dependencies for BOTH
# This ensures 'amqplib' in shared/node_modules is installed
RUN cd shared && npm install && cd ..
RUN cd notification-service && npm install && cd ..

# 4. Copy source code for BOTH
COPY shared ./shared
COPY notification-service ./notification-service

# 5. Build Shared FIRST (Critical!)
RUN cd shared && npm run build

# 6. Build Notification Service
RUN cd notification-service && npm run build

EXPOSE 3009

# 7. Start the service
CMD ["node", "notification-service/dist/index.js"]