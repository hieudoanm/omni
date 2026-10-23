# download stage: fetch the latest release binary via scripts/install.sh
# (FROM defaults to $TARGETPLATFORM, so `uname` reports the target arch)
FROM debian:trixie-slim AS download

ARG REPO=hieudoanm/omni
ARG INSTALL_SCRIPT_URL=https://raw.githubusercontent.com/${REPO}/master/packages/cli/scripts/install.sh

RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "${INSTALL_SCRIPT_URL}" -o /install.sh \
    && chmod +x /install.sh \
    && INSTALL_DIR=/usr/local/bin REPO="${REPO}" /install.sh \
    && omni version

# runtime stage
FROM scratch

COPY --from=download /usr/local/bin/omni /omni

USER 65532:65532

# omni's MCP server reads from stdin and writes to stdout (JSON-RPC 2.0);
# no TCP port is exposed — run with docker run -i / docker compose stdin_open
ENTRYPOINT ["/omni"]
CMD ["mcp", "serve"]