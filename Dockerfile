# Stage 1: Build the Angular application
FROM node:18.16 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the Angular application
FROM nginx:alpine
COPY --from=build /app/dist/driving-instructor-app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]