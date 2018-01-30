// only do if not running on glitch
if (!process.env.PROJECT_DOMAIN) {
  // read environment variables (only necessary locally, not on Glitch)
  require('dotenv').config();
}
const axios = require('axios')
const sgMail = require('@sendgrid/mail');
const algoliasearch = require('algoliasearch')
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
const index = client.initIndex('cocktail_db');

function fetchRecipe(body) {
  console.log(body)
  console.log(body.drinkId)

  index.search({query: body.drinkId}).then(res => {
    console.log("here")
  })
  // return axios.get(url,{})
  // .then(function(response){
  //     console.log(response)
  //     sendCocktail(response, body)
  //   })
  // .catch(function(error) {
  //     console.log(error)
  //   })
}

function sendCocktail(body, response) {
  const subject = body.subject;
  const sender = body.from;
  console.log("CONTENT: " + response)
  console.log("BODY: " + body)
  sgMail.setApiKey(process.env.SG_API_KEY);
  // const msg = {
  //   to: sender,
  //   from: 'test',
  //   subject: `Your recipe for ${body.subject}`,
  //   text: 'Happy mixing! 🍸',
  //   html: '<strong>',
  // };
  // sgMail.send(msg);
}

module.exports = {fetchRecipe, sendCocktail}