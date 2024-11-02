FROM node:23.1.0-alpine

COPY build/ build/
COPY ./package.json ./
COPY node_modules/ node_modules/

CMD ["npm", "run" ,"start"]