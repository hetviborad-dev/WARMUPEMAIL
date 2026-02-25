#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

require('dotenv').config();

console.log('\n🧪 Email Warm-up System - Validation Test\n');
console.log('==========================================\n');

// Check 1: Configuration file exists
console.log('📝 Check 1: Configuration file');
const configPath = path.join(__dirname, 'accounts.json');
if (fs.existsSync(configPath)) {
  console.log('✅ accounts.json found\n');
} else {
  console.log('❌ accounts.json not found\n');
  process.exit(1);
}

// Check 2: Parse configuration
console.log('📋 Check 2: Parse configuration');
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log(`✅ Configuration parsed successfully`);
  console.log(`   - Accounts: ${config.accounts.length}`);
  console.log(`   - Flows: ${config.flows.length}\n`);
} catch (error) {
  console.log(`❌ Failed to parse accounts.json: ${error.message}\n`);
  process.exit(1);
}

// Check 3: Validate accounts
console.log('👤 Check 3: Account configuration');
let accountErrors = 0;
config.accounts.forEach(account => {
  if (!account.id || !account.email || !account.passEnv) {
    console.log(`❌ Account missing required fields: ${JSON.stringify(account)}`);
    accountErrors++;
  } else {
    console.log(`   ✅ ${account.id}: ${account.email}`);
  }
});
if (accountErrors === 0) {
  console.log('✅ All accounts valid\n');
} else {
  console.log(`❌ ${accountErrors} account(s) have errors\n`);
  process.exit(1);
}

// Check 4: Validate flows
console.log('🔄 Check 4: Flow configuration');
let flowErrors = 0;
config.flows.forEach((flow, index) => {
  if (!flow.sender || !flow.receiver) {
    console.log(`❌ Flow ${index} missing sender or receiver`);
    flowErrors++;
  } else {
    const senderExists = config.accounts.some(a => a.id === flow.sender);
    const receiverExists = config.accounts.some(a => a.id === flow.receiver);
    
    if (!senderExists) {
      console.log(`❌ Flow ${index}: sender "${flow.sender}" not found in accounts`);
      flowErrors++;
    } else if (!receiverExists) {
      console.log(`❌ Flow ${index}: receiver "${flow.receiver}" not found in accounts`);
      flowErrors++;
    } else {
      console.log(`   ✅ ${flow.sender} → ${flow.receiver}`);
    }
  }
});
if (flowErrors === 0) {
  console.log('✅ All flows valid\n');
} else {
  console.log(`❌ ${flowErrors} flow(s) have errors\n`);
  process.exit(1);
}

// Check 5: Environment variables
console.log('🔐 Check 5: Environment variables');
let envErrors = 0;
const requiredEnvs = new Set();
config.accounts.forEach(account => {
  requiredEnvs.add(account.passEnv);
});

requiredEnvs.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: set`);
  } else {
    console.log(`   ❌ ${envVar}: NOT SET`);
    envErrors++;
  }
});
console.log('');

if (envErrors > 0) {
  console.log(`❌ ${envErrors} environment variable(s) not set\n`);
  console.log('💡 Set them in .env file or GitHub Secrets\n');
  process.exit(1);
}

console.log('✅ All environment variables configured\n');

// Check 6: Email validation (optional)
console.log('📧 Check 6: Email account validation (optional)');
console.log('   Run: npm start\n');

console.log('✅ All checks passed! System is ready to use.\n');
console.log('Next step: npm start\n');
