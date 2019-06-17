/*
mapboxgl.accessToken = 'pk.eyJ1IjoiYm9naW5kIiwiYSI6ImNqbDBmaDdybDE0YjEza3FreHFucmJkODIifQ.XzpjwjmOJ1XEvg_TZjqydg';
var map = new mapboxgl.Map({
        style: 'mapbox://styles/mapbox/light-v10',
        center: [34.7833, 32.0680],
        zoom: 15.5,
        //pitch: 45,
        //bearing: -17.6,
        container: 'map'
    });
*/ 
var description = '<div id="pop"></div>';
var nominatim_url = '';
var dataUrl = "https://gisn.tel-aviv.gov.il/arcgis/rest/services/WM/BuildingsWM/MapServer/0/query?where=OBJECTID+%3E+0+&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson"

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: {
        "version": 8,
        "sources": {
            "raster-tiles": {
                "type": "raster",
                "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "simple-tiles",
            "type": "raster",
            "source": "raster-tiles",
            "minzoom": 0,
            "maxzoom": 22
        }]
    },
    center: [34.7833, 32.0680], // starting position
    zoom: 10 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());


// The 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function() {
    // Insert the layer beneath any symbol layer.

    /*var wifi = $.ajax({
        url: nominatim_url,
        dataType: "json",
        success: function(data){console.log(data)},
        error: function(xhr) {
            alert(xhr.statusText)
        }
    })

    $.when(wifi).done(function(){
        map.addSource('wifi-points', {
            type: 'json',
            data: wifi.responseJSON
        });
        map.addLayer({
            'id': 'wifi',
            'source': 'wifi-points'
        }, labelLayerId)
    })*/
    

esriGeom = $.getJSON(url, function(data){
gJ = ArcgisToGeojsonUtils.arcgisToGeoJSON(data)
        
map.addSource('ta_buildings', {
        type: 'geojson',
        data: gJ
    });
         var layers = map.getStyle().layers;
    
    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }
    
    

    map.addLayer({
        'id': '3d-buildings',
        'source': 'ta_buildings',
        //'source-layer': 'ta_buildings',
        //'filter': ['==', 'gova2009', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 13,
        'paint': {
            'fill-extrusion-color': '#aaa',
            
            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "gova2009"]
            ],
            'fill-extrusion-base': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
    }
    }, labelLayerId);

    map.addLayer({
        'id': '3d-buildings-selected',
        'source': 'ta_buildings',
        //'source-layer': 'ta_buildings',
        "filter": ["in", "fid", ""],
        'type': 'fill-extrusion',
        'minzoom': 13,
        'paint': {
            'fill-extrusion-color': '#802000',
            
            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "gova2009"]
            ],
            'fill-extrusion-base': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
    }
    }, labelLayerId);
})    


   

    map.on('click', '3d-buildings', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        
        nominatim_url = "https://nominatim.openstreetmap.org/reverse?format=json&lat="+e.lngLat["lat"]+"&lon="+e.lngLat["lng"]+"&zoom=18&addressdetails=1"
        //res = $.getJSON(nominatim_url)
        var res = $.ajax({
            url: nominatim_url,
            dataType: "json",
            success: function(data){console.log(data.display_name)},
            error: function(xhr) {
                alert(xhr.statusText)
            }
        })
        //address = res.responseJSON.display_name
        //console.log(e.features[0].geometry.coordinates[0].slice())
        
        

        var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
        var features = map.queryRenderedFeatures(bbox, { layers: ['3d-buildings'] });
        var filter = features.reduce(function(memo, feature) {
            memo.push(feature.properties.fid);
            return memo;
            }, ['in', 'fid']);
             
        map.setFilter("3d-buildings-selected", filter);
        //console.log(e.lngLat)
        nominatim_url = "https://nominatim.openstreetmap.org/reverse?format=json&lat="+e.lngLat["lat"]+"&lon="+e.lngLat["lng"]+"&zoom=18&addressdetails=1"
        //res = $.getJSON(nominatim_url).done().then(function(){
        var popup_coords = e.lngLat
        console.log(popup_coords)
        var popup_feature = e.features[0]
        console.log(popup_feature)
        $.when(res,popup_coords,popup_feature ).done(function(){
            address = res.responseJSON.display_name
            console.log(address)
            description = "<div id=pop><b>Height 2009</b>: " + popup_feature.properties.gova2009 + "m<br>"+
                           "<b>Number of floors</b>: " + popup_feature.properties.ms_komot + "<br>"+
                           "<b>OSM Address</b>: "+ address + "</div>";
            
            console.log(description)

            return description
        }).then(function(){
            new mapboxgl.Popup()
                           .setLngLat(popup_coords)
                           .setHTML(description)
                           .addTo(map);
            
            $("#pop").html(description)
        })
        
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        

        

        });
    
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', '3d-buildings', function () {
    map.getCanvas().style.cursor = 'pointer';
    });
    
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', '3d-buildings', function () {
    map.getCanvas().style.cursor = '';
    });


});



var toggleableLayerIds = [ '3d-buildings' ];
 
for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];
 
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;
 
    link.onclick = function (e) {
            var clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();
        
        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
        
        if (visibility === 'visible') {
        map.setLayoutProperty(clickedLayer, 'visibility', 'none');
        this.className = '';
        } else {
        this.className = 'active';
        map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };
    
    var layers = document.getElementById('menu');
    layers.appendChild(link);
}
