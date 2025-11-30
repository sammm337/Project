FROM node:18-alpine

WORKDIR /app

# 🔥 Install Alpine build tools for bcrypt (CRITICAL)
RUN apk add --no-cache python3 make g++

# 1️⃣ Copy package.json files
COPY auth-service/package*.json ./auth-service/
COPY shared/package*.json ./shared/

# 2️⃣ Install dependencies (shared + auth-service)
RUN cd shared && npm install && cd ..
RUN cd auth-service && npm install && cd ..

# 3️⃣ Copy full source
COPY shared ./shared
COPY auth-service ./auth-service

# 4️⃣ Build shared
RUN cd shared && npm run build

# 5️⃣ Build auth-service
RUN cd auth-service && npm run build

EXPOSE 3001

CMD ["node", "auth-service/dist/index.js"]
