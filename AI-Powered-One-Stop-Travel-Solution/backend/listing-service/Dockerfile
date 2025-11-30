FROM node:18-alpine

WORKDIR /app/listing-service

COPY listing-service/package*.json ./
RUN npm install

COPY shared /app/shared
COPY listing-service/. .

RUN npm run build

EXPOSE 3004

CMD ["npm", "start"]

