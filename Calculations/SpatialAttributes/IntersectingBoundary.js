/* Summary: This expression calculates an intersecting feature in a specified layer 
(e.g., park unit, park boundary, management area/region, etc.)
*/

// Get the source features. In this section, change the item ID to the correct layer. 
// Item ID can be found in AGOL in the URL of a layer’s item details.
var agol = Portal("https://www.arcgis.com")
var fc = FeatureSetByPortalItem(agol, "dc887c3c0c0743c68261265c68a6c07f",0)
    
var fc_intersect = First(Intersects($feature, fc))

// Identifies the attribute to return. In this section, change the field name in brackets to the correct attribute in your layer.
if(!IsEmpty(fc_intersect)){
    return fc_intersect['MGMT_AREA']
}
else{
    return null
}
