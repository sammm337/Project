FROM node:18-alpine

WORKDIR /app/media-service

COPY media-service/package*.json ./
RUN npm install

COPY shared /app/shared
COPY media-service/. .

RUN npm run build

EXPOSE 3008

CMD ["npm", "start"]

