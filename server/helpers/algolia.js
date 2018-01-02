// only do if not running on glitch
if (!process.env.PROJECT_DOMAIN) {
  // read environment variables (only necessary locally, not on Glitch)
  require('dotenv').config();
}

const algoliasearch = require('algoliasearch');

var algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
var algoliaIndex = algoliaClient.initIndex("movie-actors");  

  // use axios for api calls
const axios = require('axios');

function indexData(data_url){
  return axios.get(data_url,{})
  .then(function(response){
      return dataToAlgoliaObject(response.data)
    })
  .then(function(response){
     sendDataToAlgolia(response)
  })
  .then(function(response){
    return
  })
  .catch(function(error) {
      console.warn(error)
    })
}

function dataToAlgoliaObject(data_points){
  var algoliaObjects = [];
  
  for (var i = 0; i < data_points.length; i++) {
    var data_point = data_points[i];
    var algoliaObject = {
        objectID: data_point.objectID,
        name: data_point.name,
        rating: data_point.rating,
        image_path: data_point.image_path,
        alternative_name: data_point.alternative_name
      };
    algoliaObjects.push(algoliaObject);
  }
  
  return sendDataToAlgolia(algoliaObjects);
}

function configureAlgoliaIndex(){
  algoliaIndex.setSettings({
    searchableAttributes: [
      'name'
    ],
    attributesToHighlight: [
      'name'
    ],
    customRanking: [
      'desc(rating)'
    ],
    attributesToRetrieve: [
      'name', 
      'rating',
      'image_path'
    ]
  });
}
function sendDataToAlgolia(algoliaObjects){
  algoliaIndex.addObjects(algoliaObjects, function(err, content) {
  })
}

module.exports = {indexData}
