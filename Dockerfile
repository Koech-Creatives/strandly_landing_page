# Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the application
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.cjs .
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "server.cjs"]
