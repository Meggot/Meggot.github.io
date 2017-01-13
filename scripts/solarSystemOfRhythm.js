var width = 1000;
var height = 1000;

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var listener = audioContext.listener;
var gainNode = audioContext.createGain();
gainNode.gain.value = 0
listener.setOrientation(0, width / 2, 0, 0, 1, 0);
listener.setPosition(width / 2, height / 2, 0);
var planetWrapper = [];
var orbitPairs = [];
var planetPoints = [];
var lastPlanetId = 0;
var lastOrbitId = 0;
var orbitActive = false;
var trailActive = false;
var gridLines = true;
theCanvas = document.getElementById("canvasOne");
context = theCanvas.getContext("2d");
var mute = document.getElementById("mute");
var checkBox = document.getElementById("parentCheckbox");
checkBox.checked = false;

function muteAll() {
    if (mute.id == "mute") {
        gainNode.gain.value = 1;
        mute.id = "activated";
        mute.innerHTML = "Unmuted";
    } else {
        gainNode.gain.value = 0;
        mute.id = "mute";
        mute.innerHTML = "Muted";
    }
}

function activeTrailCheckbox() {
    trailActive = !trailActive;
    drawScreen();
}

function activeGridLinesCheckbox()
{
    gridLines = !gridLines;
    drawScreen();
}

function ungreyParentDropdown()
{
    var checkBox = document.getElementById("parentCheckbox");
    var planetDropdown = document.getElementById("orbitParent");
    if (checkBox.checked && planetDropdown.length >= 1)
    {
        planetDropdown.disabled = false;
    } else
    {
        planetDropdown.disabled = true;
    }

}

function addPlanet(type, id, periapsis, panner, oscillator, velocity, isOrbitingPlanet)
{
    var radius = periapsis;
    if (periapsis <= radius && oscillator != null)
    {
        pastpoints = [];
        var newPlanet = {soundType: type, oscilator: oscillator, playing: false, id: id, pastPoints: pastpoints, xCoord: width / 2, yCoord: height / 2, speed: velocity, soundSource: panner, isOrbitingPlanet: isOrbitingPlanet, radius: radius, angle: 0};
        planetWrapper[lastPlanetId] = newPlanet;
    }

}

function addOrbitPairing(orbitPlanetId, orbiterPlanetId)
{
    var orbitID = lastOrbitId++;
    var newOrbit = {orbitId: orbitID, orbitPlanetId: orbitPlanetId, orbiterPlanetId: orbiterPlanetId};
    orbitPairs[orbitID] = newOrbit;
    console.log("Added orbitPairs!: " + orbitID + " linking: " + orbitPlanetId + " with " + orbiterPlanetId);
}

function startOrbiter() {
    if (!orbitActive)
    {
        for (var i = 0; i > planetWrapper.length; i++)
        {
            planetWrapper[i].oscilator.mute = true;
        }
        audioContext.resume();
        orbitActive = true;
        window.myInterval = setInterval(drawScreen, 0.1);
    }
}

function stopOrbiter() {
    if (orbitActive)
    {
        audioContext.suspend();
        orbitActive = false;
        window.clearInterval(window.myInterval);
    }
}

function drawGridLines() {
    context.beginPath();
    context.moveTo(width / 2, 0);
    context.lineTo(width / 2, height / 2);
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.moveTo(width / 2, height / 2);
    context.lineTo(width / 2, height);
    context.stroke();
}

function  drawScreen() {
    context.fillStyle = '#EEEEEE';
    context.fillRect(0, 0, theCanvas.width, theCanvas.height);
    context.strokeStyle = '#000000';
    context.strokeRect(1, 1, theCanvas.width - 2, theCanvas.height - 2);
    if (gridLines)
    {
        drawGridLines();
    }
    context.strokeStyle = '#FF0000';
    for (var i = 0; i < planetWrapper.length; i++)
    {
        var planetPointer = planetWrapper[i];
        var orbitCenterX = width / 2;
        var orbitCenterY = height / 2;
        if (planetPointer.isOrbitingPlanet)
        {
            for (var x = 0; x < orbitPairs.length; x++)
            {
                if (orbitPairs[x].orbiterPlanetId === planetPointer.id)
                {
                    orbitCenterX = planetWrapper[orbitPairs[x].orbitPlanetId].xCoord;
                    orbitCenterY = planetWrapper[orbitPairs[x].orbitPlanetId].yCoord;
                }
            }
        }
        planetPointer.xCoord = orbitCenterX + Math.cos(planetPointer.angle) * planetPointer.radius;
        planetPointer.yCoord = orbitCenterY + Math.sin(planetPointer.angle) * planetPointer.radius;
        planetPointer.pastPoints[planetPointer.pastPoints.length] = [planetPointer.xCoord, planetPointer.yCoord];
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(planetPointer.xCoord, planetPointer.yCoord, 5, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        if (trailActive)
        {
            renderTrail(planetPointer.pastPoints);
        }
        if (planetPointer.soundType === "oscillator")
        {
            var normalizedValue = Math.cos(planetPointer.angle);
            planetPointer.soundSource.pan.value = (normalizedValue);
            var frequency = 150 + ((planetPointer.radius / (width / 2)) * 200);
            if (planetPointer.isOrbitingPlanet)
            {
                frequency = Math.sqrt(Math.pow((width / 2 - height / 2), 2) + Math.pow((planetPointer.xCoord - planetPointer.yCoord), 2));
                frequency = frequency / 3;
                console.log("Planet: " + planetPointer.id + ", Frequency: " + frequency);
            }
            planetPointer.oscilator.frequency.value = frequency;
        } else if (planetPointer.soundType === "strike" && planetPointer.yCoord > 250)
        {
            planetPointer.soundSource.play();
        }
        if (orbitActive)
        {
            planetPointer.angle += planetPointer.speed / 7;
        }
    }

}

function renderTrail(pts) {
    context.fillStyle = "#FF0000";
    if (pts.length > 1) {
        context.beginPath();
        context.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1, pt; pt = pts[i]; i++) {
            //c.arc(pt[0], pt[1], 5, 0, Math.PI, true);
            context.lineTo(pt[0], pt[1]);
            //context.arc(pt[0], pt[1], 5, 0, Math.PI * 2, true)
        }
        context.stroke();
        context.closePath();
        pts = [];
    }
}


function addPlanetButton() {

    var newPeriapsis = document.getElementById("periapsis").value;
    var speed = document.getElementById("speed").value;
    var waveDropdown = document.getElementById("waveDropdown");
    var srcRadio = document.getElementById("musicSource");

    var soundSource;
    var soundPanner;
    var soundType = srcRadio.musicRadioButton.value;

    console.log(soundType);
    if (soundType == "strike")
    {
        console.log("Striking!");
        var soundSourceDropdown = document.getElementById("musicFileSource");
        var fileBuffer = null;
        var fileUrl = "../static/ShortBleep1.mp3";
        //if (soundSourceDropdown.selectedIndex == 0)
        function loadMP3File(url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';

            // Decode asynchronously
            request.onload = function () {
                context.decodeAudioData(request.response, function (buffer) {
                    fileBuffer = buffer;
                }, onError);
            }
            request.send();
        }
        loadMP3File(fileUrl);
        soundSource = audioContext.createBufferSource();
        soundSource.buffer = fileBuffer;
        soundSource.connect(audioContext.destination);
        soundSource.start();
        soundPanner = null;
    } else if (soundType == "oscillator")
    {
        soundType = "oscillator";
        var frequency = 0;
        var oscillator = audioContext.createOscillator();
        oscillator.frequency.value = frequency;
        var stereoPanner = audioContext.createStereoPanner();
        if (waveDropdown.selectedIndex == 0)
        {
            oscillator.type = 'sine';
        } else if (waveDropdown.selectedIndex == 1)
        {
            oscillator.type = 'sawtooth';
        } else if (waveDropdown.selectedIndex == 2)
        {
            oscillator.type = 'square';
        } else if (waveDropdown.selectedIndex == 3)
        {
            oscillator.type = 'triangle';
        }
        soundSource = oscillator;
        soundPanner = stereoPanner;
        soundSource.start();
        soundSource.connect(soundPanner);
        soundPanner.connect(audioContext.destination);
    }

    var checkBox = document.getElementById("parentCheckbox");
    var planetDropdown = document.getElementById("orbitParent");
    var isOrbiting = false;
    var id = lastPlanetId;
    var consoleLogOutput = "Added a new planet: " + id + ", that has a periapsis of: " + newPeriapsis + ", a velocity of " + speed / 100;
    if (checkBox.checked)
    {
        console.log(planetDropdown.selectedIndex);
        console.log(planetWrapper)
        var orbitingParentId = planetWrapper[planetDropdown.selectedIndex].id;
        console.log("Adding orbit Pair!");
        addOrbitPairing(orbitingParentId, id);
        consoleLogOutput = consoleLogOutput + ". This planet is orbiting planet " + orbitingParentId;
        isOrbiting = true;
    }
    var orbitParentDropdown = document.getElementById("orbitParent");
    var opt = document.createElement('option');
    opt.value = id;
    opt.innerHTML = "Planet: " + id;
    orbitParentDropdown.appendChild(opt);
    addPlanet(soundType, id, newPeriapsis, soundPanner, soundSource, speed / 100, isOrbiting);
    drawScreen();
    lastPlanetId++;
}

function clearAllPlanets() {
    lastPlanetId = 0;
    lastOrbitId = 0;
    planetWrapper = [];
    audioContext.close();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    listener = audioContext.listener;
    gainNode = audioContext.createGain();
    var checkBox = document.getElementById("parentCheckbox");
    var planetDropdown = document.getElementById("orbitParent");
    checkBox.checked = false;
    planetDropdown.disabled = true;
    ungreyParentDropdown();
    drawScreen();

    if (mute.id == "mute") {
        gainNode.gain.value = 0;
        mute.id = "mute";
        mute.innerHTML = "Muted";
    } else {
        gainNode.gain.value = 1;
        mute.id = "activated";
        mute.innerHTML = "Unmuted";
    }

    var planetSelectBox = document.getElementById("orbitParent");
    for (i = planetSelectBox.options.length - 1; i >= 0; i--)
    {
        planetSelectBox.remove(i);
    }
}

function outputPeriapsisUpdate(vol) {
    document.querySelector('#periapsisTell').value = vol;
}

function outputFrequencyUpdate(freq) {
    document.querySelector('#frequencyTell').value = freq;
}

function outputSpeedUpdate(speed) {
    document.querySelector('#speedTell').value = speed;
}