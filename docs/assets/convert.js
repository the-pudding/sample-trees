import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination directories
const sourceDir = path.join(__dirname, 'cover_art');
const destDir = path.join(__dirname, 'cover_art_sprite');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Get all PNG files
const files = fs.readdirSync(sourceDir)
    .filter(file => file.endsWith('.png'));

// Process each file
async function processFiles() {
    for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file.replace('.png', '.jpeg'));
        
        try {
            await sharp(sourcePath)
                .resize(100, 100, {
                    fit: 'cover',
                    position: 'center'
                })
                .toFormat('jpeg', {
                    quality: 35, // set quality for jpeg format (0-100)
                    mozjpeg: true, // enable mozjpeg for better compression efficiency
                    chromaSubsampling: '4:4:4' // use less chroma subsampling for better color quality
                })
                .withMetadata(false) // remove metadata
                .toFile(destPath);

            console.log(`Processed ${file} to ${path.basename(destPath)}`);
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }
    
    console.log(`Converted ${files.length} files`);
}

processFiles();
