# Project Setup - Environment Variables

## Backend Environment Variables

### Step 1: Create `.env` file
Copy the example file to create your actual `.env` file:

```bash
cd be
cp .env.example .env
```

### Step 2: Add your API keys
Edit `be/.env` and add your actual API keys:

```
NYCKEL_API_KEY=your_actual_api_key_here
```

### Supported Environment Variables

| Variable | Required | Description | Source |
|----------|----------|-------------|--------|
| `NYCKEL_API_KEY` | No* | API key for PII detection in audio transcriptions | https://www.nyckel.com/ |

*The app has a fallback pattern-based PII detector if this key is not provided, but Nyckel provides more accurate results.

### Step 3: Start the backend
The app will automatically load variables from the `.env` file:

```bash
python -m uvicorn app:app --reload
```

## Getting API Keys

### Nyckel API Key
1. Go to https://www.nyckel.com/
2. Sign up for a free account
3. Create a new PII detection function or use an existing one
4. Get your API key from the settings
5. Add it to your `.env` file

## Security Notes

⚠️ **Important**: Never commit `.env` to git!

- The `.env` file is automatically excluded by `.gitignore`
- Keep your API keys private and secure
- Don't share your `.env` file with anyone
- Rotate keys if they're accidentally exposed

## Troubleshooting

**Q: The PII detection isn't working**
- Check if `NYCKEL_API_KEY` is set in your `.env` file
- Verify the API key is valid and not expired
- The app will automatically fall back to pattern-based detection if the API key is invalid

**Q: Environment variables not loading**
- Ensure you've created the `.env` file in the `be/` directory
- Restart the backend server after creating/modifying `.env`
- Check that the variable format is correct: `KEY=value` (no spaces around `=`)

**Q: "python-dotenv not installed" error**
- Run `pip install -r requirements.txt` to install all dependencies
