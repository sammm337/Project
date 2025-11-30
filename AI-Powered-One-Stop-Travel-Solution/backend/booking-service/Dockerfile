FROM node:18-alpine

WORKDIR /app/booking-service

COPY booking-service/package*.json ./
RUN npm install

COPY shared /app/shared
COPY booking-service/. .

RUN npm run build

EXPOSE 3006

CMD ["npm", "start"]

