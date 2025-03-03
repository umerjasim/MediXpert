# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first (to leverage Docker caching)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the project files
COPY . .

# Build the frontend
RUN yarn build

# Install `serve` globally to serve the production build
RUN yarn global add serve

# Expose the port (Render will use $PORT)
EXPOSE 10000

# Start the app using the Render-assigned PORT dynamically
CMD ["sh", "-c", "serve -s build -l ${PORT:-10000}"]
