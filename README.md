# Doppler Maps

...

## Usage

```
<body>
    <div class="doppler-maps"
        data-geo-src="..."
        data-src="..."
        data-rows="..."
        data-columns="..."
        data-map-projection="..."
        data-legend-title="...">
    </div>
    <script src="..."><script>
</body>
```

### GeoJSON file

...

### CSV file

Doppler Maps reads data from a CSV file. The first column of the CSV file **must** be named `Geographic Administrative Unit`.

| Geographic Administrative Unit | 2003 | 2004 | 2005 |
| ------------------------------ | ---- | ---- | ---- |
| Alabama                        | 5    | 13   | 12   |
| Alaska                         | 8    | 10   | 12   |
| Arizona                        | 6    | 8    | 10   |


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


## License

All rights reserved.
