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

function fetchRecipe(emailAddress, drinkId, drinkName) {
  return index.search({query: drinkId})
  .then(response => {
    return buildRecipeEmail(response.hits[0])
  })
  .then(response => {
    return sendCocktail(response, emailAddress, drinkName)
  })
  .catch((err) => {
    console.error('email sending fail from cocktail_api', err);
    response.status(500).json({ error: err });
  });
}

function buildRecipeEmail(cocktail) {
  return `
  <div style="text-align:center">
    <h2>Instructions:</h2>
    <p>${cocktail.strInstructions}</p>
    <p><strong>Glassware: </strong>${cocktail.strGlass}</p>
    <h3>Measurements: </h3>
    <p>${cocktail.strMeasure1} ${cocktail.strIngredient1}</p>
    <p>${cocktail.strMeasure2} ${cocktail.strIngredient2}</p>
    <p>${cocktail.strMeasure3} ${cocktail.strIngredient3}</p>
    <p>${cocktail.strMeasure4} ${cocktail.strIngredient4}</p>
    <p>${cocktail.strMeasure5} ${cocktail.strIngredient5}</p>
    <p>${cocktail.strMeasure6} ${cocktail.strIngredient6}</p>
    <img src="${cocktail.strDrinkThumb}" style="width:100px;height:100px;"">
  </div>
  `;
}

function sendCocktail(recipe, emailAdress, drinkName) {
  const subject = `🎉 Your cocktail search recipe for ${drinkName}`;
  sgMail.setApiKey(process.env.SG_API_KEY);
  const msg = {
    to: emailAdress,
    from: 'recipes@drink.bingo',
    subject: subject,
    html: recipe,
  };
  sgMail.send(msg);
}

module.exports = {fetchRecipe}