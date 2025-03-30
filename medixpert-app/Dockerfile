# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (to leverage Docker caching)
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm ci

# Copy the rest of the project files
COPY . .

# Build the frontend using npm
RUN npm run build

# Install `serve` globally to serve the production build
RUN npm install -g serve

# Expose the Render-assigned port (Render assigns a port dynamically)
EXPOSE 10000

# Ensure the service correctly serves the built React app
CMD ["sh", "-c", "serve -s /app/build -l $PORT"]
