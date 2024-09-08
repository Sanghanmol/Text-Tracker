const textarea = document.getElementById('textarea');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const replayButton = document.getElementById('replayButton');
const pauseButton = document.getElementById('pauseButton');
const speedControl = document.getElementById('speedControl');
const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const themeButton = document.getElementById('themeButton');

let isRecording = false;
let isReplaying = false;
let events = [];
let startTime, replayIndex = 0, replayTimeout;
let replaySpeed = 1;

function startRecording() {
    isRecording = true;
    startTime = new Date().getTime();
    events = [];
    toggleButtons('start');
}

function stopRecording() {
    isRecording = false;
    toggleButtons('stop');
}

function toggleButtons(state) {
    if (state === 'start') {
        startButton.disabled = true;
        stopButton.disabled = false;
        replayButton.disabled = true;
        pauseButton.disabled = true;
    } else if (state === 'stop') {
        startButton.disabled = false;
        stopButton.disabled = true;
        replayButton.disabled = false;
        pauseButton.disabled = true;
    } else if (state === 'replay') {
        replayButton.disabled = true;
        pauseButton.disabled = false;
    } else if (state === 'pause') {
        replayButton.disabled = false;
        pauseButton.disabled = true;
    }
}

function replayRecording() {
    replayIndex = 0;
    isReplaying = true;
    textarea.value = '';
    toggleButtons('replay');
    replayNextEvent();
}

function pauseReplay() {
    isReplaying = false;
    clearTimeout(replayTimeout);
    toggleButtons('pause');
}

function replayNextEvent() {
    if (replayIndex >= events.length || !isReplaying) return;
    const event = events[replayIndex++];
    textarea.value = event.text;
    textarea.setSelectionRange(event.cursorStart, event.cursorEnd);
    replayTimeout = setTimeout(replayNextEvent, (events[replayIndex]?.timestamp - event.timestamp) / replaySpeed);
}

textarea.addEventListener('input', () => {
    if (isRecording) {
        const timestamp = new Date().getTime() - startTime;
        const cursorStart = textarea.selectionStart;
        const cursorEnd = textarea.selectionEnd;
        events.push({ text: textarea.value, timestamp, cursorStart, cursorEnd });
    }
});

speedControl.addEventListener('change', () => {
    replaySpeed = parseFloat(speedControl.value);
});

saveButton.addEventListener('click', () => {
    const recordingName = prompt("Enter a name for this recording:");
    if (!recordingName) return;
    const recordings = JSON.parse(localStorage.getItem('recordings')) || {};
    recordings[recordingName] = events;
    localStorage.setItem('recordings', JSON.stringify(recordings));
    alert('Recording saved with name: ' + recordingName);
});

loadButton.addEventListener('click', () => {
    const recordings = JSON.parse(localStorage.getItem('recordings'));
    if (!recordings) {
        alert('No recordings found.');
        return;
    }
    const recordingNames = Object.keys(recordings);
    const selectedRecordingName = prompt('Enter the name of the recording to load:\n' + recordingNames.join(', '));
    if (selectedRecordingName && recordings[selectedRecordingName]) {
        events = recordings[selectedRecordingName];
        alert('Recording loaded: ' + selectedRecordingName);
    } else {
        alert('Recording not found.');
    }
});

themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

window.onload = function () {
    const recordings = JSON.parse(localStorage.getItem('recordings'));
    if (recordings && Object.keys(recordings).length > 0) {
        replayButton.disabled = false;
    } else {
        replayButton.disabled = true;
    }
};

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'r') startRecording();
    if (event.ctrlKey && event.key === 's') stopRecording();
    if (event.ctrlKey && event.key === 'p') pauseReplay();
});

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
replayButton.addEventListener('click', replayRecording);
pauseButton.addEventListener('click', pauseReplay);