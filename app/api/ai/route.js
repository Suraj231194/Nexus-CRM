import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { contents, model } = await req.json();

        const apiKey = req.headers.get('x-custom-api-key') ||
            process.env.GEMINI_API_KEY ||
            process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: { message: 'API Key not found. Please add GEMINI_API_KEY to your Vercel Environment Variables.' } },
                { status: 401 }
            );
        }

        const primaryModel = model || 'gemini-1.5-flash';
        const fallbackModel = 'gemini-pro';

        async function callGemini(modelName) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
            });
            return response;
        }

        // Try primary model
        let response = await callGemini(primaryModel);

        // If primary failed (likely 404 not found or 400 invalid argument), try fallback
        if (!response.ok && (response.status === 404 || response.status === 400)) {
            console.warn(`Primary model ${primaryModel} failed with status ${response.status}. Retrying with ${fallbackModel}...`);
            response = await callGemini(fallbackModel);
        }

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error || { message: 'Failed to fetch from Gemini' } }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("AI Proxy Error:", error);
        return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }
}
