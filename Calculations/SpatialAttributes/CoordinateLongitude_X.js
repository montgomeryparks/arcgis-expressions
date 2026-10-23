//Script Resource
//https://www.esri.com/arcgis-blog/products/field-maps/field-mobility/common-calculated-expressions-for-arcgis-field-maps/

function MetersToLatLon(geometry) {
    if (IsEmpty(geometry)) {
        return [null, null]
    }
    var originShift = 2.0 * PI * 6378137.0 / 2.0    
    var lon = (geometry.x / originShift) * 180.0
    var lat = (geometry.y / originShift) * 180.0 
    lat = 180.0 / PI * (2.0 * Atan( Exp( lat * PI / 180.0)) - PI / 2.0)    
    return [Round(lat, 6), Round(lon, 6)]
}

// Call the function and return the latitude or longitude value
MetersToLatLon(Geometry($feature))[1]
