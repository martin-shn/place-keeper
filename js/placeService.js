'use strict';

//AIzaSyCjlsAsJI0Vd-wbFqIbs_zppWj9Txa2X2E
//https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap&libraries=&v=weekly

var map,
    infoWindow,
    gLocations,
    currLoc,
    gMarkers = [];
var myModal;
const EILAT = { lat: 29.55805, lng: 34.94821 };

function initMap() {
    let userPrefs = getUserPrefs();
    if (!userPrefs) gUserPrefs.userSet = false;
    changeUserPrefs();
    let timeStr = new Date().getHours() < 12 ? 'Morning' : 'Evening';

    document.querySelector('.sub-title').innerHTML = `Good ${timeStr} ${userPrefs.name}`;
    gLocations = JSON.parse(loadFromStorage('userLocs'));
    if (!gLocations) gLocations = [];
    myModal = new bootstrap.Modal(document.getElementById('add-new-location'), { backdrop: 'static' });

    renderLocs();

    initAutoComplete();

    addAllMarkers();
}

function saveLocFromModal(event) {
    event.preventDefault();

    let newLoc = addNewLoc(document.querySelector('#location-name').value, currLoc);
    console.log('newLoc : ', newLoc);

    _saveLocs();
    addMarker(currLoc, document.querySelector('#location-name').value, newLoc.id);
    document.querySelector('#location-name').value = '';
    myModal.hide();
    // myModal.dispose();

    let idx = gMarkers.findIndex((marker) => marker.id === 0);
    if (idx >= 0) {
        gMarkers[idx].marker.setMap(null);
        gMarkers.splice(idx, 1);
    }

    renderLocs();
}

function getNewLocation(loc, locName = '') {
    currLoc = { lat: loc.lat, lng: loc.lng };
    console.log('loc : ', loc);

    document.querySelector('.location-modal').innerText = `New location is: ${loc.lat}, ${loc.lng}`;
    if (locName) document.querySelector('#location-name').value = locName;

    document.getElementById('add-new-location').addEventListener('shown.bs.modal', function () {
        document.getElementById('location-name').focus();
    });

    myModal.show();
}

function addMarker(currLoc, content, id) {
    const marker = new google.maps.Marker({
        position: currLoc,
        map: map,
        content,
    });
    marker.addListener('click', function (event) {
        infoWindow = new google.maps.InfoWindow();
        infoWindow.setPosition(marker.position);
        infoWindow.setContent(marker.content);
        infoWindow.open(map);
    });
    gMarkers.push({ id, marker });
}

function addAllMarkers() {
    gLocations.forEach(function (loc) {
        return addMarker({ lat: loc.lat, lng: loc.lng }, loc.name, loc.id);
    });
}

function addNewLoc(locationName, currLoc) {
    gLocations.unshift({ id: getNewId(gLocations), lat: currLoc.lat, lng: currLoc.lng, name: locationName });
    return gLocations[0];
}

function showLoc(loc) {
    map.setCenter(loc);
    map.setZoom(16);
}

function getNewId(locations) {
    let existedLocs = locations.map(function (loc) {
        return loc.id;
    });
    existedLocs.sort();

    for (var i = 0; i <= existedLocs.length; i++) {
        if (existedLocs[i] === i + 100) continue;
        return i + 100;
    }
    //no more space
    return -1;
}

function _saveLocs() {
    saveToStorage('userLocs', JSON.stringify(gLocations));
}

function renderLocs() {
    var elList = document.querySelector('.map-list');
    var strHTML = gLocations
        .map(function (loc) {
            return `<div class="btn-group">
            <button type="button" class="btn btn-light ms-2 mb-2 w-60p" data-lat="${loc.lat}" data-lng="${loc.lng}" data-id="${loc.id}" onclick="showLoc({lat:${loc.lat},lng:${loc.lng}})">${loc.name}</button>
            <button type="button" class="btn btn-danger text-light mb-2 p-0 w-0" onclick="deleteLoc(${loc.id})"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
          </svg></button>
            </div>`;
        })
        .join('');
    elList.innerHTML = strHTML;
}

function deleteLoc(id) {
    let idx = gLocations.findIndex((loc) => loc.id === id);
    gLocations.splice(idx, 1);
    _saveLocs();
    renderLocs();

    //remove marker
    idx = gMarkers.findIndex((marker) => marker.id === id);
    gMarkers[idx].marker.setMap(null);
    gMarkers.splice(idx, 1);
}

function initAutoComplete() {
    //create the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 29.55805, lng: 34.94821 },
        zoom: 10,
        disableDefaultUI: true,
        gestureHandling: 'cooperative',
    });

    //create center btn
    const centerControlDiv = document.createElement('div');
    createCenterControl(centerControlDiv, map);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);

    //listner to catch user clicks on the map
    map.addListener('click', (mapsMouseEvent) => {
        let idx = gMarkers.findIndex((marker) => marker.id === 0);
        if (idx >= 0) {
            gMarkers[idx].marker.setMap(null);
            gMarkers.splice(idx, 1);
        }
        let loc = { lat: mapsMouseEvent.latLng.lat(), lng: mapsMouseEvent.latLng.lng() };
        getNewLocation(loc);
    });

    //create the search input
    const input = document.getElementById('pac-input');
    const autocomplete = new google.maps.places.Autocomplete(input);
    // autocomplete.bindTo('bounds', map);
    // Specify just the place data fields that you need.
    autocomplete.setFields(['place_id', 'geometry', 'formatted_address', 'name']);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({ map: map });
    marker.addListener('click', () => {
        infowindow.open(map, marker);
    });

    //working with autocomplete
    autocomplete.addListener('place_changed', () => {
        infowindow.close();
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        // Set the position of the marker using the place ID and location.
        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location,
        });
        marker.setVisible(true);

        // const infowindow = new google.maps.InfoWindow();
        infowindowContent.children.namedItem('place-name').textContent = place.name;
        // infowindow.children.namedItem('place-id').textContent = place.place_id;
        infowindowContent.children.namedItem('place-address').textContent = place.formatted_address;
        infowindow.open(map, marker);
        getNewLocation({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }, place.name + ', ' + place.formatted_address);
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : "Error: Your browser doesn't support geolocation.");
    infoWindow.open(map);
}

function createCenterControl(controlDiv, map) {
    // Set CSS for the control border.
    const controlUI = document.createElement('img');
    // const controlUI = controlDiv;
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '50%';
    controlUI.style.height = '100%';
    controlUI.style.width = '100%';
    controlDiv.style.height = '40px';
    controlDiv.style.width = '40px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlDiv.style.marginRight = '10px';
    controlDiv.style.marginBottom = '22px';
    // controlUI.style.textAlign = 'center';
    // controlUI.title = 'Click to recenter the map';
    controlUI.src = 'https://icon-library.com/images/my-location-icon/my-location-icon-22.jpg';
    // controlUI.style.backgroundImage = 'url("../img/myloc.png")';
    controlUI.style.backgroundSize = 'cover';
    controlDiv.appendChild(controlUI);
    // Set CSS for the control interior.
    // const controlText = document.createElement('div');
    // controlText.style.color = 'rgb(25,25,25)';
    // controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    // controlText.style.fontSize = '16px';
    // controlText.style.lineHeight = '38px';
    // controlText.style.paddingLeft = '5px';
    // controlText.style.paddingRight = '5px';
    // controlText.innerHTML = "Center Map";
    // controlUI.appendChild(controlText);
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', () => {
        let infoWindow = new google.maps.InfoWindow();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    let username = gUserPrefs.userSet ? gUserPrefs.name : 'Your';
                    infoWindow.setContent(`${username}'s location`);
                    infoWindow.open(map);
                    const marker = new google.maps.Marker({
                        position: pos,
                        map: map,
                    });
                    gMarkers.push({ id: 0, marker });

                    marker.addListener('click', function (event) {
                        // infoWindow = new google.maps.InfoWindow();
                        infoWindow.setPosition(marker.position);
                        // infoWindow.setContent('test');
                        infoWindow.open(map, marker);
                        
                        getNewLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() }, `${username}'s location`);
                    });
                    // new google.maps.event.trigger(marker, 'click');
                    map.setCenter(pos);
                    map.setZoom(16);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
}

function deleteAllData() {
    removeFromStorage('userLocs');
    location.reload();
}
