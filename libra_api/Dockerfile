# Stage 1: Build the application
FROM rust:1-bookworm as builder
WORKDIR /app

# Copy the source code and dependencies
COPY . .

# Build the application
RUN cargo build --release

RUN chmod +x upx && \
    ./upx -9 /app/target/release/libra_api && \
    rm upx

# Stage 2: Create the final image GLIB_2.29
FROM debian:bookworm-slim
WORKDIR /app

# Install necessary dependencies
RUN apt-get update && apt install -y openssl ca-certificates

# Copy the binary from the builder stage
COPY --from=builder /app/target/release/libra_api /app/libra_api

# Set environment variables
# ENV RUST_LOG=info
EXPOSE 8800

# Start the application
CMD ["/app/libra_api"]