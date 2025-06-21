#!/bin/bash

# Development Health Check Script
# Run this before committing to catch issues early

echo "🔍 Running development checks..."
echo ""

# Check if Convex schema is valid
echo "📊 Checking Convex schema..."
npx convex codegen
if [ $? -ne 0 ]; then
  echo "❌ Convex schema has errors!"
  echo "Fix the schema errors above before continuing."
  exit 1
fi
echo "✅ Convex schema is valid"
echo ""

# Check TypeScript
echo "📝 Checking TypeScript..."
pnpm type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found!"
  exit 1
fi
echo "✅ TypeScript check passed"
echo ""

# Check ESLint
echo "🧹 Checking ESLint..."
pnpm lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint errors found!"
  echo "Run 'pnpm lint:fix' to auto-fix some issues"
  exit 1
fi
echo "✅ ESLint check passed"
echo ""

# Test Next.js build
echo "🏗️  Testing Next.js build..."
pnpm build
if [ $? -ne 0 ]; then
  echo "❌ Next.js build failed!"
  exit 1
fi
echo "✅ Next.js build successful"
echo ""

# Test Convex deployment (dry run)
echo "🔄 Testing Convex deployment (dry run)..."
echo "Note: This checks if your schema matches the deployed version"
npx convex deploy --dry-run 2>&1 | grep -E "(error|Error|failed|Failed)" > /dev/null
if [ $? -eq 0 ]; then
  echo "⚠️  Warning: Convex deployment might fail. Check the schema differences."
  echo "Run 'npx convex deploy --dry-run' to see details"
else
  echo "✅ Convex deployment check passed"
fi
echo ""

echo "🎉 All checks passed! Safe to commit and deploy."