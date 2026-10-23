// PARAMETERS

var asset_layer_name = "Park Stormwater Facilities"

var category_to_code_abbreviation = {
  'BOARDWALK': 'BRDWALK',
  'BRIDGE': 'BRIDGE',
  'CLVT': 'CULVERT'
}

////////////////////////////////////////////////////////////////////////

// Custom function to sort the candidate source features by distance using a custom function
function sortByDistance(a, b) {
    return a['distance'] - b['distance']
}

var agol = Portal("https://www.arcgis.com")

// get feature category
var category = $feature['CATEGORY']

// Get the source features
var parks = Filter(
  FeatureSetByPortalItem(agol, "727bab07c5da4c81b88cabdf16a5cf44", 0, ['FACILITY_C'], True),
  "OWNER = 'M-NCPPC' AND STATUS = 'Existing'"
)

var subparks = FeatureSetByPortalItem(agol, "c23871e6e0fe43bc8209de00a1948fbd", 0)

var assets = FeatureSetByName($map, asset_layer_name)

// Run intersect to see if point falls within park; if not, get closest park.
var subpark_intersect = First(Intersects(subparks, $feature))
var park_intersect = First(Intersects(parks, $feature))

if(!IsEmpty(subpark_intersect)){
  var facility_code = subpark_intersect['FACILITY_C']
  var asset_match = 'MC-' + facility_code + '%'
  var park_assets = Filter(assets, 'EAM_ASSET LIKE @asset_match AND CATEGORY = @category')
}

else if(!IsEmpty(park_intersect)){
  var facility_code = park_intersect['FACILITY_C']
  var asset_match = 'MC-' + facility_code + '%'
  var park_assets = Filter(assets, 'EAM_ASSET LIKE @asset_match AND CATEGORY = @category')
}

else {
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
    if (!IsEmpty(closestFeatureWithDistance)) { 
      var facility_code = closestFeatureWithDistance['feature']['FACILITY_C']
      var park_assets = Filter(assets, 'FACILITY_C = @facility_code')
      }
    else{
      var facility_code = null
    }
}

if ($editcontext.editType == 'UPDATE') {
    // Maintain the $originalFeature field value by setting it to itself
    if (!IsEmpty($originalFeature.EAM_ASSET)) { return $originalFeature.EAM_ASSET }; 
};

if ($editContext.editType == "INSERT"){
  if (Count(park_assets)==0) {

    var assigned_numeric_id_6digittext = '000001'
    
  } else {

    // Calculate the distance between the source feature and the current location
    // Store the feature and distance as a dictionary and push it into an array
    var numeric_ids = []
    for (var f in park_assets) {
        Push( // "push" aka append numeric ID to list
          numeric_ids, 
          Number( // convert 6 digit ID from text to number
            Right( // ASSET_ID format is "MC-{park code}-SWM-{6 digit ID}""
              f.EAM_ASSET,
              6
            )
          )
        )
    }

    
    var sorted = Sort(numeric_ids)
    // Get the largest numeric ID
    var assigned_numeric_id = Pop(sorted) + 1

    var assigned_numeric_id_6digittext = When(
      assigned_numeric_id < 10, '00000' + Text(assigned_numeric_id), // if
      assigned_numeric_id < 100, '0000' + Text(assigned_numeric_id), // if else / elif in Python
      assigned_numeric_id < 1000, '000' + Text(assigned_numeric_id), // if else / elif in Python
      assigned_numeric_id < 10000, '00' + Text(assigned_numeric_id), // if else / elif in Python
      assigned_numeric_id < 100000, '0' + Text(assigned_numeric_id), // if else / elif in Python
      Text(assigned_numeric_id) // else
    )

  }

  var assign_asset_id =  'MC-' + facility_code + '-' + category_to_code_abbreviation[category] + '-' + assigned_numeric_id_6digittext

  return assign_asset_id

} 
else {

  return $feature.EAM_ASSET
}
