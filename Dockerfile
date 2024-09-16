# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install all dependencies
RUN npm install --no-cache --legacy-peer-deps

# Copy the entire project into the working directory
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variables
ENV MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/ticketmain"}

# Run the app using npm
CMD ["npm", "start"]
