FROM node:16-alpine as builder

RUN apk add --no-cache python3 g++ make

ARG CODEARTIFACT_AUTH_TOKEN=""
ENV CODEARTIFACT_AUTH_TOKEN ${CODEARTIFACT_AUTH_TOKEN}
ENV NODE_ENV build

WORKDIR /home/node

COPY . /home/node

RUN npm ci \
    && npm run build \
    && npm prune --omit=dev

# ---

FROM node:16-alpine

ENV NODE_ENV production

WORKDIR /home/node

COPY --from=builder /home/node/tsconfig*.json /home/node/
COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/
COPY --from=builder /home/node/nest-*.json /home/node/

CMD ["npm", "run", "start:prod"]