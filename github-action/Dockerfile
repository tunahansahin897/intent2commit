FROM node:18-alpine

# Install Git
RUN apk add --no-cache git

# Install Intent2Commit CLI
RUN npm install -g intent2commit

# Copy action script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy action code
COPY check-alignment.js /check-alignment.js

ENTRYPOINT ["/entrypoint.sh"]
