#!/bin/bash

echo "Building Mini Perplexity Docker image..."
docker build -t mini-perplexity .

echo ""
echo "Running Mini Perplexity container..."
docker run -d \
  --name mini-perplexity-app \
  -p 3000:3000 \
  -e GEMINI_API_KEY=AIzaSyCmc0NWWTKPEDnXDJiV7Myznmx5neNhYh0 \
  -e TAVILY_API_KEY=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 \
  -e NEXTAUTH_SECRET=your-secret-key-here \
  -e NEXTAUTH_URL=http://localhost:3000 \
  mini-perplexity

echo ""
echo "Container started! Access your app at http://localhost:3000"
echo ""
echo "To stop the container, run: docker stop mini-perplexity-app"
echo "To remove the container, run: docker rm mini-perplexity-app"
