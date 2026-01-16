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
    fontWeight?: string;
    fontStyle?: string;
    fontFamily?: string;
    textDirection?: string;
    textColor?: string;
    backgroundColor?: string;
    backgroundType?: string;
    lineSpacing?: number;
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
        
        // Recreate background based on detected type
        const backgroundType = block.backgroundType || 'solid';
        const backgroundColor = block.backgroundColor || 'white';
        
        if (backgroundType === 'solid') {
          // Simple solid color fill
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(x, y, width, height);
        } else if (backgroundType === 'gradient') {
          // Create gradient (parse CSS gradient or use solid as fallback)
          try {
            // Try to create a linear gradient from top to bottom
            const gradient = ctx.createLinearGradient(x, y, x, y + height);
            gradient.addColorStop(0, backgroundColor);
            gradient.addColorStop(1, backgroundColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
          } catch (e) {
            // Fallback to solid
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, width, height);
          }
        } else if (backgroundType === 'texture') {
          // Sample background pixels from original image
          try {
            // Create a temporary canvas to sample the background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              // Draw the background region from original image
              tempCtx.drawImage(img, x, y, width, height, 0, 0, width, height);
              
              // Apply slight blur to remove text artifacts
              tempCtx.filter = 'blur(2px)';
              tempCtx.drawImage(tempCanvas, 0, 0);
              
              // Draw the sampled background onto main canvas
              ctx.drawImage(tempCanvas, 0, 0, width, height, x, y, width, height);
            } else {
              // Fallback to solid color
              ctx.fillStyle = backgroundColor;
              ctx.fillRect(x, y, width, height);
            }
          } catch (e) {
            // Fallback to solid color
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, width, height);
          }
        }
        
        // Build font string with detected styles
        const fontSize = Math.max(12, height * 0.7);
        const fontWeight = block.fontWeight === 'bold' ? 'bold' : 'normal';
        const fontStyle = block.fontStyle === 'italic' ? 'italic' : 'normal';
        const fontFamily = block.fontFamily === 'serif' ? 'serif' : 
                          block.fontFamily === 'monospace' ? 'monospace' : 'sans-serif';
        
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        
        // Use detected text color or default to black
        ctx.fillStyle = block.textColor || 'black';
        ctx.textBaseline = 'top';
        
        const textDirection = block.textDirection || 'ltr';
        
        if (textDirection === 'vertical') {
          // Vertical text rendering (Japanese, Chinese)
          ctx.save();
          ctx.translate(x + width / 2, y + 2);
          ctx.rotate(Math.PI / 2);
          
          const chars = block.translatedText.split('');
          const charHeight = fontSize * 1.2;
          let currentY = 0;
          
          chars.forEach((char) => {
            if (currentY + charHeight <= height) {
              ctx.fillText(char, 0, currentY, width - 4);
              currentY += charHeight;
            }
          });
          
          ctx.restore();
        } else {
          // Horizontal text rendering (LTR or RTL)
          if (textDirection === 'rtl') {
            ctx.direction = 'rtl';
            ctx.textAlign = 'right';
          } else {
            ctx.direction = 'ltr';
            ctx.textAlign = 'left';
          }
          
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
          
          // Draw each line of text with detected line spacing
          const lineSpacingMultiplier = block.lineSpacing || 1.2;
          const lineHeight = fontSize * lineSpacingMultiplier;
          lines.forEach((line, index) => {
            const lineY = y + 2 + (index * lineHeight);
            if (lineY + lineHeight <= y + height) {
              const textX = textDirection === 'rtl' ? x + width - 2 : x + 2;
              ctx.fillText(line, textX, lineY, width - 4);
            }
          });
          
          // Reset text direction
          ctx.direction = 'ltr';
          ctx.textAlign = 'left';
        }
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
