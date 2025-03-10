#!/usr/bin/env node

import { loadSong, play, answer } from './lib.js';

async function main() {
    const song = await loadSong(answer);
    await play(song);
}

main();
