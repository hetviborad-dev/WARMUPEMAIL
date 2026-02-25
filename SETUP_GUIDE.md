# Email Warm-up System - Setup Guide

## System Overview

This is a **production-ready email warm-up system** that:
- ✅ Sends 1 email per 5-minute cycle via GitHub Actions cron
- ✅ Randomizes sender, receiver, subject, and message body
- ✅ Simulates human behavior with 50% random skip rate
- ✅ Uses Gmail App Passwords for secure authentication
- ✅ Supports unlimited email accounts and flows
- ✅ Provides complete local testing capability

## Project Files

```
.
├── 📄 index.js                 # Main application (your workhorse)
├── 📄 accounts.json            # Your active configuration (EDIT THIS)
├── 📄 accounts.example.json    # Extended example for 4 accounts
├── 📄 package.json             # Dependencies & scripts
├── 📄 test.js                  # Validation script (npm test)
├── 📄 setup.sh                 # Setup helper script
├── 📄 .env.example             # Env template (copy to .env)
├── 📄 README.md                # Full documentation
├── 📄 QUICKSTART.md            # Quick start (5 min setup)
├── 📄 SETUP_GUIDE.md           # This file
├── 📄 .gitignore               # Git ignore rules
└── .github/
    └── workflows/
        └── warmup.yml          # GitHub Actions workflow
```

## Installation Steps

### Step 1: Install Node Dependencies

```bash
npm install
```

This installs Nodemailer (the email sending engine).

### Step 2: Generate Gmail App Passwords

For each Gmail account you want to use:

1. **Enable 2-Step Verification** (if not already enabled)
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Click "Security" in sidebar
   - Find "2-Step Verification"

2. **Generate App Password**
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" 
   - Select "Windows Computer" (or any device)
   - Google generates a 16-character password
   - **Copy this password** (you'll need it)

**Example app password**: `abcd efgh ijkl mnop` (spaces are included, copy exactly)

### Step 3: Set Up Local Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your app passwords
nano .env
# or use your preferred editor
```

Your `.env` should look like:
```
EMAIL_PASS_1=abcdefghijklmnop
EMAIL_PASS_2=qrstuvwxyzabcdef
EMAIL_PASS_3=ghijklmnopqrstuv
```

### Step 4: Configure Your Accounts

Edit `accounts.json`:

```json
{
  "accounts": [
    {
      "id": "account1",
      "email": "your-first-email@gmail.com",
      "passEnv": "EMAIL_PASS_1"
    },
    {
      "id": "account2",
      "email": "your-second-email@gmail.com",
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

**Important**: 
- `id` - Must be unique and reference-able
- `email` - Your actual Gmail address
- `passEnv` - Must match an environment variable name
- `sender` & `receiver` in flows must reference valid account IDs

### Step 5: Validate Configuration

```bash
npm test
```

This validates:
- ✅ Configuration file is valid JSON
- ✅ All accounts have required fields
- ✅ All flows reference valid accounts
- ✅ All environment variables are set

Output example:
```
✅ accounts.json found
✅ Configuration parsed successfully
   - Accounts: 2
   - Flows: 2
   ✅ account1: your-first-email@gmail.com
   ✅ account2: your-second-email@gmail.com
   ✅ account1 → account2
   ✅ account2 → account1
   ✅ EMAIL_PASS_1: set
   ✅ EMAIL_PASS_2: set
✅ All checks passed!
```

### Step 6: Test Locally

```bash
npm start
```

Expected output (one of these):

**Success:**
```
[2024-02-25T10:30:45.123Z] Email sent successfully
  From: account1@gmail.com
  To: account2@gmail.com
  Subject: Following up on our discussion
  Message ID: <xxxxx@gmail.com>
```

**Skipped (50% chance):**
```
[2024-02-25T10:35:50.456Z] Skipping email (random behavior simulation)
```

Run multiple times to test both scenarios!

## GitHub Actions Setup

### Option A: Automatic (Recommended)

The workflow runs automatically every 5 minutes once you add GitHub Secrets.

### Option B: Manual Setup

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add email warm-up system"
   git push origin main
   ```

2. **Add GitHub Secrets**
   - Go to your repo on GitHub
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add each secret:
     - Name: `EMAIL_PASS_1`
     - Value: `abcdefghijklmnop` (paste from Step 2)
   - Repeat for all accounts

   **Screenshot locations:**
   ```
   GitHub → Your Repo
   → Settings (tab)
   → Secrets and variables (left sidebar)
   → Actions (under Secrets)
   → New repository secret (green button)
   ```

3. **Enable Actions**
   - Go to Actions tab
   - Click "I understand my workflows..." if prompted
   - Workflow should appear as enabled

4. **Verify Execution**
   - Go to Actions tab
   - Click "Email Warm-up" workflow
   - You should see runs scheduled every 5 minutes

## How It Works

### Local Execution (`npm start`)
```
1. Load accounts.json
2. 50% random chance to skip → exit
3. Pick random flow (sender + receiver pair)
4. Get sender's app password from environment
5. Generate random subject + message body
6. Send email via Gmail SMTP
7. Log results with timestamp
```

### GitHub Actions Execution
```
1. Cron triggers every 5 minutes
2. Checkout repository
3. Install Node.js
4. Run npm install
5. Run npm start (with GitHub Secrets available as ENV)
6. Log output
```

## Email Templates

The system includes 10 subject lines and 10 messages. They rotate randomly.

### To Customize:

Edit `index.js`, find this section:

```javascript
const emailTemplates = {
  subjects: [
    'Quick follow-up on our conversation',
    'Checking in - wanted to update you',
    // ... more subjects
  ],
  bodies: [
    'Hi there,\n\nJust wanted to follow up...',
    'Hello,\n\nI hope this email...',
    // ... more bodies
  ]
};
```

Add your own subjects and bodies to the arrays. The system will randomly pick from all available options.

## Advanced Configuration

### Multiple Accounts

For 3+ accounts, see `accounts.example.json` for a 4-account setup example.

### Changing Frequency

Edit `.github/workflows/warmup.yml`:

```yaml
jobs:
  warmup:
    # Change the cron schedule
    - cron: '*/15 * * * *'  # Every 15 minutes
    - cron: '0 9-17 * * *'  # Every hour during 9am-5pm
    - cron: '0 0 * * *'     # Daily at midnight
```

[Cron Expression Guide](https://crontab.guru/)

### Changing Skip Rate

Edit `index.js`:

```javascript
// 50% skip (default)
if (Math.random() < 0.5) { ... }

// 30% skip (more emails)
if (Math.random() < 0.3) { ... }

// 70% skip (fewer emails)
if (Math.random() < 0.7) { ... }
```

### Disabling Skip Logic

Remove this entire block in `index.js`:
```javascript
if (Math.random() < 0.5) {
  console.log(`[${new Date().toISOString()}] Skipping email (random behavior simulation)`);
  return { status: 'skipped', reason: 'Random skip logic triggered' };
}
```

## Troubleshooting

### ❌ "Environment variable not set"

**Cause**: App password environment variable not found

**Fix**:
1. Check `.env` file exists (local testing)
2. Check GitHub Secrets are added (Actions)
3. Verify variable name matches `passEnv` in accounts.json
4. Example: If `passEnv: "EMAIL_PASS_1"`, secret must be named exactly `EMAIL_PASS_1`

### ❌ "Invalid account IDs in flow"

**Cause**: Flow references account ID that doesn't exist

**Fix**:
1. Open `accounts.json`
2. Check `flows` section
3. Verify `sender` and `receiver` match account `id` values
4. Example: If account `id` is "account1", flow must use "account1"

### ❌ "No accounts configured"

**Cause**: accounts.json is empty or malformed

**Fix**:
1. Check accounts.json syntax (use `npm test`)
2. Ensure `accounts` array has content
3. Valid example:
```json
{
  "accounts": [{"id":"a1","email":"test@gmail.com","passEnv":"PASS"}],
  "flows": [{"sender":"a1","receiver":"a1"}]
}
```

### ❌ GitHub Actions not running

**Cause**: Workflow file not found or disabled

**Fix**:
1. Check file exists: `.github/workflows/warmup.yml`
2. Go to Actions tab → "Email Warm-up"
3. Click "Enable workflow" if disabled
4. Check for syntax errors (YAML format)

### ❌ Email authentication failed

**Cause**: Invalid app password

**Fix**:
1. Generate new app password:
   - [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Delete old one if exists
   - Generate new one
2. Update `.env` locally
3. Update GitHub Secrets
4. Re-test

### ❌ Can't copy app password

**Common mistake**: App password disappears after copying

**Fix**:
- Google hides it after you click away
- Regenerate: Just go back to App passwords and generate again

## Best Practices

1. **Test Locally First**
   - Always run `npm test` before deploying
   - Always run `npm start` multiple times to verify

2. **Start with 2 Accounts**
   - Test with just 2 accounts first
   - Add more after everything is working

3. **Monitor Email Delivery**
   - Check Gmail to confirm emails are arriving
   - Look for bounces or delivery issues
   - Adjust frequency or content if needed

4. **Rotate Credentials**
   - Regenerate app passwords monthly
   - Use strong, unique passwords
   - Never share or commit passwords

5. **Scale Gradually**
   - Start with 5-minute intervals
   - Monitor deliverability
   - Gradually add more accounts and increase frequency

6. **Customize Content Regularly**
   - Update email templates monthly
   - Keep messages natural and varied
   - Avoid duplicate sending patterns

## File Reference

| File | Purpose |
|------|---------|
| `index.js` | Main application - handles email sending logic |
| `accounts.json` | Configuration you edit with your account details |
| `accounts.example.json` | Extended example showing 4-account setup |
| `package.json` | Dependencies and scripts - run `npm start`, etc |
| `test.js` | Validation tool - run `npm test` |
| `.env` | Local environment variables (created from .env.example) |
| `.env.example` | Template for .env file |
| `.gitignore` | Tells git to ignore .env and sensitive files |
| `.github/workflows/warmup.yml` | GitHub Actions automation |
| `README.md` | Full documentation |
| `QUICKSTART.md` | 5-minute setup guide |
| `setup.sh` | Bash setup helper script |

## Environment Variables Reference

| Variable | From | Used For |
|----------|------|----------|
| `EMAIL_PASS_1` | .env (local) or GitHub Secrets (Actions) | App password for account1 |
| `EMAIL_PASS_2` | .env (local) or GitHub Secrets (Actions) | App password for account2 |
| `EMAIL_PASS_3` | .env (local) or GitHub Secrets (Actions) | App password for account3 |
| Add more as needed | | Add more accounts |

## Support & Questions

- **Need help?** Check [QUICKSTART.md](QUICKSTART.md) for faster version
- **Full docs?** See [README.md](README.md)
- **Configuration unclear?** Review `accounts.example.json`
- **Validation issues?** Run `npm test` for detailed error messages

## Next Steps

1. ✅ Run `npm test` - Validate your setup
2. ✅ Run `npm start` - Test email sending 5-10 times
3. ✅ Push to GitHub if everything works
4. ✅ Add GitHub Secrets
5. ✅ Monitor Actions tab for runs
6. ✅ Profit! (Email reputation warming up)

**You're all set!** 🚀📧
