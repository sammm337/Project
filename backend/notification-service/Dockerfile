FROM node:18-alpine

WORKDIR /app/notification-service

COPY notification-service/package*.json ./
RUN npm install

COPY shared /app/shared
COPY notification-service/. .

RUN npm run build

EXPOSE 3009

CMD ["npm", "start"]

