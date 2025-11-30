FROM node:18-alpine

WORKDIR /app/api-gateway

COPY api-gateway/package*.json ./
RUN npm install

COPY shared /app/shared
COPY api-gateway/. .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

