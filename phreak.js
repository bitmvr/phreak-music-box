#!/usr/bin/env node

const { AudioContext } = require("node-web-audio-api");
const fs = require('fs/promises');

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
    highFrequency = parseInt(dtmf[key].hf);
    lowFrequency = parseInt(dtmf[key].lf);
    
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

async function loadSong(fileName) {
    const data = await fs.readFile(fileName, 'utf8');
    return JSON.parse(data);
}

async function playSong(song) {
    for (const note of song) {
        if (note.key) {
            await playDTMF(note.key, note.duration);
        } else if (note.rest) {
            await rest(note.rest);
        }
    }
}

async function main() {
    const song = await loadSong('./songs/song_02.json'); // Specify the song file
    await playSong(song);
}

main();


