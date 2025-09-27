#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies and build client
echo "Installing client dependencies and building client..."
cd client
npm install
npm run build
cd ..

echo "Build complete."
