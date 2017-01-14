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

let reformatData = (data) => {
    let reformattedData = [];

    data.columns.forEach((column) => {
        if (column !== 'Geographic Administrative Unit') {
            reformattedData.push({
                'year': +column,
                'values': []
            });
        }
    });

    data.forEach((row) => {
        reformattedData.forEach((d) => {
            d.values.push({
                'Geographic Administrative Unit': row['Geographic Administrative Unit'],
                'value': +row[d.year]
            });
        });
    });

    return reformattedData;
};

document.addEventListener('DOMContentLoaded', () => {
    let allDopplerMapsEl = document.querySelectorAll('.doppler-maps');
    [...allDopplerMapsEl].forEach((dopplerMapsEl) => {
        let dopplerMaps = d3.select(dopplerMapsEl);

        // Add legend container.
        let mapLegend = dopplerMaps.append('div')
            .attr('class', 'doppler-maps__legend')
            .style('text-align', 'center');

        // Add title only if the user specified one.
        if (dopplerMapsEl.dataset.legendTitle !== '' && typeof dopplerMapsEl.dataset.legendTitle !== 'undefined') {
            mapLegend.append('div')
                .attr('class', 'doppler-maps__legend-title')
                .style('margin-bottom', '0.4em')
                .html(dopplerMapsEl.dataset.legendTitle);
        }

        // Add maps container.
        let mapContainer = dopplerMaps.append('div')
            .attr('class', 'doppler-maps__maps-container');

        d3.queue()
            .defer(d3.json, dopplerMapsEl.dataset.geoSrc)
            .defer(d3.csv, dopplerMapsEl.dataset.src)
            .await((error, geodata, data) => {
                if (error) throw error;

                // Sort data.
                data.sort((a, b) => compareWords(a['Geographic Administrative Unit'], b['Geographic Administrative Unit']));

                // Sort geographic data.
                let geometries = geodata.objects['us-states'].geometries;
                geometries.sort((a, b) => compareWords(a.properties.name, b.properties.name));

                data = reformatData(data);

                // Create color scale.
                let interpolator = d3.interpolateRgb(dopplerMapsEl.dataset.colorLowest, dopplerMapsEl.dataset.colorHighest);
                let colorPalette = d3.quantize(interpolator, dopplerMapsEl.dataset.legendNumberOfColors);
                let max = d3.max(data, d => d3.max(d.values, d => d.value));
                let min = d3.min(data, d => d3.min(d.values, d => d.value));
                let colorScale = d3.scaleQuantize()
                    .domain([min, max])
                    .range(colorPalette);

                // Add legend color palette items.
                const TICK_WIDTH = 1,
                      TICK_TEXT_FONT_SIZE = 14,
                      TICK_TEXT_MARGIN_TOP = 18,
                      COLOR_PALETTE_ITEM_HEIGHT = 10;
                let legendColorPaletteItems = mapLegend.append('div')
                    .attr('class', 'doppler-maps__legend-color-palette')
                    .style('padding-bottom', TICK_TEXT_MARGIN_TOP - COLOR_PALETTE_ITEM_HEIGHT + TICK_TEXT_FONT_SIZE + 'px')
                    .style('line-height', 0)
                    .selectAll('.doppler-maps__legend-color-palette-item')
                    .data(colorScale.range())
                  .enter().append('div')
                    .attr('class', 'doppler-maps__legend-color-palette-item')
                    .style('position', 'relative')
                    .style('display', 'inline-block')
                    .style('margin-right', TICK_WIDTH + 'px')
                    .style('max-width', '50px')
                    .style('width', 'calc(100% / 6 - ' + TICK_WIDTH + 'px)')
                    .style('height', COLOR_PALETTE_ITEM_HEIGHT + 'px')
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
                    .style('font-size', TICK_TEXT_FONT_SIZE + 'px')
                  .append('div')
                    .style('position', 'absolute')
                    .style('left', '-1em')
                    .style('margin-top', TICK_TEXT_MARGIN_TOP + 'px')
                    .style('width', '2em')
                    .style('line-height', '1em')
                    .text(d => d3.format('.1f')(colorScale.invertExtent(d)[1]));

                // Create one map for each year.
                data.forEach((d) => {
                    let map = mapContainer.append('div')
                        .attr('class', 'doppler-maps__map')
                        .style('display', 'inline-block')
                        .style('width', 100 / dopplerMapsEl.dataset.columns + '%');

                    let mapEl = map.node();

                    // Create HTML5 Canvas element.
                    let canvas = map.append('canvas').style('display', 'block');

                    // Create 2D rendering context.
                    let context = canvas.node().getContext('2d');

                    let featureCollection = topojson.feature(geodata, geodata.objects['us-states']);
                    let geographicAdministrativeUnits = featureCollection.features;
                    let projection = d3.geoAlbersUsa();
                    let path = d3.geoPath().context(context).projection(projection);
                    let bounds = path.bounds(featureCollection);
                    let aspectRatio = (bounds[1][1] - bounds[0][1]) / (bounds[1][0] - bounds[0][0]);
                    let width = null, height = null;

                    let renderMap = () => {
                        width = parseFloat(getComputedStyle(mapEl).width);
                        height = width * aspectRatio;

                        projection.fitSize([width, height], featureCollection);
                        path.projection(projection);

                        canvas.attr('width', width).attr('height', height);

                        geographicAdministrativeUnits.forEach((geographicAdministrativeUnit, i) => {
                            let value = d.values[i].value;
                            context.fillStyle = colorScale(value);
                            context.beginPath();
                            path(geographicAdministrativeUnit);
                            context.stroke();
                            context.fill();
                        });
                    };

                    renderMap();
                    window.addEventListener('resize', renderMap);
                });
            });
    });
});