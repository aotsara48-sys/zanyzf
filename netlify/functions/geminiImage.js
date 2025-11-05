// Ity no function ho an'ny famoronana Sary
// Mampiasa ilay lakile faharoa (AIzaSyBiP...)

// URL an'ny API Google
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent";

exports.handler = async (event) => {
    // Maka ilay lakile avy ao amin'ny Environment Variables an'i Netlify
    const apiKey = process.env.GEMINI_IMAGE_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Tsy hita ny API Key ho an'ny sary." }),
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Alaina ny data nalefan'ny (frontend)
        const { payload } = JSON.parse(event.body);

        if (!payload) {
             return {
                statusCode: 400,
                body: JSON.stringify({ error: "Tsy hita ny 'payload' tao amin'ny request." }),
            };
        }

        // Antsoina ny API an'i Google
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload), // Alefa ilay payload
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Google API Error:", errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Nisy olana tamin'ny Google API (Image)", details: errorText }),
            };
        }

        const result = await response.json();
        const generatedImageData = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

        if (!generatedImageData) {
            console.error("Valiny tsy ampy avy amin'ny Google:", result);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Tsy nisy sary niverina avy tamin'ny Google." }),
            };
        }

        // Averina amin'ny (frontend) ilay sary (base64)
        return {
            statusCode: 200,
            body: JSON.stringify({ imageData: generatedImageData }),
        };

    } catch (error) {
        console.error("Server Function Error (Image):", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
