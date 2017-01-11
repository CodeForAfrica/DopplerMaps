import * as d3 from 'd3';
import * as topojson from 'topojson';
import * as projections from 'd3-geo-projection';

let compareWords = (a, b) => {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
};

let createProjection = (geodata, width, height) => {
    return d3.geoAlbersUsa()
        .fitSize([width, height], topojson.feature(geodata, geodata.objects['us-states']));
};

document.addEventListener('DOMContentLoaded', () => {
    let width = 800, height = 600;
    let maps = document.querySelectorAll('.doppler-maps');
    [...maps].forEach((mapEl) => {
        let map = d3.select(mapEl)
            .style('width', '100%')
            .append('canvas')
            .attr('width', width)
            .attr('height', height);

        let context = map.node().getContext('2d');

        let parseData = (d) => {
            let values = [];

            Object.keys(d).forEach(key => {
                if (key !== 'Geographic Administrative Unit') {
                    values.push({
                        'year': +key,
                        'value': +d[key]
                    });
                }
            });

            return {
                'Geographic Administrative Unit': d['Geographic Administrative Unit'],
                values: values
            };
        };

        d3.queue()
            .defer(d3.json, mapEl.dataset.geoSrc)
            .defer(d3.csv, mapEl.dataset.src, parseData)
            .await((error, geodata, data) => {
                if (error) throw error;

                // Sort data.
                data.sort((a, b) => compareWords(a['Geographic Administrative Unit'], b['Geographic Administrative Unit']));

                // Sort geographic data.
                let geometries = geodata.objects['us-states'].geometries;
                geometries.sort((a, b) => compareWords(a.properties.name, b.properties.name));

                let path = d3.geoPath()
                    .projection(createProjection(geodata, width, height))
                    .context(context);

                let max = d3.max(data, d => d3.max(d.values, d => d.value));
                let min = d3.min(data, d => d3.min(d.values, d => d.value));
                let color = d3.scaleLinear()
                    .domain([min, max])
                    .range(['yellow', 'red']);

                let geographicAdministrativeUnits = topojson.feature(geodata, geodata.objects['us-states']).features;
                geographicAdministrativeUnits.forEach((geographicAdministrativeUnit, i) => {
                    context.fillStyle = color(data[i].values[0].value);
                    context.beginPath();
                    path(geographicAdministrativeUnit);
                    context.stroke();
                    context.fill();
                });
            });
    });
});
