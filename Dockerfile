FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /var

COPY build/ build/
COPY server/build server/
COPY public/ public/
COPY node_modules/ node_modules/

EXPOSE 3000
CMD ["./server/server.js"]