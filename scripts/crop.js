import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

import path from 'path';
import csvParser from 'csv-parser';
import { start } from 'repl';

function timeToSeconds(time,partialSeconds) {
  const parts = time.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;

  let partialToAdd = 0;
  if(partialSeconds !== '' || partialSeconds){
    partialToAdd = +partialSeconds;
  }
  return hours * 3600 + minutes * 60 + (seconds + partialToAdd);
}

function csvToJson(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
  
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // console.log('CSV file successfully converted to JSON');
          resolve(results);  // The results array contains the JSON data
        })
        .on('error', (err) => {
          console.error('Error reading the CSV file', err);
          reject(err);
        });
    });
  }

  let raiseVolume = [
    999999999025, //ray charles
    64739, //montainking
    234409, //funky drummer
    118357, //chubby
  ]

  let lowerVolume = [
    234473, //rihanna
    105701, //shaky
  ]


// Function to crop an MP3 file from a start to end timestamp and set volume level
async function cropMp3(inputPath, outputPath, startTimestamp, endTimestamp, volume = 0.1, seconds = [0,0]) {
    const startInSeconds = timeToSeconds(startTimestamp,seconds[0]);
    const endInSeconds = timeToSeconds(endTimestamp,seconds[1]);
    const duration = endInSeconds - startInSeconds;

    console.log("start",startInSeconds,endInSeconds)
  
    if (duration <= 0) {
      // console.log(inputPath, outputPath, startTimestamp, endTimestamp, volume)
      throw new Error(`Invalid timestamps hi: ${endInSeconds}`);
    }
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startInSeconds)     // Start time in seconds
        .setDuration(duration)        // Duration in seconds
        .audioFilters(`volume=${volume}`) // Set volume level
        .output(outputPath)
        .on('end', () => {
          console.log(`Successfully cropped ${inputPath} to ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Error cropping MP3 file: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }
  
// Main function to handle the process
async function main() {
//   const inputFile = path.resolve('./audio_inputs/king.mp3');  // Path to input file
//   const outputFile = path.resolve('./output.mp3'); // Path to output file

//   const startTimestamp = '00:00:10'; // Example: start cropping at 10 seconds
//   const endTimestamp = '00:00:20';   // Example: stop cropping at 20 seconds

  const filePath = '.././src/data/samples.csv'; // Path to your CSV file

  try {
    let jsonData = await csvToJson(filePath);
    jsonData = jsonData.filter(song => {
      return song.p_time_start !== '';
    });

    console.log(jsonData.length)

    // console.log('JSON Output:', jsonData);

    for (let song of jsonData){
 
        let c_end = '';
        let p_end = '';
        let c_start = '';
        let p_start = '';

        c_start = song.c_start_seconds;
        p_start = song.p_start_seconds;
        c_end = song.c_end_seconds;
        p_end = song.p_end_seconds;

        // Check if the audio file exists in audio_inputs directory
        const audioPathOne = path.resolve(`./audio_inputs/${song.p_id}.mp3`);
        const audioPathTwo = path.resolve(`./audio_inputs/${song.c_id}.mp3`);
        if (fs.existsSync(audioPathOne) && fs.existsSync(audioPathTwo)) {
          // console.log(song.p_id)
          const inputFileP = path.resolve(`./audio_inputs/${song.p_id}.mp3`);  // Path to input file
          const outputFileP = path.resolve(`../static/assets/audio/${song.link_id}-${song.p_id}.mp3`); // Path to output file
  
          const outputFilePalt = path.resolve(`../static/assets/audio/${song.p_id}.mp3`);

          const inputFileC = path.resolve(`./audio_inputs/${song.c_id}.mp3`);  // Path to input file
          const outputFileC = path.resolve(`../static/assets/audio/${song.link_id}-${song.c_id}.mp3`); // Path to output file
  
          const outputFileCalt = path.resolve(`../static/assets/audio/${song.c_id}.mp3`);



          const startTimestampP = song.p_time_start; // Example: start cropping at 10 seconds
          const endTimestampP = song.p_time_end;   // Example: stop cropping at 20 seconds
  
  
          const startTimestampC = song.c_time_start; // Example: start cropping at 10 seconds
          const endTimestampC = song.c_time_end;   // Example: stop cropping at 20 seconds
  
          let volumeP = .1;
          let volumeC = .1;


          if(raiseVolume.includes(parseInt(song.p_id))){
            volumeP = .5;
          }
          else if(lowerVolume.includes(parseInt(song.p_id))){
            volumeP = .08;
          }

          if(raiseVolume.includes(parseInt(song.c_id))){
            volumeC = .5;
          }
          else if(lowerVolume.includes(parseInt(song.c_id))){
            volumeP = .08;
          }

          try {
              cropMp3(inputFileP, outputFileP, startTimestampP, endTimestampP, volumeP,[p_start, p_end]);
              cropMp3(inputFileC, outputFileC, startTimestampC, endTimestampC, volumeC,[c_start, c_end]);

              cropMp3(inputFileP, outputFilePalt, startTimestampP, endTimestampP,volumeP,[p_start, p_end]);
              cropMp3(inputFileC, outputFileCalt, startTimestampC, endTimestampC,volumeC,[c_start, c_end]);
          } catch (err) {
              console.error('Failed to crop MP3:', err);
          }
  
        }
        

    }

    // You can also save jsonData to a file if needed
    // fs.writeFileSync('./output.json', JSON.stringify(jsonData, null, 2));
    // console.log('JSON data written to output.json');
  } catch (error) {
    console.error('Error during CSV to JSON conversion:', error);
  }


  // Ensure output file does not exist already

}

main();
