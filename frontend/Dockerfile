FROM node:20

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
