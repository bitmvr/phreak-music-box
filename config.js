import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const config = {
    songsDir: path.join(__dirname, 'songs'),
    audioGain: 0.1,
    keypad: {
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
}
