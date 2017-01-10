import * as d3 from 'd3';
import * as topojson from 'topojson';
import * as projections from 'd3-geo-projection';

let width = 800, height = 600;

let createProjection = (geodata) => {
    return d3.geoAlbersUsa()
        .fitSize([width, height], topojson.feature(geodata, geodata.objects['us-states']));
};

document.addEventListener('DOMContentLoaded', () => {
    let maps = document.querySelectorAll('.doppler-maps');
    [...maps].forEach((mapEl) => {
        let map = d3.select(mapEl)
            .style('width', '100%')
            .append('canvas')
            .attr('width', width)
            .attr('height', height);

        let context = map.node().getContext('2d');

        d3.json(mapEl.dataset.geoSrc, (error, geodata) => {
            if (error) throw error;

            let path = d3.geoPath()
                .projection(createProjection(geodata))
                .context(context);

            context.beginPath();
            path(topojson.mesh(geodata));
            context.stroke();
        });
    });
});
