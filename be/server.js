const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const HIBP_API_KEY = 'YOUR_HIBP_API_KEY'; // Get yours at haveibeenpwned.com/API/Key
const PORT = 3000;

app.get('/check-breach', async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
    }

    try {
        const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`;
        const response = await axios.get(url, {
            headers: {
                'hibp-api-key': HIBP_API_KEY,
                'user-agent': 'MyExpressBreachChecker'
            }
        });

        // The API returns an array of breach objects
        const breaches = response.data;
        const breachCount = breaches.length;

        // Console log the results
        console.log(`--- Breach Report for: ${email} ---`);
        console.log(`Total Breaches Found: ${breachCount}`);
        console.log('Websites Involved:');
        breaches.forEach((b, index) => {
            console.log(`${index + 1}. ${b.Name} (Domain: ${b.Domain})`);
        });

        res.json({ count: breachCount, breaches: breaches, email: email });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // HIBP returns 404 if the email has NO breaches
            console.log(`--- No breaches found for: ${email} ---`);
            return res.json({ count: 0, breaches: [], email: email });
        }
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from HIBP API' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});