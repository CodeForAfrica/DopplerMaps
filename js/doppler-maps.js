import * as d3All from 'd3';
import * as d3GeoProjection from 'd3-geo-projection';
import * as topojson from 'topojson';
import objectAssign from 'object-assign';  // Needed for IE 11 support.
import arrayFrom from 'array.from';        // Needed for IE 11 support.
arrayFrom.shim();

let d3 = objectAssign({}, d3All, d3GeoProjection);

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

let optionIsProvided = (option) => {
    return option !== '' && typeof option !== 'undefined';
};

let colorIsValid = (color) => {
    return d3.color(color) !== null;
};

document.addEventListener('DOMContentLoaded', () => {
    let allDopplerMapsEl = document.querySelectorAll('.doppler-maps');
    [...allDopplerMapsEl].forEach((dopplerMapsEl) => {
        let dopplerMaps = d3.select(dopplerMapsEl);

        let options = {
            geoSrc:                 dopplerMapsEl.dataset.geoSrc,
            src:                    dopplerMapsEl.dataset.src,
            columns:                dopplerMapsEl.dataset.columns,
            rows:                   dopplerMapsEl.dataset.rows,
            mapProjection:          dopplerMapsEl.dataset.mapProjection,
            title:                  dopplerMapsEl.dataset.title,
            numberOfColors:         dopplerMapsEl.dataset.numberOfColors,
            colorLowest:            dopplerMapsEl.dataset.colorLowest,
            colorHighest:           dopplerMapsEl.dataset.colorHighest,
            colorNoData:            dopplerMapsEl.dataset.colorNoData,
            colors:                 dopplerMapsEl.dataset.colors,
            legendDisable:          dopplerMapsEl.dataset.legendDisable,
            legendTitleFontFamily:  dopplerMapsEl.dataset.legendTitleFontFamily,
            legendTitleFontSize:    dopplerMapsEl.dataset.legendTitleFontSize,
            legendTitleDisable:     dopplerMapsEl.dataset.legendTitleDisable,
            labelFontFamily:        dopplerMapsEl.dataset.labelFontFamily,
            labelFontSize:          dopplerMapsEl.dataset.labelFontSize
        };

        const defaults = {
            columns:                3,
            mapProjection:          d3.geoMercator(),
            numberOfColors:         5,
            colorLowest:            '#deebf7',
            colorHighest:           '#3182bd',
            colorNoData:            '#c7c8c9',
            legendDisable:          false,
            legendTitleFontFamily:  'sans-serif',
            legendTitleFontSize:    '16px',
            legendTitleDisable:     false,
            labelFontFamily:        'sans-serif',
            labelFontSize:          '16px'
        };

        if (!optionIsProvided(options.geoSrc)) {
            throw new Error('Please provide a \'data-geo-src\' attribute.');
        }

        if (!optionIsProvided(options.src)) {
            throw new Error('Please provide a \'data-src\' attribute.');
        }

        let projection = null;
        if (!optionIsProvided(options.mapProjection)) {
            projection = defaults.mapProjection;
        } else if (typeof d3[options.mapProjection] === 'undefined') {
            throw new Error('The provided \'data-map-projection\' attribute value does not correspond to a map projection.');
        } else {
            projection = d3[options.mapProjection]();
        }

        // Add legend container.
        let mapLegend = dopplerMaps.append('div')
            .attr('class', 'doppler-maps__legend')
            .style('text-align', 'center');

        // Add title only if the user specified one.
        if (optionIsProvided(options.title)) {
            let disableLegendTitle = null;
            if (optionIsProvided(options.legendTitleDisable)) {
                disableLegendTitle = (options.legendTitleDisable == 'true');
            } else {
                disableLegendTitle = defaults.legendTitleDisable;
            }
            if (!disableLegendTitle) {
                mapLegend.append('div')
                    .attr('class', 'doppler-maps__legend-title')
                    .style('margin-bottom', '0.4em')
                    .style('font-family', optionIsProvided(options.legendTitleFontFamily) ? options.legendTitleFontFamily : defaults.legendTitleFontFamily)
                    .style('font-size', optionIsProvided(options.legendTitleFontSize) ? options.legendTitleFontSize : defaults.legendTitleFontSize)
                    .html(options.title);
            }
        }

        // Add maps container.
        let mapContainer = dopplerMaps.append('div')
            .attr('class', 'doppler-maps__maps-container');

        d3.queue()
            .defer(d3.json, options.geoSrc)
            .defer(d3.csv, options.src)
            .await((error, geodata, data) => {
                if (error) throw error;

                const SUBUNIT_COLUMN_NAME = 'location';

                // Convert geographic data from TopoJSON to GeoJSON.
                let featureCollection = topojson.feature(geodata, geodata.objects.subunits);
                let subunits = featureCollection.features;

                // Create a lookup table: subunit name (key) -> corresponding row values (value).
                let lookupTable = [];
                data.forEach((row) => {
                    let subunitName = row[SUBUNIT_COLUMN_NAME];
                    delete row[SUBUNIT_COLUMN_NAME];
                    lookupTable[subunitName] = row;
                });

                // Merge statistical data and geographic data.
                let columns = data.columns;
                data = [];
                data.columns = columns;
                subunits.forEach((subunit) => {
                    data.push({
                        'subunit': subunit,
                        'values': (typeof lookupTable[subunit.properties.name] === 'undefined' ? null : lookupTable[subunit.properties.name])
                    });
                });

                // Sort data by subunit name in ascending order.
                data.sort((a, b) => compareWords(a.subunit.properties.name, b.subunit.properties.name));

                // Create final dataset to be used by Doppler Maps.
                let mapsData = [];

                data.columns.forEach((columnTitle) => {
                    if (columnTitle === 'location') return;
                    mapsData.push({
                        'year': +columnTitle,
                        'values': []
                    });
                });

                data.forEach((row) => {
                    mapsData.forEach((mapData) => {
                        mapData.values.push({
                            'statisticalValue': (row.values === null ? null : +row.values[mapData.year]),
                            'subunit': row.subunit
                        });
                    });
                });

                // Create color scale.
                let max = d3.max(mapsData, d => d3.max(d.values, d => d.statisticalValue));
                let min = d3.min(mapsData, d => d3.min(d.values, d => d.statisticalValue));
                let colorPalette = null;
                if (optionIsProvided(options.colors)) {
                    colorPalette = options.colors.split(':');
                    colorPalette.forEach((color) => {
                        if (!colorIsValid(color)) {
                            throw new Error('At least one of the listed colors in the provided \'data-colors\' attribute value is not a valid color unit');
                        }
                    });
                } else {
                    let colorLowest = null, colorHighest = null;
                    if (optionIsProvided(options.colorLowest)) {
                        if (!colorIsValid(options.colorLowest)) {
                            throw new Error('The provided \'data-color-lowest\' attribute value is not a valid color unit');
                        } else {
                            colorLowest = options.colorLowest;
                        }
                    } else {
                        colorLowest = defaults.colorLowest;
                    }

                    if (optionIsProvided(options.colorHighest)) {
                        if (!colorIsValid(options.colorHighest)) {
                            throw new Error('The provided \'data-color-highest\' attribute value is not a valid color unit');
                        } else {
                            colorHighest = options.colorHighest;
                        }
                    } else {
                        colorHighest = defaults.colorHighest;
                    }

                    let interpolator = d3.interpolateRgb(colorLowest, colorHighest);
                    if (optionIsProvided(options.numberOfColors)) {
                        colorPalette = d3.quantize(interpolator, options.numberOfColors);
                    } else {
                        colorPalette = d3.quantize(interpolator, defaults.numberOfColors);
                    }
                }
                let colorScale = d3.scaleQuantize()
                    .domain([min, max])
                    .range(colorPalette);

                // Add legend color palette items.
                let disableLegend = null;
                if (optionIsProvided(options.legendDisable)) {
                    disableLegend = (options.legendDisable == 'true');
                } else {
                    disableLegend = defaults.legendDisable;
                }
                if (!disableLegend) {
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
                }
                // Create one map for each year.
                mapsData.forEach((mapData, i) => {
                    // Do not render a map if the maximum number of rows
                    // specified with the option 'data-rows' is exceeded.
                    if (optionIsProvided(options.rows)) {
                        const MAXIMUM_NUMBER_OF_MAPS_TO_RENDER = (optionIsProvided(options.columns) ? options.columns : defaults.columns) * options.rows;
                        const MAP_INDEX = i + 1;
                        if (MAP_INDEX > MAXIMUM_NUMBER_OF_MAPS_TO_RENDER) {
                            return;
                        }
                    }

                    let map = mapContainer.append('div')
                        .attr('class', 'doppler-maps__map')
                        .style('display', 'inline-block')
                        .style('width', 100 / (optionIsProvided(options.columns) ? options.columns : defaults.columns) + '%');

                    let mapEl = map.node();

                    // Create HTML5 Canvas element.
                    let canvas = map.append('canvas').style('display', 'block');

                    // Create 2D rendering context.
                    let context = canvas.node().getContext('2d');

                    let path = d3.geoPath().context(context).projection(projection);
                    let bounds = path.bounds(featureCollection);
                    let aspectRatio = (bounds[1][1] - bounds[0][1]) / (bounds[1][0] - bounds[0][0]);
                    let width = null, height = null;

                    let noDataColor = null;
                    if (optionIsProvided(options.colorNoData)) {
                        if (colorIsValid(options.colorNoData)) {
                            noDataColor = options.colorNoData;
                        } else {
                            throw new Error('The provided \'data-color-no-data\' attribute value is not a valid color unit');
                        }
                    } else {
                        noDataColor = defaults.colorNoData;
                    }

                    let renderMap = () => {
                        width = parseFloat(getComputedStyle(mapEl).width);
                        height = width * aspectRatio;

                        projection.fitSize([width, height], featureCollection);
                        path.projection(projection);

                        canvas.attr('width', width).attr('height', height);

                        mapData.values.forEach((value) => {
                            context.fillStyle = (value.statisticalValue === null ? noDataColor : colorScale(value.statisticalValue));
                            context.beginPath();
                            path(value.subunit);
                            context.stroke();
                            context.fill();
                        });
                    };

                    renderMap();
                    let timeout = null;
                    window.addEventListener('resize', () => {
                        clearTimeout(timeout);
                        timeout = setTimeout(renderMap, 100);
                    });

                    // Create map label.
                    map.append('div')
                        .attr('class', 'doppler-maps__date')
                        .style('margin-top', '1em')
                        .style('font-family', optionIsProvided(options.labelFontFamily) ? options.labelFontFamily : defaults.labelFontFamily)
                        .style('font-size', optionIsProvided(options.labelFontSize) ? options.labelFontSize : defaults.labelFontSize)
                        .style('text-align', 'center')
                        .text(mapData.year);
                });
            });
    });
});
