# Simple Dockerfile for Upstash REST Prometheus exporter
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
ENV PORT=9101
EXPOSE 9101
CMD ["npm", "start"]
