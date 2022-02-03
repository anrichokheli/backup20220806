const mainDiv = document.getElementById("main");
const uploadStatuses = document.getElementById("uploadstatuses");
const locationDiv = document.getElementById("location");
var strings = null;
function getString(key)  {
    if(strings!=null)return strings[key];
    return "";
}
function buttonSetup(id0) {
    const input = document.getElementById(id0 + "input");
    input.oninput = function(){
        fileUpload(null, input);
    };
    document.getElementById(id0 + "button").addEventListener("click", function(){
        input.click();
    });
}
buttonSetup("takephoto");
buttonSetup("recordvideo");
buttonSetup("choosephoto");
buttonSetup("choosevideo");
document.getElementById("buttons").style.opacity = "1";
var latitude;
var longitude;
var altitude;
var accuracy;
var altitudeAccuracy;
const locationTop = document.createElement("div");
locationTop.id = "locationtop";
locationDiv.appendChild(locationTop);
const locationImage = document.createElement("img");
locationImage.src = "images/location.svg";
locationImage.width = "32";
locationImage.height = "32";
locationTop.appendChild(locationImage);
const locationTitle = document.createElement("span");
locationTitle.id = "currentlocation";
locationTitle.style.fontSize = "20px";
locationTop.appendChild(locationTitle);
const locationData = document.createElement("div");
locationDiv.appendChild(locationData);
function addLocationElements(text)  {
    var div = document.createElement("div");
    div.className = "locationDivs";
    locationData.appendChild(div);
    var title = document.createElement("span");
    title.className = "locationTitles";
    title.innerText = ": ";
    var titleText = document.createElement("span");
    titleText.id = text;
    title.prepend(titleText);
    div.appendChild(title);
    var data = document.createElement("span");
    div.appendChild(data);
    return data;
}
function showLocation(element, data)    {
    if(data == null)    {
        data = getString("nodata");
        if(data=="")data="-";
        element.style.backgroundColor = "#ff000080";
    }
    else    {
        element.style.backgroundColor = "";
    }
    element.innerText = data;
}
const latitudeLongitudeData = addLocationElements("latitudelongitude");
const altitudeData = addLocationElements("altitude");
const accuracyData = addLocationElements("accuracy");
const altitudeAccuracyData = addLocationElements("altitudeaccuracy");
locationDiv.style.display = "block";
function getLocation()  {
    if(navigator.geolocation)    {
        navigator.geolocation.watchPosition(afterLocation, locationError);
    }
    else    {
        locationData.innerText = "Geolocation not supported by this browser.";
        locationDiv.style.backgroundColor = "#ff000080";
    }
}
function afterLocation(position)  {
    if(locationDiv.contains(locationErrorDiv))    {
        locationDiv.removeChild(locationErrorDiv);
    }
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    altitude = position.coords.altitude;
    accuracy = position.coords.accuracy;
    altitudeAccuracy = position.coords.altitudeAccuracy;
    showLocation(latitudeLongitudeData, latitude + ", " + longitude);
    showLocation(altitudeData, altitude);
    showLocation(accuracyData, accuracy);
    showLocation(altitudeAccuracyData, altitudeAccuracy);
}
const locationErrorDiv = document.createElement("div");
locationErrorDiv.style.border = "2px solid #ff0000";
function locationError(error)    {
    locationDiv.appendChild(locationErrorDiv);
    switch(error.code)   {
        case error.PERMISSION_DENIED:
            locationErrorDiv.innerText = "permission denied. to detect location,";
            locationErrorDiv.appendChild(document.createElement("br"));
            var button = document.createElement("button");
            button.innerText = "allow permission";
            button.addEventListener("click", function(){
                getLocation();
            });
            locationErrorDiv.appendChild(button);
            break;
        case error.POSITION_UNAVAILABLE:
            locationErrorDiv.innerText = "location unavailable";
            break;
        case error.TIMEOUT:
            locationErrorDiv.innerText = "request timed out";
            break;
        case error.UNKNOWN_ERROR:
            locationErrorDiv.innerText = "unknown error";
            break;
    }
}
getLocation();
function uploadString(n, key, post, location, value) {
    var ajax = new XMLHttpRequest();
    var text;
    if(location == true)    {
        text = strings["locationcoordinates"];
    }
    else    {
        text = strings["description"];
    }
    text += "; ";
    const element = document.getElementById('q'+n);
    var div = document.createElement("div");
    div.className = "statusText";
    div.innerText = text+getString("uploading");
    var color = "#ffff00";
    div.style.borderColor = color;
    var div2 = document.createElement("div");
    div2.innerText = value;
    var borderStyle = "1px dotted";
    div2.style.border = borderStyle;
    div2.borderColor = color;
    div.appendChild(div2);
    element.prepend(div);
    ajax.onload = function(){
        div = document.createElement("div");
        div.className = "statusText";
        if(this.responseText === "1")    {
            div.innerText = text + getString("uploadcompleted");
            color = "#00ff00";
        }
        else    {
            div.innerText = text + getString("uploadfiled");
            color = "#ff0000";
            if(!location)    {
                document.getElementById("b"+n).disabled = 0;
            }
            var div2 = document.createElement("div");
            div2.innerText = this.responseText;
            div2.style.border = borderStyle;
            div2.style.borderColor = color;
            div.appendChild(div2);
        }
        div.style.borderColor = color;
        element.prepend(div);
    };
    ajax.onerror = function(){
        div = document.createElement("div");
        div.className = "statusText";
        div.innerText = text + getString("uploaderror");
        color = "#ff0000";
        div.style.borderColor = color;
        if(!location)    {
            document.getElementById("b"+n).disabled = 0;
        }
        div2 = document.createElement("div");
        div2.innerText = this.Error;
        div2.style.border = borderStyle;
        div2.style.borderColor = color;
        div.appendChild(div2);
        element.prepend(div);
    };
    ajax.open("POST", "/");
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send("n="+n+"&key="+key+post);
}
function uploadLocation(n, key)   {
    uploadString(n, key, "&latitude="+latitude+"&longitude="+longitude+"&altitude="+altitude+"&accuracy="+accuracy+"&altitudeaccuracy="+altitudeAccuracy, true, latitude + ", " + longitude + "; " + altitude + "; " + accuracy + "; " + altitudeAccuracy);
}
function uploadDescription(n, key)    {
    var descriptionValue = document.getElementById(n).value;
    uploadString(n, key, "&description="+descriptionValue, false, descriptionValue);
}
function uploadVoice(n, key)  {
    const statusElement = document.getElementById('q'+n);
    const voiceinput = document.getElementById('v'+n);
    var div = document.createElement("div");
    div.className = "statusText";
    var text = "voice; ";
    div.innerText = text+getString("uploading");
    div.style.borderColor = "#ffff00";
    statusElement.prepend(div);
    var formData = new FormData();
    formData.append("voice", voiceinput.files[0]);
    formData.append("n", n);
    formData.append("key", key);
    fetch("/", {method: "POST", body: formData})
    .then(Response => Response.text())
    .then(Response => {
        div = document.createElement("div");
        div.className = "statusText";
        if(Response === "1")    {
            div.innerText = text+getString("uploadcompleted");
            div.style.borderColor = "#00ff00";
        }
        else    {
            div.innerText = text+getString("uploadfailed")+"\n(" + Response + ")";
            div.style.borderColor = "#ff0000";
        }
        statusElement.prepend(div);
    })
    .catch(Error => {
        div = document.createElement("div");
        div.className = "statusText";
        div.innerText = text+getString("uploaderror")+"\n(" + Error + ")";
        div.style.borderColor = "#ff0000";
        statusElement.prepend(div);
    });
}
var timeout1;
var timeout2;
function bottomProgressVisible(visible)    {
    if(visible)    {
        if(timeout1 != undefined)    {
            clearTimeout(timeout1);
        }
        if(timeout2 != undefined)    {
            clearTimeout(timeout2);
        }
        uploadStatusBottom.style.display = "flex";
        uploadStatusBottom.style.animation = "showbottom 0.5s forwards";
    }
    else    {
        timeout1 = setTimeout(function(){
            uploadStatusBottom.style.animation = "hidebottom 0.5s forwards";
            timeout2 = setTimeout(function(){uploadStatusBottom.style.display = "none";}, 500);
        }, 3000);
    }
}
function flexCenter(element) {
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.flexDirection = "column";
}
const uploadStatusBottom = document.getElementById("uploadstatusbottom");
const bottomProgressBar = document.createElement("div");
uploadStatusBottom.appendChild(bottomProgressBar);
var uploadstatusesdisplayed = 0;
const maxFileSize = 25000000;
const allowedFileExtensions = ["bmp", "gif", "x-icon", "jpeg", "png", "tiff", "webp", "x-msvideo", "mpeg", "ogg", "mp2t", "webm", "3gpp", "3gpp2", "mp4"];
function fileUpload(file, fileInput){
    if(file === null)  {
        file = fileInput.files[0];
    }
    if(file.size > maxFileSize)    {
        alert("maximum file size is " + (maxFileSize / 1000000) + "MB.");
        return;
    }
    var fileTypeArray = file.type.split('/');
    var fileType = fileTypeArray[0];
    var fileExtension = fileTypeArray[1];
    if(fileType != "image" && fileType != "video")    {
        alert("only images and videos are allowed.");
        return;
    }
    if(!allowedFileExtensions.includes(fileExtension))    {
        alert("allowed file extensions are: ." + allowedFileExtensions.join(", .") + ".");
        return;
    }
    unloadWarning = 1;
    const subbox = document.createElement("div");
    flexCenter(subbox);
    subbox.className = "boxs";
    uploadStatuses.prepend(subbox);
    const status = document.createElement("div");
    status.className = "uploadstatuses2 boxs";
    const statusDiv = document.createElement("div");
    status.appendChild(statusDiv);
    subbox.appendChild(status);
    var statusText = document.createElement("div");
    statusText.innerText = getString("uploading");
    statusDiv.appendChild(statusText);
    const progress = document.createElement("div");
    statusDiv.appendChild(progress);
    const progressBar0 = document.createElement("div");
    progressBar0.className = "progressbar0";
    statusDiv.appendChild(progressBar0);
    const progressBar = document.createElement("div");
    progressBar.className = "progressbar";
    progressBar0.appendChild(progressBar);
    var color = "#ffff00";
    statusDiv.className = "statusText";
    statusDiv.style.borderColor = color;
    if(!uploadstatusesdisplayed) {
        flexCenter(uploadStatuses);
        uploadstatusesdisplayed = 1;
    }
    statusText = document.createElement("div");
    bottomProgressBar.style.backgroundColor = color;
    bottomProgressBar.style.width = "0%";
    bottomProgressVisible(1);
    const after = document.createElement("div");
    after.classList.add("uploadstatuses2", "boxs");
    var formData = new FormData();
    formData.append("photovideo", file);
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        if(this.responseText.charAt(0) == '#')    {
            subbox.prepend(after);
            var responseArray = this.responseText.substring(1).split('|');
            var n = responseArray[0];
            var key = responseArray[1];
            var html = "#" + n + "<br>";
            html += "<button onclick=window.open(\"?" + n + "\") class=\"texts buttons afteruploadbuttons\"><img width=\"32\" height=\"32\" src=\"images/viewicon.svg\">&nbsp;"+strings["viewupload"]+"</button>";
            html += "<br><br><div class=\"descriptioninput\"><textarea id=\""+n+"\" class=\"texts\" rows=\"2\" cols=\"10\" placeholder=\""+strings["writedescription"]+"...\"></textarea></div>";
            html += "<div class=\"buttonsDivs\"><div><button id=\"b"+n+"\" class=\"texts buttons afteruploadbuttons\" disabled><img width=\"32\" height=\"32\" src=\"images/description.svg\">&nbsp;"+strings["uploaddescription"]+"</button></div>";
            html += "<div><input type=\"file\" accept=\"audio/*\" id=\"v"+n+"\" oninput=uploadVoice(\""+n+"\",\""+key+"\") hidden><button class=\"texts buttons afteruploadbuttons\" onclick=document.getElementById(\"v"+n+"\").click()><img width=\"32\" height=\"32\" src=\"images/microphone.svg\">&nbsp;"+strings["uploadvoice"]+"</button></div></div>";
            html += "<br><br><div id=\"q"+n+"\" class=\"uploadstatuses2 boxs\"></div>";
            after.innerHTML = html;
            var button = document.getElementById("b"+n);
            button.addEventListener("click", function(){
                button.disabled = 1;
                uploadDescription(n,key);
            });
            var textarea = document.getElementById(n);
            textarea.addEventListener("input", function(){
                button.disabled = textarea.value == '';
                textarea.style.height = "0";
                textarea.style.height = textarea.scrollHeight + "px";
            });
            statusText.innerText += getString("uploadcompleted")+"\n(#" + n + ")";
            color = "#00ff00";
            bottomProgressVisible(0);
            if(latitude != null && longitude != null)    {
                uploadLocation(n, key);
            }
        }
        else    {
            statusText.innerText += getString("uploadfiled")+"\n(" + this.responseText + ")";
            color = "#ff0000";
            bottomProgressVisible(0);
        }
        if(fileInput !== undefined)fileInput.value = null;
        statusText.className = "statusText";
        statusText.style.borderColor = color;
        bottomProgressBar.style.backgroundColor = color;
        status.prepend(statusText);
    };
    ajax.onerror = function(){
        statusText.innerText += getString("uploaderror")+"\n(" + this.Error + ")";
        statusText.className = "statusText";
        color = "#ff0000";
        statusText.style.borderColor = color;
        bottomProgressBar.style.backgroundColor = color;
        bottomProgressVisible(0);
        status.prepend(statusText);
    };
    var progressPercent;
    ajax.upload.onprogress = function(e){
        progressPercent = ((e.loaded / e.total) * 100).toFixed(2) + '%';
        progress.innerText = progressPercent + " (" + e.loaded + " / " + e.total + ")";
        progressBar.style.width = progressPercent;
        bottomProgressBar.style.width = progressPercent;
    };
    ajax.open("POST", "/");
    ajax.send(formData);
}
var darkModeEnabled;
function setDarkMode(enabled) {
    var color = "#000000";
    var backgroundColor = "#ffffff";
    if(enabled)    {
        var temp = color;
        color = backgroundColor;
        backgroundColor = temp;
        document.documentElement.style.colorScheme = "dark";
    }
    else    {
        document.documentElement.style.colorScheme = "light";
    }
    mainDiv.style.backgroundColor = backgroundColor;
    var elements = document.getElementsByClassName("texts");
    for(var i = 0; i < elements.length; i++)   {
        elements[i].style.color = color;
    }
    darkModeEnabled = enabled;
}
const matchmedia = window.matchMedia("(prefers-color-scheme: dark)");
function defaultdarkmode()  {
    setDarkMode(matchmedia.matches);
    matchmedia.onchange = function(e){setDarkMode(e.matches)};
}
if(localStorage.getItem("darkmode") == null)    {
    defaultdarkmode();
}
else    {
    setDarkMode(localStorage.getItem("darkmode")=="true");
    matchmedia.onchange=function(){};
}
var unloadWarning = 0;
window.addEventListener("beforeunload", function(e){
    if(unloadWarning)    {
        e.preventDefault();
        e.returnValue = '';
    }
});
const dragOverlay = document.getElementById("dragoverlay");
var uploadImageDiv = document.createElement("div");
uploadImageDiv.style.width = "50%";
uploadImageDiv.style.height = "50%";
uploadImageDiv.style.backgroundImage = "url(images/uploadicon.svg)";
uploadImageDiv.style.backgroundRepeat = "no-repeat";
uploadImageDiv.style.backgroundPosition = "center";
uploadImageDiv.style.backgroundSize = "contain";
uploadImageDiv.style.backgroundColor = "#ffffff80";
uploadImageDiv.style.borderRadius = "8px";
dragOverlay.appendChild(uploadImageDiv);
const dragOverlay2 = document.createElement("div");
dragOverlay2.className = "overlay";
dragOverlay.appendChild(dragOverlay2);
dragOverlay2.addEventListener("dragover", function(e){
    e.preventDefault();
});
dragOverlay2.addEventListener("drop", function(e){
    e.preventDefault();
    fileUpload(e.dataTransfer.items[0].getAsFile());
    dragOverlay.style.display = "none";
});
mainDiv.addEventListener("dragenter", function(e){
    if(e.dataTransfer.items[0].kind == "file")    {
        dragOverlay.style.display = "flex";
    }
});
dragOverlay2.addEventListener("dragleave", function(){
    dragOverlay.style.display = "none";
});
const openFullScreenButton = document.createElement("button");
openFullScreenButton.innerText = "open fullscreen";
openFullScreenButton.addEventListener("click", function(){document.documentElement.requestFullscreen();});
mainDiv.appendChild(openFullScreenButton);
const closeFullScreenButton = document.createElement("button");
closeFullScreenButton.innerText = "close fullscreen";
closeFullScreenButton.addEventListener("click", function(){document.exitFullscreen();});
mainDiv.appendChild(closeFullScreenButton);
const bottomSpace = document.createElement("div");
bottomSpace.style.height = "25vh";
mainDiv.appendChild(bottomSpace);
function translateHTML(html){
    for(var key in strings) {
        html = html.replaceAll("<string>"+key+"</string>", strings[key]);
    }
    return html;
}
const settingsWindowOverlay = document.getElementById("settingswindowoverlay");
settingsWindowOverlay.addEventListener("click", function(e){
    if((e.target != settingsWindowOverlay) && (e.target.id != "settingsclosewindow")){
        return;
    }
    this.style.display = "none";
});
const settingsWindow = document.getElementById("settingswindow");
function setWindowDarkMode(windowOverlay, windowDiv){
    if(darkModeEnabled){
        windowOverlay.style.backgroundColor = "#ffffff80";
        windowDiv.style.backgroundColor = "#000000";
    }
    else{
        windowOverlay.style.backgroundColor = "#00000080";
        windowDiv.style.backgroundColor = "#ffffff";
    }
}
function openWindow(windowOverlay, windowDiv, content){
    setWindowDarkMode(windowOverlay, windowDiv);
    windowDiv.innerHTML = content;
    windowOverlay.style.display = "flex";
}
document.getElementById("settingsbutton").addEventListener("click", function(){
    if(settingsWindow.innerHTML != '')    {
        settingsWindowOverlay.style.display = "flex";
        return;
    }
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "html/settings.html");
    ajax.onload = function(){
        openWindow(settingsWindowOverlay, settingsWindow, translateHTML(this.responseText));
        var script = document.createElement("script");
        script.src = "scripts/settings.js";
        settingsWindow.appendChild(script);
    };
    ajax.send();
});
function setLanguage(lang)  {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "json/languages/" + lang + ".json");
    ajax.onload = function()    {
        if(this.status == 200){
            localStorage.setItem("lang", lang);
            document.documentElement.lang = lang;
            var json = JSON.parse(this.responseText);
            strings = json;
            var element;
            for(var key in json) {
                element = document.getElementById(key);
                if(element!=null)element.innerText = json[key];
            }
            if(typeof settingsTitle!=="undefined")settingsTitle.innerHTML = strings["settings"];
            document.title = strings["title"];
        }
        else{
            lang = "en";
            setLanguage(lang);
        }
    };
    ajax.send();
}
var lang = localStorage.getItem("lang");
if(lang == null){
    lang = navigator.language.substring(0, 2);
}
var getlang = (new URL(window.location.href)).searchParams.get("lang");
if(getlang != null)    {
    lang = getlang;
}
setLanguage(lang);