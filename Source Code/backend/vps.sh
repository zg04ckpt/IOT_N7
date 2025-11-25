#!/bin/bash
for f in *.tar; do
    docker load -i "$f"
done
docker compose down || true
docker compose up -d