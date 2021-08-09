'use strict';
var gUserPrefs;

function onInit() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    document.querySelector('.prefs').addEventListener(
        'submit',
        function (event) {
            event.preventDefault();
            event.stopPropagation();
            saveForm();
        },
        false
    );

    _loadUserPrefs();
    document.querySelector('#name').value = gUserPrefs.userSet ? gUserPrefs.name : '';
    document.querySelector('#theme').value = gUserPrefs.theme;
    document.querySelector('#dob').value = gUserPrefs.dob;
    document.querySelector('#email').value = gUserPrefs.email;
    document.querySelector('#range').value = gUserPrefs.range;
    onChangeRng(gUserPrefs.range);
    changeUserPrefs();
}

function changeUserPrefs() {
    let els = document.querySelectorAll('.userPrefChangable');
    els.forEach(function (el) {
        el.style.color = gUserPrefs.theme;
    });
}

function getUserPrefs() {
    return _loadUserPrefs();
}

function _loadUserPrefs() {
    gUserPrefs = loadFromStorage('userPrefs');
    if (!gUserPrefs) {
        gUserPrefs = {
            userSet: false,
            name: 'Stranger, <a href="user-prefs.html" style="color:#b7901b">let\'s setup your prefs</a>',
            theme: '#ffc107',
            dob: '1980-01-01',
            email: '',
            range: '25',
        };
    }
    return gUserPrefs;
}

function onChangeRng(rng) {
    document.querySelector('.rng').innerText = rng;
}

function saveForm() {
    gUserPrefs = {
        userSet: true,
        name: document.querySelector('#name').value,
        theme: document.querySelector('#theme').value,
        dob: document.querySelector('#dob').value,
        email: document.querySelector('#email').value,
        range: document.querySelector('#range').value,
    };
    saveToStorage('userPrefs', gUserPrefs);
    document.querySelector('.saved-msg').classList.remove('hidden');
    setTimeout(() => {
        document.querySelector('.saved-msg').classList.add('hidden');
    }, 3000);

    location.reload();
}
