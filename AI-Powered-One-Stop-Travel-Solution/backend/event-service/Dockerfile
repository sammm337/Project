# FROM node:18-alpine

# # Set the root workdir to the repo root inside the container
# WORKDIR /app/event-service

# # Install service dependencies
# COPY event-service/package*.json ./
# RUN npm install

# # Copy shared code and this service's source
# COPY shared /app/shared
# COPY event-service/. .

# RUN npm run build

# EXPOSE 3005

# CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

# 1. Install system dependencies (optional but good for stability)
RUN apk add --no-cache python3 make g++

# 2. Copy package.json files for both Service and Shared
COPY event-service/package*.json ./event-service/
COPY shared/package*.json ./shared/

# 3. Install dependencies for BOTH
RUN cd shared && npm install && cd ..
RUN cd event-service && npm install && cd ..

# 4. Copy source code for BOTH
COPY shared ./shared
COPY event-service ./event-service

# 5. Build Shared FIRST (Critical!)
RUN cd shared && npm run build

# 6. Build Event Service
RUN cd event-service && npm run build

EXPOSE 3005

# 7. Start the service
CMD ["node", "event-service/dist/index.js"]