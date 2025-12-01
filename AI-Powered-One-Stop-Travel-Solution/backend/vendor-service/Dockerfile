# FROM node:18-alpine

# WORKDIR /app/vendor-service

# COPY vendor-service/package*.json ./
# RUN npm install

# COPY shared /app/shared
# COPY vendor-service/. .

# RUN npm run build

# EXPOSE 3003

# CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

# 1. Install system dependencies (needed for some node modules)
RUN apk add --no-cache python3 make g++

# 2. Copy package.json files for both Service and Shared
COPY vendor-service/package*.json ./vendor-service/
COPY shared/package*.json ./shared/

# 3. Install dependencies for BOTH
# We must install shared dependencies so 'amqplib' is found
RUN cd shared && npm install && cd ..
RUN cd vendor-service && npm install && cd ..

# 4. Copy source code for BOTH
COPY shared ./shared
COPY vendor-service ./vendor-service

# 5. Build Shared FIRST (Critical!)
RUN cd shared && npm run build

# 6. Build Vendor Service
RUN cd vendor-service && npm run build

EXPOSE 3003

# 7. Start the service
CMD ["node", "vendor-service/dist/index.js"]
