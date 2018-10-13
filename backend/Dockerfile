FROM node:latest
ENV BACKEND_PORT 10200

WORKDIR /app
ADD . /app

RUN npm install

EXPOSE $BACKEND_PORT

CMD ["node", "index.js"]
