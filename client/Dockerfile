FROM node:20

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY package*.json ./
COPY bun.lock ./

RUN bun install

COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev", "--", "--host"]