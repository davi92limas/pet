FROM node:18-bullseye

WORKDIR /app

# Dependências de build para módulos nativos (ex.: bcrypt)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci && npm rebuild bcrypt --build-from-source

COPY . .

RUN rm -f tsconfig.build.tsbuildinfo && npm run build
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

