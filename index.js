require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email templates for warm-up messages
const emailTemplates = {
  subjects: [
    'Quick follow-up on our conversation',
    'Checking in - wanted to update you',
    'Following up on the recent discussion',
    'Thought you might find this interesting',
    'Wanted to reconnect about our earlier chat',
    'Quick note regarding our discussion',
    'Following up - would love your thoughts',
    'Checking in with an update',
    'Wanted to follow up on this',
    'Quick update for you'
  ],
  bodies: [
    'Hi there,\n\nJust wanted to follow up on our previous conversation. Let me know if you have any questions.\n\nBest regards',
    'Hello,\n\nI hope this email finds you well. I wanted to check in and see how things are progressing.\n\nLooking forward to hearing from you.',
    'Hi,\n\nI wanted to reconnect and see if there\'s anything I can assist you with. Feel free to reach out anytime.\n\nBest,',
    'Hey,\n\nThinking of our recent chat and wanted to send over a quick update. Let me know your thoughts!\n\nThanks,',
    'Hello,\n\nJust a quick note to stay connected. Is there anything I can help you with?\n\nWarm regards,',
    'Hi there,\n\nWanted to check in and see how you\'re doing. Looking forward to connecting again soon.\n\nBest regards,',
    'Hello,\n\nFollowing up on our discussion from earlier. Would value your input on this.\n\nThanks,',
    'Hi,\n\nJust wanted to reach out and touch base. Hope to hear from you soon.\n\nBest,',
    'Hey,\n\nThought I\'d send a quick note. Would love to catch up when you have a moment.\n\nThanks,',
    'Hello,\n\nJust checking in to see if you\'re available for a quick chat. Looking forward to connecting.\n\nBest regards,'
  ]
};

// State file path
const stateFilePath = path.join(__dirname, 'state.json');

// Load state from file
function loadState() {
  try {
    if (fs.existsSync(stateFilePath)) {
      const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      return state;
    }
    return { lastAction: 'sent', flowIndex: -1 }; // Default: start from first flow
  } catch (error) {
    console.error('Error loading state:', error.message);
    return { lastAction: 'sent', flowIndex: -1 };
  }
}

// Save state to file
function saveState(state) {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error saving state:', error.message);
  }
}

// Load configuration
function loadConfig() {
  try {
    const configPath = path.join(__dirname, 'accounts.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    console.error('Error loading config:', error.message);
    process.exit(1);
  }
}

// Get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random subject
function getRandomSubject() {
  return getRandomElement(emailTemplates.subjects);
}

// Get random body
function getRandomBody() {
  return getRandomElement(emailTemplates.bodies);
}

// Get account by ID
function getAccountById(config, accountId) {
  return config.accounts.find(acc => acc.id === accountId);
}

// Create transporter for sending email
function createTransporter(email, password) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password
    }
  });
}

// Main warm-up function
async function sendWarmupEmail() {
  try {
    // Load state to decide if we should send
    const state = loadState();
    let shouldSend = false;
    let reason = '';

    // Decision logic:
    // - If we skipped last time, MUST send this time
    // - If we sent last time, randomly decide (50% chance to skip)
    if (state.lastAction === 'skipped') {
      shouldSend = true;
      reason = 'MUST SEND (skipped last time)';
    } else {
      // Randomly decide: 50% skip, 50% send
      shouldSend = Math.random() >= 0.5;
      reason = shouldSend ? 'Random decision: SEND' : 'Random decision: SKIP';
    }

    // If skipping, log and return
    if (!shouldSend) {
      console.log(`[${new Date().toISOString()}] ⏭️  Skipping email`);
      console.log(`  Reason: ${reason}`);
      console.log(`  Next run WILL send to ensure regular warmup\n`);
      
      // Save state: skipped (keep same flowIndex)
      saveState({ 
        lastAction: 'skipped', 
        flowIndex: state.flowIndex,
        timestamp: new Date().toISOString() 
      });
      return { status: 'skipped', reason: reason };
    }

    // Load configuration
    const config = loadConfig();

    if (!config.accounts || config.accounts.length === 0) {
      throw new Error('No accounts configured in accounts.json');
    }

    if (!config.flows || config.flows.length === 0) {
      throw new Error('No flows configured in accounts.json');
    }

    // Get next flow index (sequential)
    let nextFlowIndex = (state.flowIndex + 1) % config.flows.length;
    const flow = config.flows[nextFlowIndex];

    const senderAccount = getAccountById(config, flow.sender);
    const receiverAccount = getAccountById(config, flow.receiver);

    if (!senderAccount || !receiverAccount) {
      throw new Error(`Invalid account IDs in flow: sender=${flow.sender}, receiver=${flow.receiver}`);
    }

    // Get app password from environment variable
    const appPassword = process.env[senderAccount.passEnv];
    if (!appPassword) {
      throw new Error(`Environment variable ${senderAccount.passEnv} not set for account ${senderAccount.id}`);
    }

    // Create transporter
    const transporter = createTransporter(senderAccount.email, appPassword);

    // Prepare email - use flow subject/message if provided, otherwise use random templates
    const subject = flow.subject || getRandomSubject();
    const text = flow.message || getRandomBody();

    const senderName = senderAccount.displayName || senderAccount.email.split('@')[0];

    const mailOptions = {
      from: `${senderName} <${senderAccount.email}>`,
      to: receiverAccount.email,
      subject: subject,
      text: text
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);

    console.log(`[${new Date().toISOString()}] 📧 Email #${nextFlowIndex + 1} sent successfully`);
    console.log(`  Reason: ${reason}`);
    console.log(`  Flow: ${flow.sender} → ${flow.receiver}`);
    console.log(`  From: ${senderName} <${senderAccount.email}>`);
    console.log(`  To: ${receiverAccount.email}`);
    console.log(`  Subject: ${subject}\n`);

    // Save state: sent with new flowIndex
    saveState({ 
      lastAction: 'sent', 
      flowIndex: nextFlowIndex,
      lastFlowSent: {
        sender: flow.sender,
        receiver: flow.receiver,
        subject: subject
      },
      timestamp: new Date().toISOString() 
    });

    return {
      status: 'sent',
      flowIndex: nextFlowIndex,
      from: senderAccount.email,
      senderName: senderName,
      to: receiverAccount.email,
      subject: subject,
      messageId: result.messageId
    };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error sending email:`, error.message);
    process.exit(1);
  }
}

// Run the warm-up
sendWarmupEmail().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
