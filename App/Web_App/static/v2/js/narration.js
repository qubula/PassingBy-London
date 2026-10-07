// Alfie narration files available to v2, keyed by landmark name.
// Files live in /static/v2/audio/narration/. Landmarks without a file are read
// out by the phone's built-in voice instead (see playStory in tour_logic.js).
//
// To add more: copy the MP3s made by App/generate_narration.py into
// static/v2/audio/narration/ and add a line here.
window.NARRATION = {
    'London Eye': 'london-eye.mp3',
    'Buckingham Palace': 'buckingham-palace.mp3',
    'Tower Bridge': 'tower-bridge.mp3'
};
