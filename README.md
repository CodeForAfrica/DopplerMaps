# Doppler Maps

Doppler Maps is a tool based on D3.js for generating lightweight, responsive multiple maps. It visualises issues and phenomena over time on a series of choropleth maps.

## Usage

```html
<body>
    <div class="doppler-maps"
        data-geo-src="data/us-states-random-data/geodata-us-states.json"
        data-src="data/us-states-random-data/data-us-states.csv"
        data-columns="3"
        data-rows="2"
        data-map-projection="geoAlbersUsa"
        data-title="<b>Occurrences</b> per 100,000"
        data-number-of-colors="6"
        data-color-lowest="yellow"
        data-color-highest="red"
        data-color-no-data="#bbb">
    </div>
    <script src="dist/doppler-maps.min.js"></script>
</body>
```

```html
<body>
    <div class="doppler-maps"
        data-geo-src="data/us-states-random-data/geodata-us-states.json"
        data-src="data/us-states-random-data/data-us-states.csv"
        data-columns="3"
        data-rows="2"
        data-map-projection="geoAlbersUsa"
        data-title="<b>Occurrences</b> per 100,000"
        data-colors="yellow:orange:red"
        data-color-no-data="#bbb">
    </div>
    <script src="dist/doppler-maps.min.js"></script>
</body>
```

## API Reference

Doppler Maps uses [data attributes](https://developer.mozilla.org/en/docs/Web/Guide/HTML/Using_data_attributes) to provide configuration options. Listed below are required and optional data attributes you can set to configure Doppler Maps.


### data-geo-src [required]

#### Description

Value must be a path to a [TopoJSON](https://github.com/topojson/topojson-specification) file. The TopoJSON file must have exactly **one** geometry object named `subunits`. For example:

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
                        "name": "..."
                    },
                    "arcs": [...]
                },
                {
                    "type": "MultiPolygon",
                    "properties": {
                        "name": "..."
                    },
                    "arcs": [...]
                },
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
data-geo-src="https://d3js.org/us-10m.v1.json"
```

### data-src [required]

#### Description

Value must be a path to a valid CSV file. The first column of the CSV file **must** be named `location` (case-insensitive).

| location  | 2003 | 2004 | 2005 |
| --------- | ---- | ---- | ---- |
| Alabama   | 5    | 13   | 12   |
| Alaska    | 8    | 10   | 12   |
| Arizona   | 6    | 8    | 10   |

#### Examples

```html
data-src="data/us-states-random-data/data-us-states.csv"
```

### data-rows [optional]

#### Description

Value must be a positive integer. This option sets the maximum number of rows. If no value is specified, the maximum number of rows is infinite.

#### Examples

```html
data-rows="2"
```

### data-map-projection [optional]

#### Description

Value must be a **function name** from the [list of map projections provided by d3-geo-projection](https://github.com/d3/d3-geo-projection#projections). This sets the map projection to use for all maps.

#### Examples

```html
data-map-projection="geoAlbersUsa"
data-map-projection="geoRobinson"
data-map-projection="geoMercator"
```

### data-title [optional]

#### Description

Value must be a string. It supports html tags such as `<b>` and `<i>`.

#### Examples

```html
data-title="<b>Occurrences<b> per 100,000"
```

### data-number-of-colors [required]

#### Description

Value must be positive integer.
Doppler Maps uses this number to compute the color palette used in choropleth maps.

#### Examples

```html
data-number-of-colors="6"
```

### data-color-lowest [required]

#### Description

Value must be a [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#colorunits) specifier.
Doppler Maps uses this color to compute the color palette used in choropleth maps.

#### Examples

```html
data-color-lowest="yellow"
data-color-lowest="#ff0"
data-color-lowest="rgb(255, 255, 0)"
```

### data-color-highest [required]

#### Description

Value must be a [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#colorunits) specifier.
Doppler Maps uses this color to compute the color palette used in choropleth maps.

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

#### Examples

```html
data-color-no-data="#bbb"
data-color-no-data="rgb(187, 187, 187)"
```

### data-colors [optional]

#### Description

Value must be a colon-separated list of a [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#colorunits) specifier.
This option can be used instead of `data-number-of-colors`, `data-color-lowest` and `data-color-highest`.

#### Examples

```html
data-colors="yellow:orange:red"
data-colors="#ff0:#ffa500:#f00"
data-colors="rgb(255, 255, 0):rgb(255, 165, 0):rgb(255, 0, 0)"
data-colors="yellow:#ffa500:rgb(255, 0, 0)"
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
