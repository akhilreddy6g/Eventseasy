# syntax=docker/dockerfile:1.7
FROM golang:1.23-bookworm AS base
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

FROM base AS development
COPY . .
EXPOSE 8080
CMD ["go", "run", "."]

FROM base AS builder
ARG TARGETOS=linux
ARG TARGETARCH
COPY . .
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH:-amd64} go build -trimpath -ldflags="-s -w" -o /out/chat-server .

FROM gcr.io/distroless/static-debian12:nonroot AS production
WORKDIR /app
COPY --from=builder /out/chat-server ./chat-server
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app/chat-server"]
