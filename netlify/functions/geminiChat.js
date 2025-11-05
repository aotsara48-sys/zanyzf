// Ity no function ho an'ny Chat sy ny fandikana teny (prompt)
// Mampiasa ilay lakile voalohany (AIzaSyAp7...)

// URL an'ny API Google
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

exports.handler = async (event) => {
    // Maka ilay lakile avy ao amin'ny Environment Variables an'i Netlify
    const apiKey = process.env.GEMINI_CHAT_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Tsy hita ny API Key ho an'ny chat." }),
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Alaina ny data nalefan'ny (frontend)
        const requestBody = JSON.parse(event.body);

        // Antsoina ny API an'i Google
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody), // Alefa mivantana ny body nalefan'ny client
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Google API Error:", errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Nisy olana tamin'ny Google API (Chat)", details: errorText }),
            };
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error("Valiny tsy ampy avy amin'ny Google:", result);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Tsy nisy valiny 'text' avy tamin'ny Google." }),
            };
        }

        // Averina amin'ny (frontend) ilay valiny
        return {
            statusCode: 200,
            body: JSON.stringify({ text: text }),
        };

    } catch (error) {
        console.error("Server Function Error (Chat):", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }

};
