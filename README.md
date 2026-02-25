# Email Warm-up System

An automated email warm-up system built with Node.js and Nodemailer to simulate human email behavior. Perfect for warming up new email accounts or maintaining sender reputation.

## Features

- 🚀 **Automated Email Sending**: Send emails on a schedule via GitHub Actions
- 🎲 **Randomization**: Randomized subjects, message bodies, and sender/receiver pairs
- 🤖 **Human Behavior Simulation**: 50% random skip rate to mimic natural email patterns
- 🔐 **Secure**: Uses Gmail App Passwords stored as GitHub Secrets
- ⏰ **Scheduled Execution**: Runs every 5 minutes via cron job
- 📧 **Multi-Account Support**: Manage multiple Gmail accounts with predefined flows

## Prerequisites

- Node.js 16+ installed locally
- Gmail accounts with 2FA enabled
- GitHub repository for hosting and automation

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd email-warmup-system
npm install
```

### 2. Configure Gmail Accounts

Edit `accounts.json` with your Gmail account details:

```json
{
  "accounts": [
    {
      "id": "account1",
      "email": "your-email@gmail.com",
      "passEnv": "EMAIL_PASS_1"
    }
  ],
  "flows": [
    {
      "sender": "account1",
      "receiver": "account2"
    }
  ]
}
```

### 3. Generate Gmail App Passwords

For each Gmail account:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer" (or custom device)
5. Generate and copy the 16-character password

### 4. Local Testing

Create a `.env` file with your app passwords (see `.env.example`):

```bash
cp .env.example .env
# Edit .env with your app passwords
```

Run the warm-up locally:

```bash
npm start
# or
node index.js
```

### 5. GitHub Actions Setup

1. **Add Secrets to GitHub**:
   - Go to Settings → Secrets and variables → Actions
   - Add secrets for each app password:
     - `EMAIL_PASS_1`
     - `EMAIL_PASS_2`
     - `EMAIL_PASS_3`
     - (Add more as needed)

2. **Automatic Scheduler**:
   The workflow in `.github/workflows/warmup.yml` automatically runs every 5 minutes.

3. **Manual Trigger**:
   You can manually trigger the workflow from the Actions tab in GitHub.

## Configuration

### accounts.json

```json
{
  "accounts": [
    {
      "id": "account1",           // Unique identifier
      "email": "email@gmail.com",  // Gmail address
      "passEnv": "EMAIL_PASS_1"    // Environment variable name
    }
  ],
  "flows": [
    {
      "sender": "account1",   // Sender account ID
      "receiver": "account2"  // Receiver account ID
    }
  ]
}
```

### Email Templates

The system sends randomized emails with:
- **10 different subject lines**
- **10 different message templates**
- Randomized sender and receiver pairs based on flows

Customize email templates by editing the `emailTemplates` object in `index.js`.

## How It Works

1. **50% Skip Logic**: Each run has a 50% chance to skip sending (simulating human behavior)
2. **Random Flow Selection**: If not skipped, a random sender-receiver pair is selected from configured flows
3. **Random Email Content**: A random subject and message body are chosen
4. **Send Email**: Email is sent via Gmail SMTP using the sender's app password
5. **Logging**: Full details are logged with timestamp

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EMAIL_PASS_1` | App password for account1 |
| `EMAIL_PASS_2` | App password for account2 |
| `EMAIL_PASS_3` | App password for account3 |

Add more as needed for additional accounts.

## Example Output

```
[2024-02-25T10:30:45.123Z] Email sent successfully
  From: account1@gmail.com
  To: account2@gmail.com
  Subject: Quick follow-up on our conversation
  Message ID: <xxxxx@gmail.com>
```

Or when skipped:

```
[2024-02-25T10:35:50.456Z] Skipping email (random behavior simulation)
```

## Troubleshooting

### Email Not Sending in GitHub Actions

- ✅ Verify secrets are added correctly in Settings → Secrets
- ✅ Check account IDs match in `accounts.json`
- ✅ Ensure passEnv variable names match secret names
- ✅ Verify Gmail accounts have App Passwords generated
- ✅ Check Actions logs for error details

### "Environment variable not set" Error

- ✅ Add the secret to GitHub with exact name (e.g., `EMAIL_PASS_1`)
- ✅ Update `accounts.json` passEnv to match secret name
- ✅ Verify account email address is correct

### Maximum 1 Email Per Run

The system sends **only 1 email per execution**. If you want multiple emails:
- Adjust cron schedule to run more frequently
- Modify the script to use a loop (not recommended for warm-up)

## Best Practices

1. **Start Slowly**: Begin with fewer flows and gradually increase
2. **Monitor Deliverability**: Check email delivery rates in Gmail
3. **Vary Content**: Regularly update email templates to stay natural
4. **Space Out Emails**: The 5-minute interval helps maintain reputation
5. **Use App Passwords**: Never use actual Gmail passwords

## File Structure

```
.
├── .github/
│   └── workflows/
│       └── warmup.yml          # GitHub Actions workflow
├── accounts.json               # Account and flow configuration
├── index.js                    # Main application
├── package.json                # Dependencies
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## License

MIT

## Security Notes

- ⚠️ Never commit `.env` file or actual app passwords
- ✅ Use GitHub Secrets for all sensitive data
- ✅ Rotate app passwords periodically
- ✅ Keep Node.js and dependencies updated
