FROM node:18-alpine

WORKDIR /app/traveler-service

COPY traveler-service/package*.json ./
RUN npm install

COPY shared /app/shared
COPY traveler-service/. .

RUN npm run build

EXPOSE 3011

CMD ["npm", "start"]

