// AdTech team.
const adtech = [
    {"id": 1, "long": -87.95, "lat": 42.28, "city": "Chicago", "names": "Brian W."},
    {"id": 2, "long": -77.05, "lat": 38.93, "city": "D.C.", "names": "Leah"},
    {"id": 4, "long": -118.49, "lat": 34.00, "city": "Los Angeles", "names": "Yuriy"},
    {"id": 5, "long": -122.66, "lat": 45.63, "xAdjust": 100, "city": "Vancouver", "names": "Jared, Eric, Jim, Josh, Zach"},
    {"id": 6, "long": -105.00, "lat": 39.75, "xAdjust": 40, "city": "Denver", "names": "Kristyn"},
    {"id": 7, "long": -111.96, "lat": 41.24, "city": "Salt Lake area", "names": "Brenden"},
    {"id": 8, "long": -82.41, "lat": 27.97, "city": "Tampa", "names": "Yergeny"},
    {"id": 9, "long": -81.51, "lat": 30.37, "city": "Jacksonville", "names": "Jere"},
    {"id": 10, "long": -111.60, "lat": 40.16, "city": "Provo", "names": "Joel"},
    {"id": 11, "long": -115.14, "lat": 36.19, "city": "Las Vegas", "names": "Jonathan"},
    {"id": 12, "long": -84, "lat": 26, "city": "Argentina", "names": "Marcos"},
    {"id": 13, "long": -117.17, "lat": 32.79, "city": "San Diego", "names": "Austin"},
];

// DataReporting team.
const dataReporting = [
    {"id": 2, "long": -77.05, "lat": 38.93, "city": "D.C.", "names": "Leah"},
    {"id": 3, "long": -84.39, "lat": 33.76, "city": "Atlanta", "names": "Chris"},
    {"id": 4, "long": -118.49, "lat": 34.00, "city": "Los Angeles", "names": "Yuriy"},
    {"id": 5, "long": -122.66, "lat": 45.63, "xAdjust": 100, "city": "Vancouver", "names": "Jared, Eric, Jim, Josh, Zach"},
    {"id": 6, "long": -105.00, "lat": 39.75, "xAdjust": 40, "city": "Denver", "names": "JD, Kristyn"},
    {"id": 7, "long": -111.96, "lat": 41.24, "city": "Salt Lake area", "names": "Brenden"},
    {"id": 9, "long": -81.51, "lat": 30.37, "city": "Jacksonville", "names": "Jere"},
    {"id": 10, "long": -111.60, "lat": 40.16, "city": "Provo", "names": "Dallin"},
];

function addLabels() {
    const mapSvg = document.getElementById('map-svg')
    const labels = document.getElementsByClassName('city-labels')

    for (const label of Array.from(labels)) {
        label.addEventListener('mouseover', function(evt) {
            const ttg = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            const tt = document.createElementNS("http://www.w3.org/2000/svg", 'text');

            tt.textContent =  evt.target.dataset.tooltipText
            tt.setAttribute('transform', 'translate(-5 20)')
            tt.setAttribute('fill', '#333')
            tt.setAttribute('font-style', 'italic')
            tt.setAttribute('text-anchor', 'end')

            let itemID = 'city-marker-' + evt.target.dataset.itemID;
            ttg.setAttribute('transform', `translate(${evt.target.dataset.pos})`)
            ttg.setAttribute('id', itemID)

            ttg.appendChild(tt)
            mapSvg.appendChild(ttg)

            evt.target.addEventListener('mouseout', function(evt) {
                document.getElementById(itemID).remove()
            }, {once: true})
        }, {once: false})
    }
}

/**
 * showPoints adds the points to the map.
 *
 * @param {array} set Name of dataset.
 */
function showPoints(set) {
    let data;
    switch (set) {
        case "adtech":
            data = adtech;
            break;
        case "data":
            data = dataReporting;
            break;
    }
    map(mapData, data)
    addLabels()

    // Update buttons.
    let buttons = document.getElementsByTagName('button')
    for (const button of buttons) {
        button.classList.remove('active')
    }
    document.getElementById('button-' + set).classList.add('active')
}

/**
 * map renders the D3 map.
 *
 * @param {string} us JSON data
 * @param {array} points Array of JSON objects
 */
function map(us, points) {
    let width = 975, height = 610;

    const projection = d3.geoAlbersUsa()
        .scale(1300)
        .translate([width/2, height/2])

    // Start again on button.
    d3.select("#map-svg")
      .remove()

    let svg = d3.select("div")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr('id', 'map-svg')

    path = d3.geoPath()

    const statesBackground = svg
        .append('path')
        .attr('fill', '#ddd')
        .attr('d', path(topojson.feature(us, us.objects.nation)));

    const statesBorders = svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

    const stateCapitalElements = svg.selectAll('g')
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .data(points)
        .join('g');

    const cities = stateCapitalElements.append('g')
        .attr('transform', (d) => {return `translate(${projection([d.long, d.lat]).join(",")})`})

    cities.append('circle')
        .attr('r', 6)
        .attr('fill', 'red')

    if (!points.length) {
        return;
    }

    // Hover trigger, must be on top of colored-circle to avoid triggering mouseout in the center.
    cities.append('circle')
        .attr('r', 12)
        .attr('fill', 'transparent')
        .attr('class', 'city-labels')
        .attr('data-tooltip-text', (d) => {return d.city})
        .attr('data-pos', (d) => {return projection([d.long, d.lat]).join(",")})
        .attr('data-itemID', (d) => {return d.id})

    cities.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('y', -8)
        .attr('x', (d) => {if (d.xAdjust) {return d.xAdjust} else {return 0}})
        .attr('white-space', 'pre')
        .text((d) => {return d.names})
}

// Set global var to retrieve map data on button click.
let mapData;

window.addEventListener('DOMContentLoaded', async (event) => {
    const res = await fetch(`./states-albers-10m.json`)
    const mapJson = await res.json()
    mapData = mapJson;
    map(mapJson, [])

    addLabels()
  });