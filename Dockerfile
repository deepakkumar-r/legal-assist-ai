FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json
RUN npm ci
COPY . .
RUN npm run build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8787
COPY --from=build /app/package*.json ./
COPY --from=build /app/backend/package.json backend/package.json
COPY --from=build /app/shared/package.json shared/package.json
COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/shared/dist shared/dist
RUN npm ci --omit=dev
EXPOSE 8787
CMD ["node","backend/dist/index.mjs"]
