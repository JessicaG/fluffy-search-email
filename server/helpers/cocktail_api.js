const axios = require('axios')
const sgMail = require('@sendgrid/mail');

function fetchRecipe(body) {

  // index.getObject('myObjectID', function(err, content) {
  //    console.log(content.objectID + ": " + content.toString());
  // })
  const url = `http://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${body.subject}`
  return axios.get(url,{})
  .then(function(response){
      console.log(response)
      sendCocktail(response, body)
    })
  .catch(function(error) {
      console.log(error)
    })
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