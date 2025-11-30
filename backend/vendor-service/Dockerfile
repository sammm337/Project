FROM node:18-alpine

WORKDIR /app/vendor-service

COPY vendor-service/package*.json ./
RUN npm install

COPY shared /app/shared
COPY vendor-service/. .

RUN npm run build

EXPOSE 3003

CMD ["npm", "start"]

