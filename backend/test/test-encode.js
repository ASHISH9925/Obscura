const fs = require('fs');
const path = require('path');
// You might need 'node-fetch' if you're on an older Node.js version
// const fetch = require('node-fetch'); 

async function runTest() {
    console.log('Starting backend test...');

    // 1. Prepare the file and form data
    const filePath = path.join(__dirname, 'test-file.txt');
    const fileName = 'test-file.txt';

    // Create a dummy test file if it doesn't exist
    if (!fs.existsSync(filePath)) {
        console.log('Creating dummy test-file.txt...');
        fs.writeFileSync(filePath, 'This is a secret message.');
    }

    const fileBuffer = fs.readFileSync(filePath);

    // We must use FormData to simulate a file upload
    const formData = new FormData();
    // 'file' must match your upload.single('file')
    formData.append('file', new Blob([fileBuffer]), fileName); 

    try {
        // 2. Call the API endpoint
        console.log('Calling http://localhost:8000/encode ...');
        const response = await fetch('http://localhost:8000/encode', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Got JSON response:');
        console.log(result);

        // 3. Decode and save the image
        const dataUrl = result.keyImageDataUrl;
        if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
            throw new Error('Invalid keyImageDataUrl in response.');
        }

        // Extract the Base64 part
        const base64Data = dataUrl.split(',')[1];
        
        // Create a buffer from the Base64 data
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // 4. Save the file to disk
        const outputImagePath = path.join(__dirname, 'TEST_DOWNLOADED_IMAGE.png');
        fs.writeFileSync(outputImagePath, imageBuffer);

        console.log('\n--- SUCCESS! ---');
        console.log(`Successfully downloaded and saved image to: ${outputImagePath}`);
        console.log(`Access URL for text file: ${result.accessUrl}`);

    } catch (error) {
        console.error('\n--- TEST FAILED ---');
        console.error(error);
    }
}

runTest();
