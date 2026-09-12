FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 go test ./...
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/noqeri-registry ./cmd/registry

FROM alpine:3.21
WORKDIR /app
COPY --from=build /out/noqeri-registry /usr/local/bin/noqeri-registry
COPY registry ./registry
COPY packages ./packages
ENV REGISTRY_ROOT=/app
EXPOSE 8080
CMD ["noqeri-registry"]
