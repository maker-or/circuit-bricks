#!/bin/bash

# Security check script for circuit-bricks package

echo "Running security checks for circuit-bricks..."

# Run npm audit
echo "=== Running npm audit ==="
npm audit --production

# Check for outdated dependencies
echo "=== Checking for outdated dependencies ==="
npm outdated

# Ensure test coverage
echo "=== Checking test coverage ==="
npm run test:coverage

# Verify the build
echo "=== Verifying build ==="
npm run build:all

echo "Security checks complete!"
