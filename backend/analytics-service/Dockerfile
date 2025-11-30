FROM node:18-alpine

WORKDIR /app

# 1. Copy only package.json files first
COPY analytics-service/package*.json ./analytics-service/
COPY shared/package*.json ./shared/

# 2. Install dependencies
RUN cd shared && npm install && cd ..
RUN cd analytics-service && npm install && cd ..

# 3. Copy full source code
COPY shared ./shared
COPY analytics-service ./analytics-service

# 4. Build shared first
RUN cd shared && npm run build

# 5. Build analytics-service
RUN cd analytics-service && npm run build

EXPOSE 3010

CMD ["node", "analytics-service/dist/index.js"]
