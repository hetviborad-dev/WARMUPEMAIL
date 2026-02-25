#!/usr/bin/env node

/**
 * Email Connectivity Tester
 * Tests if a Gmail account can send emails with the provided app password
 * Usage: node test-email.js <email> <apppassword> [receiver_email]
 */

const nodemailer = require('nodemailer');

// Get arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n📧 Email Connectivity Tester\n');
  console.log('Usage:');
  console.log('  node test-email.js <sender_email> <app_password> [receiver_email]\n');
  console.log('Example:');
  console.log('  node test-email.js sender@gmail.com abcdefghijklmnop receiver@gmail.com\n');
  console.log('If receiver_email is not provided, sends to the same address.\n');
  process.exit(1);
}

const senderEmail = args[0];
const appPassword = args[1];
const receiverEmail = args[2] || senderEmail;

console.log('\n🔍 Testing Gmail connectivity...\n');
console.log(`From: ${senderEmail}`);
console.log(`To: ${receiverEmail}`);
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: senderEmail,
    pass: appPassword
  }
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Connection failed:');
    console.log(`   Error: ${error.message}\n`);
    if (error.message.includes('Invalid login')) {
      console.log('💡 Tip: Check that:');
      console.log('   - Email address is correct');
      console.log('   - App password is correct (16 characters with spaces)');
      console.log('   - 2-Step Verification is enabled on the account');
      console.log('   - App password is still valid (regenerate if needed)\n');
    }
    process.exit(1);
  }

  console.log('✅ Connection successful!\n');
  console.log('📤 Sending test email...\n');

  // Send test email
  const mailOptions = {
    from: senderEmail,
    to: receiverEmail,
    subject: 'Test Email - Email Warm-up System',
    text: `This is a test email from the Email Warm-up System.\n\nIf you received this, your Gmail account is properly configured!`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ Failed to send email:');
      console.log(`   Error: ${error.message}\n`);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!\n');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}\n`);
    console.log('✅ Your account is ready to use!\n');
    process.exit(0);
  });
});
