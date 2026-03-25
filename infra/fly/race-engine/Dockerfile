# ---- Build stage ----
FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /src

# Cache dependencies
COPY server/go.mod server/go.sum ./
RUN go mod download

# Build binary
COPY server/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/race-engine ./cmd/race-engine

# ---- Runtime stage ----
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /bin/race-engine /usr/local/bin/race-engine

EXPOSE 8081

CMD ["race-engine"]
