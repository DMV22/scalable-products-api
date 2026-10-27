FROM node:22-alpine AS build

WORKDIR /app

# Копіюємо ТІЛЬКИ package.json (ігноруємо будь-які локфайли та ворксейси)
COPY package.json ./

# Встановлюємо абсолютно всі залежності через стандартний npm
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./

# Встановлюємо тільки production залежності
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

# Безпека
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
