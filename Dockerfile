FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
LABEL org.opencontainers.image.source=https://github.com/dotMage/dotmage-web
EXPOSE 80
