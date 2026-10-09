# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .

# Build argument for API URL (defaults to empty string for reverse proxy)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

