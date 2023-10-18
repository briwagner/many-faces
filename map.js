function map(us) {
    let width = 975, height = 610;

    const projection = d3.geoAlbersUsa()
        .scale(1300)
        .translate([width/2, height/2])

    let svg = d3.select("div")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr('id', 'map-svg')

    path = d3.geoPath()

    const points = [
        {"long": -87.95, "lat": 42.28, "city": "Chicago", "names": "Brian W."},
        {"long": -77.05, "lat": 38.93, "city": "D.C.", "names": "Leah"},
        {"long": -84.39, "lat": 33.76, "city": "Atlanta", "names": "Chris"},
        {"long": -118.49, "lat": 34.00, "city": "Los Angeles", "names": "Yuriy"},
        {"long": -122.66, "lat": 45.63, "xAdjust": 100, "city": "Vancouver", "names": "David W., Jared, Eric, Jim, Josh, Zach"},
        {"long": -105.00, "lat": 39.75, "xAdjust": 40, "city": "Denver", "names": "JD, Kristyn, Brenden"},
        {"long": -82.41, "lat": 27.97, "city": "Tampa", "names": "Yergeny"},
        {"long": -81.51, "lat": 30.37, "city": "Jacksonville", "names": "Jere"},
        {"long": -111.60, "lat": 40.16, "city": "Provo", "names": "Dallin, Joel"},
        {"long": -115.14, "lat": 36.19, "city": "Las Vegas", "names": "Jonathan"},
    ];

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
        .attr('class', 'city-labels')
        .attr('data-tooltip-text', (d) => {return d.city})
        .attr('data-pos', (d) => {return projection([d.long, d.lat]).join(",")})

    cities.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('y', -8)
        .attr('x', (d) => {if (d.xAdjust) {return d.xAdjust} else {return 0}})
        .attr('white-space', 'pre')
        .text((d) => {return d.names})
}

window.addEventListener('DOMContentLoaded', async (event) => {
    const res = await fetch(`http://localhost:3030/states-albers-10m.json`)
    const mapJson = await res.json()
    map(mapJson)

    const mapSvg = document.getElementById('map-svg')
    const labels = document.getElementsByClassName('city-labels')

    for (const label of Array.from(labels)) { 
        label.addEventListener('mouseover', function(evt) {
            const ttg = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            const tt = document.createElementNS("http://www.w3.org/2000/svg", 'text');

            tt.textContent =  evt.target.dataset.tooltipText
            tt.setAttribute('transform', 'translate(5 20)')
            tt.setAttribute('fill', '#333')
            tt.setAttribute('font-style', 'italic')

            ttg.setAttribute('transform', `translate(${evt.target.dataset.pos})`)

            ttg.appendChild(tt)
            mapSvg.appendChild(ttg)
        }, {once: true})
    }
  });