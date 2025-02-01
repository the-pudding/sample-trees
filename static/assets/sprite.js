import fs from "fs";
import Spritesmith from "spritesmith";
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sprite() {
    return new Promise((resolve, reject) => {
        try {
            const coverArtDir = path.join(__dirname, 'cover_art_jpegs');
            let files = fs.readdirSync(coverArtDir)
                .filter(file => file.endsWith('.jpeg'))
                .map(file => path.join(coverArtDir, file));

            console.log('Processing files:', files);
            
            Spritesmith.run({
                src: files,
                algorithm: 'binary-tree',
                padding: 2
            }, async function handleResult(err, result) {
                if (err) {
                    reject(err);
                    return;
                }

                try {
                    // Save coordinates JSON
                    const coordsPath = path.join(__dirname, 'sprites', 'coordinates.json');
                    const coordinates = {};
                    
                    // Process coordinates to use just the filename without path
                    Object.entries(result.coordinates).forEach(([filepath, coords]) => {
                        const filename = path.basename(filepath);
                        coordinates[filename] = coords;
                    });
                    
                    fs.writeFileSync(coordsPath, JSON.stringify(coordinates, null, 2));
                    console.log('Saved coordinates to:', coordsPath);

                    // Save spritesheet as JPEG
                    const spritesheetPath = path.join(__dirname, 'sprites', 'spritesheet.jpeg');
                    await sharp(result.image)
                        .toFormat('jpeg', {
                            quality: 50,
                            mozjpeg: true,
                            chromaSubsampling: '4:4:4'
                        })
                        .withMetadata(false)
                        .toFile(spritesheetPath);
                    
                    console.log('Saved spritesheet to:', spritesheetPath);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Use async/await to properly wait for the promise
async function main() {
    try {
        // Create sprites directory if it doesn't exist
        const spritesDir = path.join(__dirname, 'sprites');
        if (!fs.existsSync(spritesDir)) {
            fs.mkdirSync(spritesDir, { recursive: true });
        }

        const result = await sprite();
        console.log('Sprite generation complete!');
        console.log(`Total sprites: ${Object.keys(result.coordinates).length}`);
        console.log(`Spritesheet dimensions: ${result.properties.width}x${result.properties.height}`);
    } catch (error) {
        console.error('Error generating sprites:', error);
    }
}

main();