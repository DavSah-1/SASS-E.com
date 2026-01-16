/**
 * Renders translated text overlay on an image using canvas
 */
export async function renderImageOverlay(
  imageUrl: string,
  textBlocks: Array<{
    originalText: string;
    translatedText: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Process each text block
      textBlocks.forEach((block) => {
        const x = block.x * img.width;
        const y = block.y * img.height;
        const width = block.width * img.width;
        const height = block.height * img.height;
        
        // Mask original text with white rectangle
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, width, height);
        
        // Calculate font size based on block height
        const fontSize = Math.max(12, height * 0.7);
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'top';
        
        // Word wrap the translated text to fit within the block width
        const words = block.translatedText.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > width - 4) {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              // Single word is too long, just use it
              lines.push(word);
              currentLine = '';
            }
          } else {
            currentLine = testLine;
          }
        });
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // Draw each line of text
        const lineHeight = fontSize * 1.2;
        lines.forEach((line, index) => {
          const lineY = y + 2 + (index * lineHeight);
          if (lineY + lineHeight <= y + height) {
            ctx.fillText(line, x + 2, lineY, width - 4);
          }
        });
      });
      
      // Convert canvas to data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Downloads an image from a data URL
 */
export function downloadImage(dataUrl: string, filename: string = 'translated-image.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
