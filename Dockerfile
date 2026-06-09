FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
LABEL org.opencontainers.image.source=https://github.com/dotMage/web
EXPOSE 80
