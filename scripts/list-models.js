const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

async function main() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        console.error('API key not found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // Dummy init to get client? No, need ModelManager or simply fetch
        // The SDK might not have listModels exposed easily on the main entry.
        // Let's use fetch for raw listing if SDK doesn't support it easily in this version.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
                console.log(`  Supported: ${m.supportedGenerationMethods.join(', ')}`);
            });
        } else {
            console.error('No models found or error:', data);
        }

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

main();
