// No require needed for Node 18+
async function test() {
    try {
        console.log("Testing TTS Server...");
        const response = await fetch('http://localhost:3000/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "Hello world",
                voiceSettings: {
                    languageCode: 'en-US',
                    voiceName: 'en-US-Journey-D',
                    ssmlGender: 'MALE'
                }
            })
        });

        if (!response.ok) {
            console.log("Response Status:", response.status);
            const text = await response.text();
            console.log("Response Body:", text);
        } else {
            const data = await response.json();
            console.log("Success! Audio length:", data.audioContent ? data.audioContent.length : "No Content");
        }
    } catch (e) {
        console.error("Test Request Failed:", e);
    }
}

test();
