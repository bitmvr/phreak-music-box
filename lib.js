import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { AudioContext } from 'node-web-audio-api';
import { select } from '@inquirer/prompts';

export const loadSong = (filename) => {
    const data = fs.readFileSync(filename, { encoding: 'utf8' });
    return JSON.parse(data);
}

export function rest(duration) {
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
}

export const get_song_files = (dir) => {
    try {
        const files = fs.readdirSync(dir);
        return files.map(file => path.join(dir, file));
    } catch (err) {
        console.log(`Error scanning directory: ${err}`)
        return [];
    } 
}

export const build_choices = (list_of_song_files) => {
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

export async function dtmfOscillator(key, duration){
    let highFrequency = parseInt(config.keypad[key].hf);
    let lowFrequency = parseInt(config.keypad[key].lf);
    
    var audioCtx = new AudioContext();
    var oscillatorHigh = audioCtx.createOscillator();
    var oscillatorLow = audioCtx.createOscillator();
    
    oscillatorHigh.frequency.setValueAtTime(highFrequency, audioCtx.currentTime);
    oscillatorLow.frequency.setValueAtTime(lowFrequency, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(config.audioGain, audioCtx.currentTime);

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

export async function play(song) {
    for (const note of song.notes) {
        if (note.key) {
            await dtmfOscillator(note.key, note.duration);
        } else if (note.rest) {
            await rest(note.rest);
        }
    }
}

export const answer = await select({
    message: 'Welcome to the Phreak Music Box. Pick a song below.',
    choices: build_choices(get_song_files(config.songsDir)), 
});
