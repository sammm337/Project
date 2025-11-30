FROM node:18-alpine

WORKDIR /app

# 1. Copy only package.json files first (for caching)
COPY user-service/package*.json ./user-service/
COPY shared/package*.json ./shared/

# 2. Install dependencies
RUN cd shared && npm install && cd ..
RUN cd user-service && npm install && cd ..

# 3. Copy full source code
COPY shared ./shared
COPY user-service ./user-service

# 4. Build shared package first
RUN cd shared && npm run build

# 5. Build user-service
RUN cd user-service && npm run build

EXPOSE 3002

CMD ["node", "user-service/dist/index.js"]
