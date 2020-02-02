FROM node:alpine as log-app-build

WORKDIR /log-app

COPY package.json README.md ./

RUN yarn

COPY ./public ./public

COPY ./src ./src

ENV REACT_APP_baseAPIURL=172.18.109.205:31824

RUN yarn build

FROM nginx:latest

LABEL maintainer=log-maintainer

COPY --from=log-app-build /log-app/build/ /usr/share/nginx/html

EXPOSE 80
