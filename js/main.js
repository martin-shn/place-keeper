'use strict';

const SPACE = '&nbsp';

let gHoroscopes = ["Don't listen to what they say. Go see.", 'Take only memories, leave only footprints', 'Not all those who wander are lost', 'Life is either a daring adventure or nothing at all', 'Twenty years from now you will be more disappointed by the things you didn’t do than by the ones you did do'];

function onIndexInit() {
    let userPrefs = _loadUserPrefs();
    changeUserPrefs();
    buildAnimatin();
}

function buildAnimatin() {
    let elAnimate = document.querySelector('.animate');
    let quote = gHoroscopes[parseInt(Math.random() * gHoroscopes.length)];
    let wordsCount = quote.split(' ').length;
    let strHTML = '<nobr>';
    strHTML += quote
        .split('')
        .map(function (letter, idx) {
            if (letter === ' ') {
                return `</nobr>${SPACE}<nobr>`;
            }
            return `<span style="animation-delay:${(0.05 * idx).toFixed(2)}s">${letter}</span>`;
        })
        .join('');
    strHTML += '</nobr>';
    elAnimate.innerHTML = strHTML;
    elAnimate.classList.add('three');
}
