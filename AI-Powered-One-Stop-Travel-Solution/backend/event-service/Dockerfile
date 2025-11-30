FROM node:18-alpine

# Set the root workdir to the repo root inside the container
WORKDIR /app/event-service

# Install service dependencies
COPY event-service/package*.json ./
RUN npm install

# Copy shared code and this service's source
COPY shared /app/shared
COPY event-service/. .

RUN npm run build

EXPOSE 3005

CMD ["npm", "start"]

