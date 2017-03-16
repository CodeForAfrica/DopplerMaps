# Doppler Maps

Doppler Maps is a tool based on [D3.js](https://d3js.org/) for generating lightweight, responsive multiple maps. It visualises issues and phenomena over time on a series of choropleth maps.


## Usage

```html
<div class="doppler-maps"
    data-geo-src="https://rawgit.com/CodeForAfrica/DopplerMaps/master/data/us-states-random-data/geodata-us-states.json"
    data-src="https://rawgit.com/CodeForAfrica/DopplerMaps/master/data/us-states-random-data/data-us-states.csv"
    data-columns="3"
    data-rows="2"
    data-map-projection="geoAlbersUsa"
    data-title="<b>Occurrences</b> per 100,000"
    data-number-of-colors="6"
    data-color-lowest="#e0f3db"
    data-color-highest="#43a2ca"
    data-color-no-data="#bbb">
</div>
<script src="https://cdn.jsdelivr.net/doppler-maps/1.0-beta/doppler-maps.min.js"></script>
```


## API Reference

Doppler Maps uses [data attributes](https://developer.mozilla.org/en/docs/Web/Guide/HTML/Using_data_attributes) to provide configuration options.
Listed below are required and optional data attributes you can set to configure Doppler Maps.

### data-geo-src [required]

#### Description

Value must be a path to a [TopoJSON](https://github.com/topojson/topojson-specification) file.
The TopoJSON file must have exactly **one** geometry object named `subunits` and with type `GeometryCollection`.

For example:

```javascript
{
    "type": "Topology",
    "objects": {
        "subunits": {
            "type": "GeometryCollection",
            "geometries": [
                {
                    "type": "Polygon"
                    "properties": {
                        "name": "Afghanistan"
                    },
                    "arcs": [...]
                },
                {
                    "type": "MultiPolygon",
                    "properties": {
                        "name": "Angola"
                    },
                    "arcs": [...]
                },
                {
                    "type": "Polygon",
                    "properties": {
                        "name": "Albania"
                    },
                    "arcs": [...]
                }
                ...
            ]
        }
    },
    "arcs": [...]
}
```

#### Examples

```html
data-geo-src="data/us-states-random-data/geodata-us-states.json"
data-geo-src="data/africa-malaria/geodata-africa.json"
```

### data-src [required]

#### Description

Value must be a path to a valid CSV file.
The first column of the CSV file **must** be named `location` (case-sensitive).

| location  | 2003 | 2004 | 2005 | ...  |
| --------- | ---- | ---- | ---- | ---- |
| Alabama   | 5    | 13   | 12   | ...  |
| Alaska    | 8    | 10   | 12   | ...  |
| Arizona   | 6    | 8    | 10   | ...  |
| ...       | ...  | ...  | ...  | ...  |

#### Examples

```html
data-src="data/us-states-random-data/data-us-states.csv"
data-src="data/africa-malaria/Intervention_ITN.csv"
```

### data-columns [optional]

#### Description

Value must be a positive integer.
This option sets the maximum number of columns.
If no value is specified, the default maximum number of columns is 3.

#### Examples

```html
data-columns="4"
```

### data-rows [optional]

#### Description

Value must be a positive integer.
This option sets the maximum number of rows.
If no value is specified, the default maximum number of rows is infinite.

#### Examples

```html
data-rows="2"
```

### data-map-projection [optional]

#### Description

Value must be a **function name** from the [list of map projections provided by d3-geo-projection](https://github.com/d3/d3-geo-projection#projections).
This sets the map projection to use for all maps.
If no value is specified, the default projection is the [Mercator projection](https://github.com/d3/d3-geo/blob/master/README.md#geoMercator).

#### Examples

```html
data-map-projection="geoAlbersUsa"
data-map-projection="geoRobinson"
data-map-projection="geoMercator"
```

### data-map-minimum-width [optional]

#### Description

Value must be a positive integer in pixels.
This sets the minimum width an individual map can take before the number of columns is decreased.
If no value is specified, individual maps will not be assigned a minimum width and the number of columns will remain the same for all viewport widths.

#### Examples

```html
data-map-minimum-width="90px"
```

### data-title [optional]

#### Description

Value must be a string.
It supports HTML tags such as `<b>` and `<i>`.
If no value is specified, no title is shown.

#### Examples

```html
data-title="<b>Occurrences<b> per 100,000"
```

### data-number-of-colors [optional]

#### Description

Value must be positive integer.
Doppler Maps uses this number to create the color palette.
If no value is specified, the default number of colors in the color palette is 5.

#### Examples

```html
data-number-of-colors="6"
```

### data-color-lowest [optional]

#### Description

Value must be a [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#colorunits) specifier.
Doppler Maps uses this color to create the color palette.
If no value is specified, the default lowest color of the palette is #deebf7.

#### Examples

```html
data-color-lowest="yellow"
data-color-lowest="#ff0"
data-color-lowest="rgb(255, 255, 0)"
```

### data-color-highest [optional]

#### Description

Value must be a [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#colorunits) specifier.
Doppler Maps uses this color to create the color palette.
If no value is specified, the default highest color of the palette is #3182db.

#### Examples

```html
data-color-highest="red"
data-color-highest="#f00"
data-color-highest="rgb(255, 0, 0)"
```

### data-color-no-data [optional]

#### Description

Value must be a [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#colorunits) specifier.
Doppler Maps fills geographic subunits having no associated data with this color.
If no value is specified, the default color is #c7c8c9.

#### Examples

```html
data-color-no-data="#bbb"
data-color-no-data="rgb(187, 187, 187)"
```

### data-colors [optional]

#### Description

Value must be a colon-separated list of a [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#colorunits) specifier.
This option can be used instead of `data-number-of-colors`, `data-color-lowest` and `data-color-highest`.
If no value is specified, the specified values of the attributes `data-color-lowest` and `data-color-highest` will be used to create the color palette.

#### Examples

```html
data-colors="yellow:orange:red"
data-colors="#ff0:#ffa500:#f00"
data-colors="rgb(255, 255, 0):rgb(255, 165, 0):rgb(255, 0, 0)"
data-colors="yellow:#ffa500:rgb(255, 0, 0)"
```

### data-legend-disable [optional]

#### Description

Value must be a boolean.
If no value is specified, the default value is false.

#### Examples

```html
data-legend-disable="true"
```

### data-legend-title-font-family [optional]

#### Description

Value must be a valid [CSS font family](https://developer.mozilla.org/en/docs/Web/CSS/font-family#Valid_family_names).
If no value is specified, the default legend title font family is sans-serif.

#### Examples

```html
data-legend-title-font-family="Open Sans, sans-serif"
```

### data-legend-title-font-size [optional]

#### Description

Value must be a valid [CSS font size](https://developer.mozilla.org/en/docs/Web/CSS/font-size#Possible_approaches).
If no value is specified, the default legend title font size is 16px.

#### Examples

```html
data-legend-title-font-size="18px"
data-legend-title-font-size="1.125em"
data-legend-title-font-size="1.8rem"
```

### data-legend-title-disable [optional]

#### Description

Value must be a boolean.
If not value is specified, the default value is false.

#### Examples

```html
data-legend-title-disable="true"
```

### data-label-font-family [optional]

#### Description

Value must be a valid [CSS font family](https://developer.mozilla.org/en/docs/Web/CSS/font-family#Valid_family_names).
If no value is specified, the default label font family is sans-serif.

#### Examples

```html
data-label-font-family="Open Sans, sans-serif"
```

### data-label-font-size [optional]

#### Description

Value must be a valid [CSS font size](https://developer.mozilla.org/en/docs/Web/CSS/font-size#Possible_approaches).
If no value is specified, the default label font size is 16px.

#### Examples

```html
data-label-font-size="14px"
data-label-font-size="0.875em"
data-label-font-size="1.4rem"
```


## Setup instructions

1) Clone the repository:

```
git clone https://github.com/chaficnajjar/DopplerMaps.git
cd DopplerMaps
```

2) Download dependencies:

```
npm install
```

3) Build:

```
gulp
```

4) Set up a server and watch for changes:

```
gulp serve
```


## Browser support

### Desktop browsers

+ Chrome 54 and 55.
+ Firefox 45 (ESR), 49 and 50.
+ Safari 9 and 10.
+ Edge 13 and 14.
+ Internet Explorer 11.

### Mobile browsers

+ Chrome for Android 54.
+ Chrome & Safari for iOS 9 and 10.
