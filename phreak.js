#!/usr/bin/env node

import { select, Separator } from '@inquirer/prompts';
import { AudioContext } from 'node-web-audio-api';
import fs from 'fs';
import path from 'path';

global.AudioContext = AudioContext;

var dtmf = {
    "0":{ "hf": "1336", "lf": "941" },
    "1":{ "hf": "1209", "lf": "697" },
    "2":{ "hf": "1336", "lf": "697" },
    "3":{ "hf": "1477", "lf": "697" },
    "4":{ "hf": "1209", "lf": "770" },
    "5":{ "hf": "1336", "lf": "770" },
    "6":{ "hf": "1477", "lf": "770" },
    "7":{ "hf": "1209", "lf": "852" },
    "8":{ "hf": "1336", "lf": "852" },
    "9":{ "hf": "1477", "lf": "852" },
    "*":{ "hf": "1209", "lf": "941" },
    "#":{ "hf": "1477", "lf": "941" },
    "A":{ "hf": "1633", "lf": "697" },
    "B":{ "hf": "1633", "lf": "770" },
    "C":{ "hf": "1633", "lf": "852" },
    "D":{ "hf": "1633", "lf": "941" }
}

async function playDTMF(key, duration){
    let highFrequency = parseInt(dtmf[key].hf);
    let lowFrequency = parseInt(dtmf[key].lf);
    
    var audioCtx = new AudioContext();
    var oscillatorHigh = audioCtx.createOscillator();
    var oscillatorLow = audioCtx.createOscillator();
    
    oscillatorHigh.frequency.setValueAtTime(highFrequency, audioCtx.currentTime);
    oscillatorLow.frequency.setValueAtTime(lowFrequency, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillatorHigh.connect(gainNode);
    oscillatorLow.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillatorHigh.start();
    oscillatorLow.start();

    var stopTime = audioCtx.currentTime + duration;
    oscillatorHigh.stop(stopTime);
    oscillatorLow.stop(stopTime);

    await new Promise((resolve) => setTimeout(resolve, duration * 1500));
    await audioCtx.close();
}

function rest(duration) {
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
}

let loadSong = (filename) => {
    const data = fs.readFileSync(filename, { encoding: 'utf8' });
    return JSON.parse(data);
}

async function playSong(song) {
    for (const note of song.notes) {
        if (note.key) {
            await playDTMF(note.key, note.duration);
        } else if (note.rest) {
            await rest(note.rest);
        }
    }
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const songs_dir = path.join(__dirname, 'songs');

const get_song_files = (dir) => {
    try {
        const files = fs.readdirSync(dir);
        return files.map(file => path.join(dir, file));
    } catch (err) {
        console.log(`Error scanning directory: ${err}`)
        return [];
    } 
};

const build_choices = (list_of_song_files) => {
    let choices = [];
    list_of_song_files.forEach((song_file) => {
      const song_data = JSON.parse(fs.readFileSync(song_file, 'utf8'));
      choices.push({
        name: song_data.title,
        value: song_file,
        description: `Version: ${song_data.version}`
      });
    });
    return choices;
}

let song_files = get_song_files(songs_dir);
let song_choices = build_choices(song_files);

const answer = await select({
    message: 'Welcome to the Phreak Music Box. Pick a song below.',
    choices: song_choices, 
});

async function main() {
    const song = await loadSong(answer); // Specify the song file
    await playSong(song);
}

main();


