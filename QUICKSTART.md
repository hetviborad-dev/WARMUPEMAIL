# Quick Start Guide

Get your email warm-up system running in 5 minutes!

## 1️⃣ Prerequisites

- Node.js 16+
- 2+ Gmail accounts with 2FA enabled
- GitHub account (for automation)

## 2️⃣ Local Setup (2 minutes)

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env

# Edit with your app passwords
nano .env  # or use your editor
```

## 3️⃣ Get Gmail App Passwords (2 minutes per account)

For **each Gmail account**:

1. Go to [Google Account](https://myaccount.google.com)
2. Click "Security" in left menu
3. Enable "2-Step Verification" (if not enabled)
4. Click "App passwords"
5. Choose "Mail" → "Windows Computer" or custom device
6. Copy the 16-character password

## 4️⃣ Configure Accounts (1 minute)

Edit `accounts.json`:

```json
{
  "accounts": [
    {
      "id": "account1",
      "email": "your-email-1@gmail.com",
      "passEnv": "EMAIL_PASS_1"
    },
    {
      "id": "account2",
      "email": "your-email-2@gmail.com",
      "passEnv": "EMAIL_PASS_2"
    }
  ],
  "flows": [
    {
      "sender": "account1",
      "receiver": "account2"
    },
    {
      "sender": "account2",
      "receiver": "account1"
    }
  ]
}
```

## 5️⃣ Test Locally

```bash
npm start
```

You should see one of:
- ✅ `Email sent successfully` - email was sent!
- ⏭️ `Skipping email (random behavior simulation)` - lucky 50% skip!

Run it multiple times to see both outcomes.

## 6️⃣ Deploy to GitHub (Optional)

```bash
git add .
git commit -m "Add email warm-up system"
git push origin main
```

Then add secrets:

1. Go to your GitHub repo
2. Settings → Secrets and variables → Actions
3. Create secrets:
   - `EMAIL_PASS_1` = your first app password
   - `EMAIL_PASS_2` = your second app password
   - (add more as needed)

**Done!** The system will now run every 5 minutes automatically 🚀

## Customization

### Change Email Frequency

Edit `.github/workflows/warmup.yml`:

```yaml
- cron: '*/5 * * * *'  # Every 5 minutes (default)
- cron: '0 * * * *'    # Every hour
- cron: '0 9,17 * * *' # 9 AM and 5 PM
```

### Add More Emails

Just configure all sender-receiver pairs in `flows`:

```json
"flows": [
  {"sender": "account1", "receiver": "account2"},
  {"sender": "account2", "receiver": "account1"},
  {"sender": "account1", "receiver": "account3"},
  {"sender": "account3", "receiver": "account1"}
]
```

### Customize Messages

Edit the `emailTemplates` object in `index.js`:

```javascript
const emailTemplates = {
  subjects: [
    'Your custom subject 1',
    'Your custom subject 2'
  ],
  bodies: [
    'Your custom message 1',
    'Your custom message 2'
  ]
};
```

### Change Skip Rate

In `index.js`, change `Math.random() < 0.5`:

```javascript
if (Math.random() < 0.5) {     // 50% skip
if (Math.random() < 0.3) {     // 30% skip
if (Math.random() < 0.8) {     // 80% skip
```

## Monitoring

### Local Testing

Watch logs in real-time:
```bash
npm start
```

### GitHub Actions

1. Go to your repo → Actions tab
2. Click "Email Warm-up" workflow
3. View recent runs and logs

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Environment variable not set" | Add secrets to GitHub or update .env file |
| Authentication failed | Generate new Gmail app passwords, check .env |
| No emails sent | Check if flow sender/receiver IDs match accounts |
| GitHub Actions not running | Make sure workflow file is in `.github/workflows/` |

## Support

Refer to [README.md](README.md) for complete documentation.

Happy warming! 🔥📧
