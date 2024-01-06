// COMP3322 Assignment 2

var latitude;
var longitude;
var suburb = 'Unknown';
var district = 'Unknown';
var districtRainfall = {};
var districtTemperature = {};
var weatherStations = {};
var airQualityStations = {};
var airQualityStationsLocations = {};
var nineDayForecast = {};

// constant - Earth radius
const R = 6371;
const daysOfForecast = 9;

function getCurrentWeatherData() {
    // before loading the webpage. extract the required data from the current weather report
    fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en')
    .then(response => {
        if (response.status == 200) {
            response.json().then(WR => {
                var iconid = WR.icon[0];
                var weatherIcon = document.querySelector('#headerweather>img');
                weatherIcon.setAttribute('src', `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${iconid}.png`);
                var temperature = WR.temperature.data[1].value;
                var temperatureDegree = document.querySelector('#headerweather>div>span.degree');
                temperatureDegree.innerText = `${temperature}`;
                var temperatureCelsius = document.querySelector('.celsius')
                temperatureCelsius.innerText = 'ºC';
                var humidity = WR.humidity.data[0].value;
                var humidityValue = document.querySelector('#headerweather>div>span#humidityValue');
                humidityValue.innerText = `${humidity}`;
                var rainDropIcon = document.querySelector('#rainDropImg');
                rainDropIcon.setAttribute('src', 'images/drop-64.png');
                var rainfall = WR.rainfall.data[13].max;
                var rainfallValue = document.querySelector('.rainfallValue');
                rainfallValue.innerText = `${rainfall}`;
                var umbrellaIcon = document.querySelector('#headerBlockUmbrella');
                umbrellaIcon.setAttribute('src', 'images/rain-48.png');
                var uvindex = null;
                if (WR.uvindex.data !== undefined) {
                    uvindex = WR.uvindex.data[0].value;
                    var uvindexSpan = document.querySelector('#uvIndexValue');
                    uvindexSpan.innerText = uvindex;
                    var uvImg = document.querySelector('#uvImg');
                    uvImg.setAttribute('src', 'images/UVIndex-48.png');
                }
                else {
                    var uvIndexDiv = document.querySelector('#uvindex');
                    uvIndexDiv.style.display = 'none';
                }
                var time = WR.updateTime.slice(11, 16);
                var lastUpdate = `Last Update: ${time}`;
                var lastUpdateText = document.getElementById('lastUpdate');
                lastUpdateText.innerText = lastUpdate;
                var warningsButton = document.querySelector('#warningsButton');
                if ((WR.warningMessage !== undefined) && (WR.warningMessage != '')) {
                    var warningsButtonText = document.querySelector('#warningsButton>span');
                    warningsButtonText.innerText = 'Warning';
                    var warningsMessage = document.querySelector('#warningsButton>p');
                    warningsButton.addEventListener('click', () => {
                        if (warningsMessage.innerText == '') {
                            warningsButton.style.width = '100%';
                            lastUpdateText.innerText = '';
                            warningsMessage.style.display = 'inline';
                            warningsMessage.innerHTML = `<br> ${WR.warningMessage}`
                            warningsButton.classList.add('warningMessageShowed');
                        }
                        else {
                            warningsButton.style.width = 'auto';
                            lastUpdateText.innerText = lastUpdate;
                            warningsMessage.style.display = 'none';
                            warningsMessage.innerHTML = '';
                            warningsButton.classList.remove('warningMessageShowed');
                        }
                    })
                }
                else {
                    warningsButton.style.display = 'none';
                }
                var headerBlock = document.querySelector('#headerBlock');
                // depending on weather conditions and time, set different background image
                var isRaining = (rainfall > 0)
                var isDaytime = (uvindex !== null);
                if (isDaytime) {
                    headerBlock.style.backgroundImage = isRaining ? 'url(images/water-drops-glass-day.jpg)' : 'url(images/blue-sky.jpg)';
                }
                else {
                    headerBlock.style.backgroundImage = isRaining ? 'url(images/water-drops-glass-night.jpg)' : 'url(images/night-sky.jpg)';
                    var headerBlockTexts = document.getElementsByClassName('headerBlockText');
                    for (var i=0; i < headerBlockTexts.length; i++) {
                        headerBlockTexts[i].style.color = 'white';
                    }
                }
                // after getting the rainfall data, generate the district dropdown menu
                districtRainfall = WR.rainfall.data;
                var districtDropdownOptions = '';
                var districts = [];
                for (var i = 0; i < Object.keys(districtRainfall).length; i++) {
                    districts.push(districtRainfall[i].place);
                }
                districts.sort();
                districtDropdownOptions += '<option value="-1"></option>';
                for (var i = 0; i < Object.keys(districtRainfall).length; i++) {
                    districtDropdownOptions += `<option value="${i}">${districts[i]}</option>`;
                }
                districtDropdown.innerHTML = districtDropdownOptions;
                districtDropdown.addEventListener('change', (evt) => {
                    let selectedDistrict = districts[districtDropdown.value];
                    var rainfallDiv = document.querySelector('select+div.rainfall');
                    if (selectedDistrict !== undefined) {
                        for (var i = 0; i < Object.keys(districtRainfall).length; i++) {
                            if (selectedDistrict == districtRainfall[i].place) {
                                rainfallDiv.style.visibility = 'visible';
                                var rainfallValue = document.querySelector('select+div.rainfall>span.rainfallValue');
                                rainfallValue.innerText = districtRainfall[i].max;
                            }
                        }
                    }
                    else {
                        rainfallDiv.style.visibility = 'hidden';
                    }
                });
                // after getting the temperature data, generate the location dropdown menu
                districtTemperature = WR.temperature.data;
                var locationDropdownOptions = '';
                var locations = [];
                for (var i = 0; i < Object.keys(districtTemperature).length; i++) {
                    locations.push(districtTemperature[i].place);
                }
                locations.sort();
                locationDropdownOptions += '<option value="-1"></option>';
                for (var i = 0; i < Object.keys(districtTemperature).length; i++) {
                    locationDropdownOptions += `<option value="${i}">${locations[i]}</option>`;
                }
                locationDropdown.innerHTML = locationDropdownOptions;
                locationDropdown.addEventListener('change', (evt) => {
                    let selectedLocation = locations[locationDropdown.value];
                    var temperatureDiv = document.querySelector('select+div.temperature');
                    if (selectedLocation !== undefined) {
                        for (var i = 0; i < Object.keys(districtTemperature).length; i++) {
                            if (selectedLocation == districtTemperature[i].place) {
                                temperatureDiv.style.visibility = 'visible';
                                var temperatureDegree = document.querySelector('select+div.temperature>span.degree');
                                temperatureDegree.innerText = districtTemperature[i].value;
                            }
                        }
                    }
                    else {
                        temperatureDiv.style.visibility = 'hidden';
                    }
                })
                }
            );
        }
        else {
            var statusCode = response.status;
            console.log(`The current weather API returned status code ${statusCode}`);
        }
    });
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            // given the latitude and longitude, get the openstreetmap details
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
            .then(response => {
                if (response.status == 200) {
                    response.clone().json().then(GC => {
                        // get suburb
                        if (GC.address.suburb) {
                            suburb = GC.address.suburb;
                        }
                        else if (GC.address.borough) {
                            suburb = GC.address.borough;
                        }
                        else if (GC.address.town) {
                            suburb = GC.address.town;
                        }
                        // get district
                        if (GC.address['city_district']) {
                            district = GC.address['city_district'];
                        }
                        else if (GC.address.city) {
                            district = GC.address.city;
                        }
                        // get the attr contains "District"
                        else {
                            for (let attr in GC.address) {
                                const regex = /.*district.*/gi;
                                var match = regex.exec(attr);
                                if (match) {
                                    district = match[0];
                                    break;
                                }
                            }
                        }
                        // update the text in the myData block
                        var currentLocation = document.getElementById('currentLocation');
                        currentLocation.innerText = `${suburb}, ${district}`;
                        currentLocation.style.visibility = 'visible';
                        // from the district, obtain the rainfall data
                        const regex = / *district/gi;
                        var districtModified = district.replace(regex, '').replaceAll('and', '&');
                        for(var i = 0; i < Object.keys(districtRainfall).length; i++) {
                            if (districtRainfall[i].place.includes(districtModified)) {
                                var currentRainfall = districtRainfall[i].max;
                                var rainfallValue = document.querySelector('#myRainfallValue');
                                rainfallValue.innerText = currentRainfall;
                                break;
                            }
                        }
                        // use the latitude and longitude to determine the closest weather station
                        var φ1 = convertDegtoRad(latitude);
                        var λ1 = convertDegtoRad(longitude);
                        var minDistance = Infinity;
                        var closestWeatherStation = null;
                        for (var i = 0; i < Object.keys(weatherStations).length; i++) {
                            if (i == 14) {continue;} // Shek Kong
                            var stationLatitude = weatherStations[i].latitude;
                            var stationLongitude = weatherStations[i].longitude;
                            var φ2 = convertDegtoRad(stationLatitude);
                            var λ2 = convertDegtoRad(stationLongitude);
                            var x = (λ2-λ1) * Math.cos((φ1+φ2)/2);
                            var y = (φ2-φ1);
                            var distToWeatherStation = Math.sqrt(x*x + y*y) * R;
                            if (distToWeatherStation < minDistance) {
                                minDistance = distToWeatherStation;
                                closestWeatherStation = weatherStations[i]['station_name_en'];
                            }
                        }
                        // from the closest weather station, determine its temperature and update the entry
                        var currentTemperature = null;
                        for (let i = 0; i < Object.keys(districtTemperature).length; i++) {
                            if (closestWeatherStation == 'Tsuen Wan') {
                                currentTemperature = districtTemperature[13].value;
                                break;
                            }
                            else if (closestWeatherStation == districtTemperature[i].place) {
                                currentTemperature = districtTemperature[i].value;
                                break;
                            }
                        }
                        var myLocationTemperature = document.querySelector('#myDataWeather>div>span.degree');
                        myLocationTemperature.innerText = currentTemperature;
                        // use the latitude and longitude to determine the closest AQHI station
                        var minDistance = Infinity;
                        var closestAQHIStation = null;
                        var airQualityStationIdx = null;
                        for (var i = 0; i < Object.keys(airQualityStations).length; i++) {
                            var stationLatitude = airQualityStations[i].latitude;
                            var stationLongitude = airQualityStations[i].longitude;
                            var φ2 = convertDegtoRad(stationLatitude);
                            var λ2 = convertDegtoRad(stationLongitude);
                            var x = (λ2-λ1) * Math.cos((φ1+φ2)/2);
                            var y = (φ2-φ1);
                            var distToAQHIStation = Math.sqrt(x*x + y*y) * R;
                            if (distToAQHIStation < minDistance) {
                                minDistance = distToAQHIStation;
                                closestAQHIStation = airQualityStations[i].station;
                                airQualityStationIdx = i;
                            }
                        }
                        // from the closest AQHI station, determine its AQHI index and health risk
                        var currentAQHI = airQualityStations[airQualityStationIdx].aqhi;
                        var currentHealthRisk = airQualityStations[airQualityStationIdx]['health_risk'];
                        var aqhiValue = document.getElementById('aqhiValue');
                        aqhiValue.innerText = currentAQHI;
                        var healthRisk = document.getElementById('aqhiRisk');
                        healthRisk.innerText = currentHealthRisk;
                        var aqhiImage = document.querySelector('.aqhi>img');
                        aqhiImage.style.visibility = 'visible';
                        aqhiImage.setAttribute('src', `images/aqhi-${currentHealthRisk.toLowerCase()}.png`);
                        // get the AQ station dropdown list
                        var aqStationDropdownOptions = '';
                        var aqStations = [];
                        for (var i = 0; i < Object.keys(airQualityStations).length; i++) {
                            aqStations.push(airQualityStations[i].station);
                        }
                        aqStations.sort();
                        aqStationDropdownOptions += '<option value="-1"></option>';
                        for (var i = 0; i < Object.keys(airQualityStations).length; i++) {
                            aqStationDropdownOptions += `<option value="${i}">${aqStations[i]}</option>`;
                        }
                        var aqStationDropdown = document.getElementById('aqStationDropdown');
                        aqStationDropdown.innerHTML = aqStationDropdownOptions;
                        aqStationDropdown.addEventListener('change', (evt) => {
                            let selectedStation = aqStations[aqStationDropdown.value];
                            var airQuality = document.getElementById('airQuality');
                            if (selectedStation !== undefined) {
                                for (var i = 0; i < Object.keys(airQualityStations).length; i++) {
                                    if (selectedStation == airQualityStations[i].station) {
                                        airQuality.style.visibility = 'visible';
                                        var aqhiValue = airQualityStations[i].aqhi;
                                        var aqhiHealthRisk = airQualityStations[i]['health_risk'];
                                        airQuality.innerHTML = `Level: ${aqhiValue}<br> Risk: ${aqhiHealthRisk}`;
                                    }
                                }
                            }
                            else {
                                airQuality.style.visibility = 'hidden';
                            }
                        });
                    });
                }
            });
        })
    }
  }

function convertDegtoRad(theta) {
    return theta * Math.PI / 180;
}

function getWeatherStations() {
    fetch('https://ogciopsi.blob.core.windows.net/dataset/weather-station/weather-station-info.json')
    .then(response => {
        if (response.status == 200) {
            response.clone().json().then(WS => {
                weatherStations = WS;
            })
        }
    });
}
async function getAirQualityStations() {
    // read AQHI station info JSON file from local storage
    fetch("data/aqhi-station-info.json")
    .then(response => {
        if (response.status == 200) {
            response.json().then(data => {
                airQualityStationsLocations = data;
            })
        }
    });
    // get the open data for AQHI
    fetch('https://dashboard.data.gov.hk/api/aqhi-individual?format=json')
    .then(response => {
        if (response.status == 200) {
            response.clone().json().then(AQS => {
                airQualityStations = AQS;
                for (var i = 0; i < Object.keys(airQualityStationsLocations).length; i++) {
                    airQualityStations[i].latitude = airQualityStationsLocations[i].lat;
                    airQualityStations[i].longitude = airQualityStationsLocations[i].lng;
                }
            })
        }
    });
}

function getWeatherForecasts() {
    fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en')
    .then(response => {
        if (response.status == 200) {
            response.clone().json().then(WF => {
                nineDayForecast = WF.weatherForecast;
                for (let i = 0; i < daysOfForecast; i++) {
                    let forecastDiv = document.getElementById(`forecast${i}`);
                    let forecastIcon = nineDayForecast[i].ForecastIcon;
                    forecastDiv.querySelector('.forecastWeatherImg').setAttribute('src', `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${forecastIcon}.png`);
                    let forecastDate = nineDayForecast[i].forecastDate;
                    let forecastWeek = nineDayForecast[i].week;
                    let forecastDatetime = new Date(`${forecastDate.slice(0, 4)}-${forecastDate.slice(4, 6)}-${forecastDate.slice(6, 8)}`);
                    let displayForecastDate = `${forecastWeek.slice(0, 3)} ${forecastDatetime.getDate()}/${forecastDatetime.getMonth()+1}`;
                    forecastDiv.querySelector('.forecastDate').innerText = displayForecastDate;
                    let forecastMinTemperature = nineDayForecast[i].forecastMintemp.value;
                    let forecastMaxTemperature = nineDayForecast[i].forecastMaxtemp.value;
                    forecastDiv.querySelector('.forecastTemperature').innerText = `${forecastMinTemperature}-${forecastMaxTemperature} ºC`;
                    let forecastMinHumidity = nineDayForecast[i].forecastMinrh.value;
                    let forecastMaxHumidity = nineDayForecast[i].forecastMaxrh.value;
                    forecastDiv.querySelector('.forecastHumidity').innerText = `${forecastMinHumidity}-${forecastMaxHumidity} %`;
                    let forecastPSR = nineDayForecast[i].PSR;
                    forecastDiv.querySelector('.PSR').setAttribute('src', `https://www.hko.gov.hk/common/images/PSR${forecastPSR.replaceAll(' ', '')}_50_light.png`)
                }
            });
        }
    });
}

function handleClickEvents(event) {
    
}

function toggleWeatherBlocks(mobileDeviceRender) {
    let toggleBlocks = document.querySelectorAll('.toggle');
    if (mobileDeviceRender.matches) {
        toggleBlocks.forEach((element) => {
            element.style.display = 'none';
        });
        let select = document.querySelector('.selectWeather');
        let selected = null;
        select.addEventListener('click', (event) => {
            if (window.innerWidth <= 500) {
                switch(event.target.innerText) {
                    case 'Temperatures':
                        if (selected !== null) {
                            document.querySelector(`#${selected}>div.toggle`).style.display = 'none';
                            if (selected == 'selectTemperature') {
                                selected = null;
                            }
                            else {
                                selected = 'selectTemperature';
                                document.querySelector('#selectTemperature>div.toggle').style.display = 'block';
                            }
                        }
                        else {
                            selected = 'selectTemperature';
                            document.querySelector('#selectTemperature>div.toggle').style.display = 'block';
                        }
                        break;
                    case 'Rainfall':
                        if (selected !== null) {
                            document.querySelector(`#${selected}>div.toggle`).style.display = 'none';
                            if (selected == 'selectRainfall') {
                                selected = null;
                            }
                            else {
                                selected = 'selectRainfall';
                                document.querySelector('#selectRainfall>div.toggle').style.display = 'block';
                            }
                        }
                        else {
                            selected = 'selectRainfall';
                            document.querySelector('#selectRainfall>div.toggle').style.display = 'block';
                        }
                        break;
                    case 'Air Quality':
                        if (selected !== null) {
                            document.querySelector(`#${selected}>div.toggle`).style.display = 'none';
                            if (selected == 'selectAirQuality') {
                                selected = null;
                            }
                            else {
                                selected = 'selectAirQuality';
                                document.querySelector('#selectAirQuality>div.toggle').style.display = 'block';
                            }
                        }
                        else {
                            selected = 'selectAirQuality';
                            document.querySelector('#selectAirQuality>div.toggle').style.display = 'block';
                        }
                        break;
                }
            }
        })
    }
    else {
        toggleBlocks.forEach((element) => {
            element.style.display = 'block';
        });
    }
}

function renderWebsite() {
    // get data available
    getCurrentWeatherData();
    getWeatherStations();
    getAirQualityStations();
    // set background color
    var element = document.querySelector('body');
    element.style.backgroundColor = 'lightgray';

    // add the title element
    var titleElement = document.createElement('h1');
    titleElement.innerText = 'My Weather Portal';
    titleElement.setAttribute('id', 'title');
    element.appendChild(titleElement);

    // add the currentWeather div, which contains the header block and myData block
    var currentWeatherBlock = document.createElement('div');
    currentWeatherBlock.setAttribute('class', 'currentWeather');

    // construct the header block
    // first row in header block contains weather information
    var headerBlock = document.createElement('div');
    headerBlock.setAttribute('id', 'headerBlock');
    headerBlock.classList.add('shadow');
    var hk = document.createElement('p');
    hk.innerText = 'Hong Kong';
    hk.setAttribute('class', 'subtitle');
    hk.setAttribute('class', 'headerBlockText');
    headerBlock.appendChild(hk);
    var headerWeatherInfo = document.createElement('div');
    headerWeatherInfo.setAttribute('id', 'headerweather');
    var weatherIcon = document.createElement('img');
    weatherIcon.setAttribute('id', 'weatherIcon');
    headerWeatherInfo.appendChild(weatherIcon);
    var temperature = document.createElement('div');
    temperature.setAttribute('class', 'temperature');
    var temperatureDegree = document.createElement('span');
    temperatureDegree.classList.add('degree', 'headerBlockText');
    temperatureDegree.innerText = '--';
    temperature.appendChild(temperatureDegree);
    var temperatureCelsius = document.createElement('span');
    temperatureCelsius.classList.add('celsius', 'headerBlockText');
    temperatureCelsius.classList.add('headerBlockText');
    temperatureCelsius.innerText = 'ºC';
    temperature.appendChild(temperatureCelsius);
    headerWeatherInfo.appendChild(temperature);
    var humidity = document.createElement('div');
    humidity.setAttribute('id', 'humidity');
    var humidityValue = document.createElement('span');
    humidityValue.setAttribute('id', 'humidityValue');
    humidityValue.setAttribute('class', 'headerBlockText');
    humidityValue.innerText = '--';
    humidity.appendChild(humidityValue);
    var humidityRight = document.createElement('span');
    var rainDropImg = document.createElement('img');
    rainDropImg.setAttribute('id', 'rainDropImg');
    humidityRight.setAttribute('id', 'humidityRight');
    humidityRight.appendChild(rainDropImg);
    var humidityPercent = document.createElement('span');
    humidityPercent.innerText = '%';
    humidityPercent.classList.add('headerBlockText', 'bottomAlign');
    humidityRight.append(humidityPercent);
    humidity.append(humidityRight);
    headerWeatherInfo.appendChild(humidity);
    var rainfall = document.createElement('div');
    rainfall.setAttribute('class', 'rainfall');
    var rainfallValue = document.createElement('span');
    rainfallValue.innerText = '--';
    rainfallValue.classList.add('rainfallValue', 'headerBlockText');
    rainfall.appendChild(rainfallValue);
    var rainfallRight = document.createElement('span');
    var umbrellaImg = document.createElement('img');
    umbrellaImg.setAttribute('id', 'headerBlockUmbrella');
    rainfallRight.setAttribute('id', 'rainfallRight');
    rainfallRight.appendChild(umbrellaImg);
    var rainfallmm = document.createElement('span');
    rainfallmm.innerText = 'mm';
    rainfallmm.classList.add('headerBlockText', 'bottomAlign');
    rainfallRight.appendChild(rainfallmm);
    rainfall.appendChild(rainfallRight);
    headerWeatherInfo.appendChild(rainfall);
    var uvIndexDiv = document.createElement('div');
    uvIndexDiv.setAttribute('id', 'uvindex');
    var uvIndexValue = document.createElement('span');
    uvIndexValue.setAttribute('id', 'uvIndexValue');
    uvIndexValue.innerText = '--';
    uvIndexDiv.appendChild(uvIndexValue);
    var uvImg = document.createElement('img');
    uvImg.setAttribute('id', 'uvImg');
    uvIndexDiv.appendChild(uvImg);
    headerWeatherInfo.appendChild(uvIndexDiv);
    headerBlock.appendChild(headerWeatherInfo);

    // last row in the header block contains warnings button and last update
    // warnings button
    var headerBlockLastRow = document.createElement('div');
    headerBlockLastRow.setAttribute('id', 'headerBlockLastRow');
    var warningsButton = document.createElement('div');
    warningsButton.setAttribute('id', 'warningsButton');
    var warningsButtonText = document.createElement('span');
    warningsButton.appendChild(warningsButtonText);
    var warningsMessage = document.createElement('p');
    warningsMessage.setAttribute('id', 'warningsMessage');
    warningsMessage.style.display = 'none';
    warningsButton.appendChild(warningsMessage);
    headerBlockLastRow.appendChild(warningsButton);

    // last update text
    var lastUpdate = document.createElement('span');
    lastUpdate.setAttribute('id', 'lastUpdate');
    lastUpdate.setAttribute('class', 'headerBlockText');
    headerBlockLastRow.appendChild(lastUpdate);
    headerBlock.appendChild(headerBlockLastRow);
    currentWeatherBlock.appendChild(headerBlock);

    // construct the myData block
    var myDataBlock = document.createElement('div');
    myDataBlock.setAttribute('id', 'myDataBlock');
    myDataBlock.classList.add('shadow');
    var myLocation = document.createElement('p');
    myLocation.setAttribute('class', 'subtitle');
    myLocation.innerText = 'My Location';
    myDataBlock.appendChild(myLocation);
    var currentLocation = document.createElement('p');
    currentLocation.setAttribute('id', 'currentLocation');
    currentLocation.style.visibility = 'hidden';
    myDataBlock.appendChild(currentLocation);
    getCurrentLocation();

    // temperature, rainfall and AQHI
    var myDataWeather = document.createElement('div');
    myDataWeather.setAttribute('id', 'myDataWeather');
    var myTemperature = document.createElement('div');
    myTemperature.setAttribute('class', 'temperature');
    var myTemperatureDegree = document.createElement('span');
    myTemperatureDegree.classList.add('degree', 'myDataBlockText');
    myTemperatureDegree.innerText = '--';
    myTemperature.appendChild(myTemperatureDegree);
    var myTemperatureCelsius = document.createElement('span');
    myTemperatureCelsius.classList.add('celsius', 'myDataBlockText');
    myTemperatureCelsius.innerText = 'ºC';
    myTemperature.appendChild(myTemperatureCelsius);
    myDataWeather.appendChild(myTemperature);
    var myRainfall = document.createElement('div');
    myRainfall.setAttribute('class', 'rainfall');
    var myRainfallValue = document.createElement('span');
    myRainfallValue.classList.add('rainfallValue', 'myDataBlockText');
    myRainfallValue.setAttribute('id', 'myRainfallValue');
    myRainfallValue.innerText = '--';
    myRainfall.appendChild(myRainfallValue);
    var myRainfallRight = document.createElement('span');
    var myUmbrellaImg = document.createElement('img');
    myUmbrellaImg.setAttribute('id', 'myDataBlockUmbrella');
    myUmbrellaImg.setAttribute('src', 'images/rain-48.png');
    myRainfallRight.setAttribute('id', 'myRainfallRight');
    myRainfallRight.appendChild(myUmbrellaImg);
    var myRainfallmm = document.createElement('span');
    myRainfallmm.innerText = 'mm';
    myRainfallmm.classList.add('myDataBlockText', 'bottomAlign');
    myRainfallRight.appendChild(myRainfallmm);
    myRainfall.appendChild(myRainfallRight);
    myDataWeather.appendChild(myRainfall);
    var myAQHI = document.createElement('div');
    myAQHI.setAttribute('id', 'aqhi');
    myAQHI.setAttribute('class', 'aqhi');
    var myAQHIpic = document.createElement('img');
    myAQHIpic.setAttribute('src', 'images/aqhi-serious.png');
    myAQHIpic.style.visibility = 'hidden';
    myAQHI.appendChild(myAQHIpic);
    var myAQHIright = document.createElement('div');
    myAQHIright.setAttribute('id', 'aqhiData')
    var myAQHIvalue = document.createElement('span');
    myAQHIvalue.setAttribute('id', 'aqhiValue');
    myAQHIvalue.innerText = '--';
    myAQHIright.appendChild(myAQHIvalue);
    var myAQHIrisk = document.createElement('span');
    myAQHIrisk.setAttribute('id', 'aqhiRisk');
    myAQHIrisk.innerText = '---';
    myAQHIright.appendChild(myAQHIrisk);
    myAQHI.appendChild(myAQHIright);
    myDataWeather.appendChild(myAQHI);
    myDataBlock.appendChild(myDataWeather);
    currentWeatherBlock.appendChild(myDataBlock);
    element.appendChild(currentWeatherBlock);

    // make the second row block to manually select temperature, rainfall and air quality
    var weatherSelection = document.createElement('div');
    weatherSelection.classList.add('selectWeather');
    // 1. temperature
    var temperatureSelection = document.createElement('div');
    temperatureSelection.setAttribute('id', 'selectTemperature');
    temperatureSelection.classList.add('shadow');
    var temperatureSelectionTitle = document.createElement('div');
    var temperatureText = document.createElement('p');
    temperatureText.innerText = 'Temperatures';
    temperatureText.classList.add('subtitle');
    temperatureSelectionTitle.append(temperatureText);
    temperatureSelection.appendChild(temperatureSelectionTitle);
    var temperatureDropdownSection = document.createElement('div');
    temperatureDropdownSection.classList.add('toggle');
    var selectLocation = document.createElement('p');
    selectLocation.innerText = 'Select the location';
    temperatureDropdownSection.appendChild(selectLocation);
    var locationDropdown = document.createElement('select');
    locationDropdown.setAttribute('id', 'locationDropdown');
    temperatureDropdownSection.appendChild(locationDropdown);
    var temperature = document.createElement('div');
    temperature.setAttribute('class', 'temperature');
    temperature.style.visibility = 'hidden';
    var temperatureDegree = document.createElement('span');
    temperatureDegree.classList.add('degree');
    temperatureDegree.innerText = '25';
    temperature.appendChild(temperatureDegree);
    var temperatureCelsius = document.createElement('span');
    temperatureCelsius.classList.add('celsius');
    temperatureCelsius.innerText = 'ºC';
    temperature.appendChild(temperatureCelsius);
    temperatureDropdownSection.appendChild(temperature);
    temperatureSelection.appendChild(temperatureDropdownSection);
    weatherSelection.appendChild(temperatureSelection);
    // 2. rainfall
    var rainfallSelection = document.createElement('div');
    rainfallSelection.setAttribute('id', 'selectRainfall');
    rainfallSelection.classList.add('shadow');
    var rainfallSelectionTitle = document.createElement('div');
    var rainfallText = document.createElement('p');
    rainfallText.innerText = 'Rainfall';
    rainfallText.classList.add('subtitle');
    rainfallSelectionTitle.append(rainfallText);
    rainfallSelection.appendChild(rainfallSelectionTitle);
    var rainfallDropdownSection = document.createElement('div');
    rainfallDropdownSection.classList.add('toggle');
    var selectDistrict = document.createElement('p');
    selectDistrict.innerText = 'Select the district';
    rainfallDropdownSection.appendChild(selectDistrict);
    var districtDropdown = document.createElement('select');
    districtDropdown.setAttribute('id', 'districtDropdown');
    rainfallDropdownSection.appendChild(districtDropdown);
    var rainfall = document.createElement('div');
    rainfall.setAttribute('class', 'rainfall');
    rainfall.style.visibility = 'hidden';
    var rainfallValue = document.createElement('span');
    rainfallValue.innerText = '0';
    rainfallValue.classList.add('rainfallValue');
    rainfall.appendChild(rainfallValue);
    var rainfallmm = document.createElement('span');
    rainfallmm.classList.add('bottomAlign');
    rainfallmm.innerHTML = '<br><br>mm';
    rainfall.appendChild(rainfallmm);
    rainfallDropdownSection.appendChild(rainfall);
    rainfallSelection.appendChild(rainfallDropdownSection);
    weatherSelection.appendChild(rainfallSelection);
    // 3. air quality
    var airQualitySelection = document.createElement('div');
    airQualitySelection.setAttribute('id', 'selectAirQuality');
    airQualitySelection.classList.add('shadow');
    var airQualitySelectionTitle = document.createElement('div');
    var airQualityText = document.createElement('p');
    airQualityText.innerText = 'Air Quality';
    airQualityText.classList.add('subtitle');
    airQualitySelectionTitle.appendChild(airQualityText);
    airQualitySelection.appendChild(airQualitySelectionTitle);
    var airQualityDropdownSection = document.createElement('div');
    airQualityDropdownSection.classList.add('toggle');
    var selectAQ = document.createElement('p');
    selectAQ.innerText = 'Select the AQ Station';
    airQualityDropdownSection.appendChild(selectAQ);
    var aqStationDropdown = document.createElement('select');
    aqStationDropdown.setAttribute('id', 'aqStationDropdown');
    airQualityDropdownSection.appendChild(aqStationDropdown);
    var airQuality = document.createElement('div');
    airQuality.setAttribute('id', 'airQuality');
    airQuality.innerHTML = 'Level: 10 <br> Risk: Serious';
    airQuality.style.visibility = 'hidden';
    airQualityDropdownSection.appendChild(airQuality);
    airQualitySelection.appendChild(airQualityDropdownSection);
    weatherSelection.appendChild(airQualitySelection);
    element.appendChild(weatherSelection);

    // weather forecast section
    getWeatherForecasts();
    var forecastSection = document.createElement('div');
    forecastSection.classList.add('forecastWeather', 'shadow');
    var forecastSectionTitle = document.createElement('p');
    forecastSectionTitle.classList.add('subtitle');
    forecastSectionTitle.innerText = '9-Day Forecast';
    forecastSection.appendChild(forecastSectionTitle);
    var forecasts = document.createElement('div');
    forecasts.setAttribute('id', 'weatherForecasts');
    for (let i = 0; i < daysOfForecast; i++) {
        var forecastDay = document.createElement('div');
        forecastDay.classList.add('forecast');
        forecastDay.setAttribute('id', `forecast${i}`);
        var forecastDayText = document.createElement('p');
        forecastDayText.classList.add('forecastDate');
        forecastDay.appendChild(forecastDayText);
        var forecastDayWeather = document.createElement('img');
        forecastDayWeather.classList.add('forecastWeatherImg');
        forecastDay.appendChild(forecastDayWeather);
        var forecastDayPSR = document.createElement('img');
        forecastDayPSR.classList.add('PSR');
        forecastDay.appendChild(forecastDayPSR);
        var forecastDayTemperature = document.createElement('p');
        forecastDayTemperature.classList.add('forecastTemperature');
        forecastDay.appendChild(forecastDayTemperature);
        var forecastDayHumidity = document.createElement('p');
        forecastDayHumidity.classList.add('forecastHumidity');
        forecastDay.appendChild(forecastDayHumidity);
        forecasts.appendChild(forecastDay);
    }
    forecastSection.appendChild(forecasts);
    element.appendChild(forecastSection);

    // add event listener to suit the requirement of mobile device rendering
    let mobileDeviceRender = window.matchMedia('(max-width: 500px)');
    mobileDeviceRender.addEventListener('change', toggleWeatherBlocks);
    if (window.innerWidth <= 500) {
        toggleWeatherBlocks(mobileDeviceRender);
    }
}

// after the DOM Content is loaded, do the following
document.addEventListener('DOMContentLoaded', () => {
    renderWebsite();
});
