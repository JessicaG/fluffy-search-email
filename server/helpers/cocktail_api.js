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

function fetchRecipe(emailAddress, drinkId) {
  return index.search({query: drinkId})
  .then(response => {
    return buildRecipeEmail(response.hits[0])
  })
  .then(response => {
    return sendCocktail(response, emailAddress)
  })
  .catch((err) => {
    console.error('email sending fail from cocktail_api', err);
    response.status(500).json({ error: err });
  });
}

function buildRecipeEmail(cocktail){
  return `
  <h1>${cocktail.strDrink}</h1>
  <strong>Category:</strong>${cocktail.strCategory}
  <span>👓Glassware: ${cocktail.strGlass}</span>
  <span>Instructions: ${cocktail.strInstructions}</span>
  <img src="${cocktail.strDrinkThumb}">
  <h2>📕Instructions:</h2>
  <ul>
  <li>${cocktail.strMeasure1} ${cocktail.strIngredient1}</li>
  <li>${cocktail.strMeasure2} ${cocktail.strIngredient2}</li>
  <li>${cocktail.strMeasure3} ${cocktail.strIngredient3}</li>
  <li>${cocktail.strMeasure4} ${cocktail.strIngredient4}</li>
  <li>${cocktail.strMeasure5} ${cocktail.strIngredient5}</li>
  <li>${cocktail.strMeasure6} ${cocktail.strIngredient6}</li>
  </ul>
  `;
}

function sendCocktail(recipe, emailAdress) {
  const subject = "Your cocktail search recipe!";
  const sender = emailAdress;
  sgMail.setApiKey(process.env.SG_API_KEY);
  const msg = {
    to: sender,
    from: 'Algolia Cocktail Search',
    subject: subject,
    html: recipe,
  };
  sgMail.send(msg);
}

module.exports = {fetchRecipe, sendCocktail}