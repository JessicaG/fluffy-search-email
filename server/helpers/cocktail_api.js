// only do if not running on glitch
if (!process.env.PROJECT_DOMAIN) {
  // read environment variables (only necessary locally, not on Glitch)
  require('dotenv').config();
}
const axios = require('axios')
const sgMail = require('@sendgrid/mail');
const algoliasearch = require('algoliasearch')
const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
const index = algoliaClient.initIndex('cocktail_db');
const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_ID);

function fetchRecipe(drinkId, emailAddress = null, phoneNumber = null) {
  if (phoneNumber) {
    return index.search({ query: drinkId })
    .then(response => {
      return sendText(phoneNumber, process.env.FROM_PHONE_NUMBER, buildTextRecipe(response.hits[0]))
    })
    .catch((err) => {
      console.error('text sending fail from cocktail_api', err);
    });
  } else {
    return index.search({ query: drinkId })
    .then(response => {
      return buildRecipeEmail(response.hits[0])
    })
    .then(response => {
      return sendCocktailEmail(response.recipe, emailAddress, response.drinkName)
    })
    .catch((err) => {
      console.error('email sending fail from cocktail_api', err);
    });
  }

  
}

function fetchRecipeFromAlgoliaIndex(subject, senderEmail) {
  return index.search({query: subject})
  .then(response => {
    return randomizeDrinkSelection(response.hits)
    
  })
  .then(response => {
    return buildRecipeEmail(response)
  })
  .then(response => {
    return sendCocktail(response.recipe, senderEmail , response.drinkName)
  })
  .catch((err) => {
    console.error('email sending fail from cocktail_api', err);
  });
}

function randomizeDrinkSelection(drinksArray) {
  return randomRecipe(drinksArray)
}
function randomRecipe(drinksArray){
  var randomNumber = Math.floor(Math.random() * (drinksArray.length));
  return drinksArray[randomNumber]
}


/* SENDGRID INTEGRATION */
function sendCocktailEmail(recipe, emailAdress, drinkName) {
  const subject = `🎉 Your cocktail search recipe for ${drinkName}`;
  sgMail.setApiKey(process.env.SG_API_KEY);
  const msg = {
    to: emailAdress,
    from: 'recipes@drink.bingo',
    subject: subject,
    html: recipe,
  };
  sgMail.send(msg)
  .catch(err => console.error(`SendGrid error: ${err}`));
  return { data: msg };
}

function buildRecipeEmail(cocktail) {
  return { recipe: `
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
  `, drinkName: cocktail.strDrink };
}
function buildTextRecipe(cocktail) {
  let measurementCount = 1 // at least 1 measurement included
  while (cocktail.hasOwnProperty(`strMeasure${measurementCount}`)) {
    measurementCount += 1
  }
  let measurements = ``
  for (let i = 1; i < measurementCount; i++) {
    if (cocktail['strMeasure' + i] !== '' && cocktail['strIngredient' + i] !== '')
    measurements += `\t${cocktail['strMeasure' + i]}: ${cocktail['strIngredient' + i]}\n`
  }
  return {
    recipe: `🍸 Here is your recipe for ${cocktail.strDrink}🍸!\n\n📖 Instructions:\n${cocktail.strInstructions}\n\n🥃 Glassware:\n${cocktail.strGlass}\n\n📏 Measurements:\n${measurements}`,
    drinkName: cocktail.strDrink
  }
}

/* TWILIO INTEGRATION */
function sendText(to, from, body) {
  const msg = {
    body: body.recipe,
    from: from,
    to: to
  }
  twilioClient.messages.create(msg).then(msg => console.log(msg)).catch(err => console.error(err)).done()
}

module.exports = { fetchRecipe, fetchRecipeFromAlgoliaIndex }
