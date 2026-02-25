#!/bin/bash

# Email Warm-up System Setup Script

echo "🚀 Email Warm-up System Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+."
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Gmail app passwords"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit accounts.json with your Gmail accounts"
echo "2. Generate Gmail app passwords (https://myaccount.google.com/apppasswords)"
echo "3. Edit .env file with your app passwords"
echo "4. Test locally: npm start"
echo ""
echo "🚀 For GitHub Actions:"
echo "1. Push to GitHub"
echo "2. Add secrets in Settings → Secrets → Actions"
echo "3. The workflow will automatically run every 5 minutes"
echo ""
