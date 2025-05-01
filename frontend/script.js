document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const generatedScript = document.getElementById('generatedScript');
    const scriptText = document.getElementById('scriptText');
    const listenBtn = document.getElementById('listenBtn');
    const copyBtn = document.getElementById('copyBtn');
    const errorMessage = document.getElementById('errorMessage');

    let currentAudioUrl = null;

    // Generate script
    generateBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) {
            showError('Please enter some text first');
            return;
        }

        try {
            showLoading();
            console.log('Sending request to generate script...');
            const response = await fetch('http://localhost:5000/api/generate-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate script');
            }

            // Update UI with generated script
            scriptText.textContent = data.generatedScript;
            currentAudioUrl = data.audioUrl;
            generatedScript.classList.remove('hidden');
            hideError();
        } catch (error) {
            console.error('Error details:', error);
            showError(error.message);
        } finally {
            hideLoading();
        }
    });

    // Listen to generated script
    listenBtn.addEventListener('click', () => {
        if (!currentAudioUrl) {
            showError('No audio available to play');
            return;
        }

        const audio = new Audio(currentAudioUrl);
        audio.play().catch(error => {
            console.error('Audio playback error:', error);
            showError('Failed to play audio: ' + error.message);
        });
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const text = scriptText.textContent;
        if (!text) {
            showError('No script to copy');
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                // Show temporary success message
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(error => {
                console.error('Copy error:', error);
                showError('Failed to copy text: ' + error.message);
            });
    });

    // Helper functions
    function showLoading() {
        loadingIndicator.classList.remove('hidden');
        generateBtn.disabled = true;
    }

    function hideLoading() {
        loadingIndicator.classList.add('hidden');
        generateBtn.disabled = false;
    }

    function showError(message) {
        console.error('Error:', message);
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
}); 