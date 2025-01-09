// Neural Network functions
function sigmoid(x) {
    if (x < -700) return 0;
    if (x > 700) return 1;
    return 1.0 / (1.0 + Math.exp(-x));
}

function feedforward(inputs, weights, biases) {
    let currentValues = inputs;
    
    // Process each layer
    for (let layer = 0; layer < weights.length; layer++) {
        const newValues = [];
        for (let i = 0; i < weights[layer].length; i++) {
            let total = biases[layer][i];
            for (let j = 0; j < weights[layer][i].length; j++) {
                total += weights[layer][i][j] * currentValues[j];
            }
            newValues.push(sigmoid(total));
        }
        currentValues = newValues;
    }
    return currentValues;
}

// Drawing functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Load network data
    const response = await fetch('mnist_weights.json');
    const networkData = await response.json();
    
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const clearButton = document.getElementById('clearButton');
    const predictButton = document.getElementById('predictButton');
    const predictionSpan = document.getElementById('prediction');
    let isDrawing = false;
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }
    
    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            ctx.closePath();
        }
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX;
        const y = ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY;
        
        if (e.type === 'mousedown' || e.type === 'touchstart') {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    
    function classifyDigit() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 28;
        tempCanvas.height = 28;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, 28, 28);
        tempCtx.drawImage(canvas, 0, 0, 280, 280, 0, 0, 28, 28);
        
        const imageData = tempCtx.getImageData(0, 0, 28, 28);
        const pixels = new Float32Array(784);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const gray = (255 - imageData.data[i]) / 255.0;
            pixels[i/4] = gray;
        }
        
        const output = feedforward(pixels, networkData.weights, networkData.biases);
        const prediction = output.indexOf(Math.max(...output));
        predictionSpan.textContent = `Prediction: ${prediction}`;
    }
    
    function clearCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        predictionSpan.textContent = '';
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', stopDrawing);
    
    clearButton.addEventListener('click', clearCanvas);
    predictButton.addEventListener('click', classifyDigit);
});