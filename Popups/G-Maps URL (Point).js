// converts point from the Spherical Mercator EPSG:900913 to the WGS84 Datum
// i.e. converts from the projected cooridinate system to the needed geographic coordinate system

// "6378137" is the length of the semi-minor axis of the Spherical Mercator's ellipsoid
// the semi-minor axis of an ellipsiod is the geometric mean of the ellipsioid's max & min radii
// dividing by the length of the semi-minor axis standardizes the X, Y point to radians
var latRadians = (Geometry($feature).y / 6378137)

// the geodetic latitude in radians
var latGeoRadians = (2 * Atan(Exp(latRadians)) - PI / 2)
// converts radians to degrees by multiplying by "180 / PI"
var lat = Text(180 / PI * latGeoRadians)

// dividing by the length of the semi-minor axis standardizes the X, Y point to radians
var longRadians = Geometry($feature).x / 6378137
// converts radians to degrees by multiplying by "180 / PI"
var long = Text(180 / PI * longRadians)

// gives the g-maps url to the calculated lat & long
var url = 'https://www.google.com/maps/place/' + lat + '+' + long
return url