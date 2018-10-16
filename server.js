const express = require('express');
const app = express();
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()
const cocktailApi = require('./server/helpers/cocktail_api')

const dataUrl = "https://raw.githubusercontent.com/algolia/datasets/master/movies/actors.json"

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

nunjucks.configure('views', {
  express: app,
  noCache: true
});

// create index route
app.get('/', (request, response) => {
  response.send(nunjucks.render('index.html', getTemplateContext(request)));
});

app.post('/email', upload.any(), function (request, response) {
  let formData = request.body;
  cocktailApi.fetchRecipe(formData.emailAddress, formData.drinkId, formData.drinkName).then(() => {
    response.sendStatus(200)
  }).catch((err) => {
    console.error('email send fail from server', err);
    response.status(500).json({ error: err });
  });
});

app.post('/parse', upload.fields([]), function (req, res) { 
  console.log("FROM: " + req.body.from);  
  console.log("BODY TEXT: " + req.body.text); 
  console.log("SUBJECT: " + req.body.subject);  
  
  return cocktailApi.fetchRecipeFromAlgoliaIndex(req.body, req.body.from)
    .catch(error => console.log(error) || res.status(500).send(error))  
    .then(response => res.json(response.data))  
})

function getTemplateContext(request) {
  return {
    algolia: {
      index_name: "cocktail_db",
      app_id: process.env.ALGOLIA_APP_ID,
      search_api_key: process.env.ALGOLIA_SEARCH_API_KEY
    },
    data: {
      algolia_env: checkAlgoliaEnvKeys()
    }
  };
}

function checkAlgoliaEnvKeys() {
  if (process.env.ALGOLIA_APP_ID &&
      process.env.ALGOLIA_ADMIN_API_KEY &&
      process.env.ALGOLIA_SEARCH_API_KEY) {
    return true;
  } else {
    console.warn('One or more Algolia environment variables missing.');
    return null;
  }
}

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});