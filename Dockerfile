FROM node:10.17.0-alpine
WORKDIR /usr/src/app
COPY /src ./src
COPY /package.json ./
COPY /tsconfig.json ./
RUN yarn --prod
RUN yarn build
RUN rm -r ./src
RUN rm tsconfig.json
RUN rm yarn.lock
CMD yarn start
