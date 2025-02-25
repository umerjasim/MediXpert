# Use official Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies for both frontend and backend
COPY medixpert-api/package.json medixpert-api/
COPY medixpert-app/package.json medixpert-app/
RUN cd medixpert-api && npm install
RUN cd medixpert-app && npm install

# Copy the rest of the files
COPY . .

# Build the frontend
RUN cd medixpert-app && npm run build

# Expose the port (Backend API)
EXPOSE 5000

# Start the backend (Ensure your Express server serves the React build)
CMD ["sh", "-c", "cd medixpert-api && node server.js"]
