import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';  // Add CSV parser

dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Function to get Spotify access token
async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

// Function to search for a track
async function searchTrack(query, token) {
    const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    const data = await response.json();
    console.log(data);
    return data.tracks?.items[0];
}

// Function to download image
async function downloadImage(url, filepath) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(filepath, buffer);
}

// Main function to process tracks and download cover art
async function getCoverArt() {
    try {
        // Read and parse the CSV file
        const fileContent = fs.readFileSync('./src/data/nodes.csv', 'utf-8');
        const tracksData = parse(fileContent, {
            columns: true,  // Use first row as headers
            skip_empty_lines: true
        })//.slice(0,1000);
        
        // Create output directory if it doesn't exist
        const outputDir = './static/assets/cover_art';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Get existing cover art files
        const existingFiles = new Set(
            fs.readdirSync(outputDir)
                .map(filename => filename.replace('.png', ''))
        );

        // Filter tracks that don't have cover art yet
        const tracksToProcess = tracksData.filter(track => !existingFiles.has(track.id));
        
        console.log(`Found ${tracksToProcess.length} tracks without cover art`);

        // Get Spotify access token
        const token = await getAccessToken();

        // Process each track
        for (const track of tracksToProcess) {
            const searchQuery = `${track.title} ${track.primary_artist}`;
            console.log(`Searching for: ${searchQuery}`);

            try {
                const spotifyTrack = await searchTrack(searchQuery, token);

                if (spotifyTrack && spotifyTrack.album.images.length > 0) {
                    const imageUrl = spotifyTrack.album.images[0].url;
                    const filepath = path.join(outputDir, `${track.id}.png`);

                    await downloadImage(imageUrl, filepath);
                    console.log(`Downloaded cover art for: ${track.title}`);
                } else {
                    console.log(`No cover art found for: ${track.title}`);
                }

                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error processing track ${track.title}:`, error);
            }
        }

        console.log('Cover art download complete!');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the script
getCoverArt();
