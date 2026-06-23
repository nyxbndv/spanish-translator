# ---- Stage 1: build the React frontend ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Stage 2: runtime (Express only) ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY server.js ./
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "server.js"]
