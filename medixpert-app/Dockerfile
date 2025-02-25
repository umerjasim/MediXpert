# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the project files
COPY . .

# Build the frontend
RUN yarn build

# Expose the port
EXPOSE 3000

# Serve the frontend using a lightweight server
CMD ["yarn", "start"]
