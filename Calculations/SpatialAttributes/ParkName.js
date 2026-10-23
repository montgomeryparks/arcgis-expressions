/* Summary: This expression calculates Park Name for a feature:
First, calculating the park name if it intersects with one.
If it does not fall within a park unit, it calculates the nearest park unit within 100 feet.
*/

// Custom function to sort the candidate source features by distance using a custom function
function sortByDistance(a, b) {
    return a['distance'] - b['distance']
}

// Get the source features
var agol = Portal("https://www.arcgis.com")

// Get the source features
var parks = Filter(
  FeatureSetByPortalItem(agol, "727bab07c5da4c81b88cabdf16a5cf44", 0, ['*'], True),
  "OWNER = 'M-NCPPC' AND STATUS = 'Existing'"
)

// Run intersect to see if point falls within park; if not, get closest park.
if(Intersects(parks, $feature) == 1){
    return parks['PARK_NAME']
}
else{
    // Buffer the current location and intersect with source features
    var bufferedLocation = Buffer($feature, 100, 'feet')
    var source_candidates = Intersects(parks, bufferedLocation)
    
    // Calculate the distance between the source feature and the current location
    // Store the feature and distance as a dictionary and push it into an array
    var featuresWithDistances = []
    for (var f in source_candidates) {
        Push(featuresWithDistances, 
            {
                'distance': Distance($feature, f, 'feet'),
                'feature': f
            }
        )
    }
    

    var sorted = Sort(featuresWithDistances, sortByDistance)
    // Get the closest feature
    var closestFeatureWithDistance = First(sorted)
    // If there was no feature, return null
    if (IsEmpty(closestFeatureWithDistance)) { return null }

    // Return the source field value
    return closestFeatureWithDistance['feature']['PARK_NAME']
}
