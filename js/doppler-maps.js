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
        let map = d3.select(mapEl);

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

                // Create color scale.
                let interpolator = d3.interpolateRgb(mapEl.dataset.colorLowest, mapEl.dataset.colorHighest);
                let colorPalette = d3.quantize(interpolator, mapEl.dataset.legendNumberOfColors);
                let max = d3.max(data, d => d3.max(d.values, d => d.value));
                let min = d3.min(data, d => d3.min(d.values, d => d.value));
                let colorScale = d3.scaleQuantize()
                    .domain([min, max])
                    .range(colorPalette);

                // Add legend container.
                let mapLegend = map.append('div')
                    .attr('class', 'doppler-maps__legend')
                    .style('text-align', 'center');

                // Add title only if the user specified one.
                if (mapEl.dataset.legendTitle !== '' && typeof mapEl.dataset.legendTitle !== 'undefined') {
                    mapLegend.append('div')
                        .attr('class', 'doppler-maps__legend-title')
                        .style('display', 'inline-block')
                        .html(mapEl.dataset.legendTitle)
                        .append('br');
                }

                // Add legend color palette items.
                const TICK_WIDTH = 1;
                let legendColorPaletteItems = mapLegend.append('div')
                    .attr('class', 'doppler-maps__legend-color-palette')
                    .selectAll('.doppler-maps__legend-color-palette-item')
                    .data(colorScale.range())
                  .enter().append('div')
                    .attr('class', 'doppler-maps__legend-color-palette-item')
                    .style('position', 'relative')
                    .style('display', 'inline-block')
                    .style('margin-right', TICK_WIDTH + 'px')
                    .style('max-width', '50px')
                    .style('width', 'calc(100% / 6 - ' + TICK_WIDTH + 'px)')
                    .style('height', '10px')
                    .style('background-color', d => d);

                // Add legend color palette ticks.
                legendColorPaletteItems.filter(':not(:last-child)')
                    .append('div')
                    .attr('class', 'doppler-maps__legend-color-palette-tick')
                    .style('position', 'absolute')
                    .style('top', '0')
                    .style('right', -TICK_WIDTH + 'px')
                    .style('display', 'inline-block')
                    .style('width', TICK_WIDTH + 'px')
                    .style('height', '100%')
                    .style('background-color', '#333')
                    .style('font-size', '14px')
                  .append('div')
                    .style('position', 'absolute')
                    .style('left', '-1em')
                    .style('margin-top', '18px')
                    .style('width', '2em')
                    .style('line-height', '1em')
                    .text(d => d3.format('.1f')(colorScale.invertExtent(d)[1]));

                // Create HTML5 Canvas element.
                let canvas = map.style('width', '100%')
                    .append('canvas')
                    .attr('width', width)
                    .attr('height', height);

                let context = canvas.node().getContext('2d');

                // Sort data.
                data.sort((a, b) => compareWords(a['Geographic Administrative Unit'], b['Geographic Administrative Unit']));

                // Sort geographic data.
                let geometries = geodata.objects['us-states'].geometries;
                geometries.sort((a, b) => compareWords(a.properties.name, b.properties.name));

                let path = d3.geoPath()
                    .projection(createProjection(geodata, width, height))
                    .context(context);

                let geographicAdministrativeUnits = topojson.feature(geodata, geodata.objects['us-states']).features;
                geographicAdministrativeUnits.forEach((geographicAdministrativeUnit, i) => {
                    context.fillStyle = colorScale(data[i].values[0].value);
                    context.beginPath();
                    path(geographicAdministrativeUnit);
                    context.stroke();
                    context.fill();
                });
            });
    });
});
