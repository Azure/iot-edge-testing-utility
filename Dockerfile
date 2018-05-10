FROM node:8-slim

WORKDIR /app/

COPY package*.json ./

RUN npm install --production

COPY *.js ./

USER node

ENV DEBUG_OPTION " "
EXPOSE 3000

CMD ["sh", "-c", "node $DEBUG_OPTION server.js"]