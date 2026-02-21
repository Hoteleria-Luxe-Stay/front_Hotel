#!/bin/sh
set -e

echo "Starting frontend container..."

if [ -n "$API_URL" ]; then
  echo "Injecting API_URL=$API_URL"
  find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8080|$API_URL|g" {} \;
fi

echo "Container ready."
exec "$@"
