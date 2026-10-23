/* Summary: This expression calculates Location Code for a feature,
which means it calculates the finest location that the feature falls within: 
Buildings, then Park Location (SubPark), then Park Unit. 
If it does not fall within a park unit, it calculates the nearest park unit within 100 feet.
*/

// Get the source features
var agol = Portal("https://www.arcgis.com")
var parks = Filter(
  FeatureSetByPortalItem(agol, "727bab07c5da4c81b88cabdf16a5cf44", 0, ['*'], True),
  "OWNER = 'M-NCPPC' AND STATUS = 'Existing'"
)

var subparks = FeatureSetByPortalItem(agol, "c23871e6e0fe43bc8209de00a1948fbd", 0)

var buildings = FeatureSetByPortalItem(agol, " d6adf1e074d54517877319a120a62586", 0)

function sortByDistance(a, b) {
    return a['distance'] - b['distance']
}

var subparks_i = First(Intersects($feature, subparks))
var buildings_i = First(Intersects($feature, buildings))
var parks_i = First(Intersects($feature, parks))

if(!IsEmpty(buildings_i)){
  return buildings_i['BUILDING_NAME']
}
if(!IsEmpty(subparks_i) && IsEmpty(buildings_i)){
  return subparks_i['SUBPARK_NAME']
}
else if(!IsEmpty(parks) && IsEmpty(subparks_i) && IsEmpty(buildings_i)){
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
}
else{
  return null
}
