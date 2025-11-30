FROM node:18-alpine

WORKDIR /app

# 1. Copy package.json for shared + service
COPY shared/package*.json ./shared/
COPY search-service/package*.json ./search-service/

# 2. Install dependencies
RUN cd shared && npm install && cd ..
RUN cd search-service && npm install && cd ..

# 3. Copy full source
COPY shared ./shared
COPY search-service ./search-service

# 4. Build shared first
RUN cd shared && npm run build

# 5. Build search-service
RUN cd search-service && npm run build

EXPOSE 3007

CMD ["node", "search-service/dist/index.js"]
