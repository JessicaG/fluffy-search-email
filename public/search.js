$(document).ready(function() {
  var instantsearch = window.instantsearch;

  // create an instantsearch instance with our app id and api key
  var search = instantsearch({
    appId: Cookies.get('app_id'),
    apiKey: Cookies.get('search_api_key'),
    indexName: Cookies.get('index_name'),
    urlSync: true,
    searchParameters: {
      hitsPerPage: 3
    }
  });

  var emailFieldValue = ""

  function checkForCookie() {
    if (Cookies.get('email_address')) {
      return emailFieldValue = Cookies.get('email_address')
    } else {
      return null;
    }
  }

  checkForCookie()

  // //conects the search input on your page to Algolia
  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#search-box',
      placeholder: '🔎 Search for your favorite drink recipe'
    })
  );
  // adds the results of your data, in your return statement you can change what you want shown
  search.addWidget(
    instantsearch.widgets.hits({
      container: '#hits',
      hitsPerPage: 12,
      templates: {
        empty: `<div class="col-md-12" style="text-align: center;"> We didn't find any results for the search <em>\"{{query}}\"</em></div`,
        item: function(hit) {
          try {
            return `
              <div class="col-md-4" style="text-align: center;">
                <h2 class="hit-text">
                ${hit._highlightResult.strDrink.value}
                </h2>

                <img src="${hit.strDrinkThumb}" class="drink-images" data-toggle="modal" data-target="#${hit.idDrink}-drinkId">

                <!-- Modal -->
                <div class="modal fade" id="${hit.idDrink}-drinkId" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h2 class="modal-title" id="drinkLabel-${hit.idDrink}">${hit._highlightResult.strDrink.value}</h2>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>

                      <div class="modal-body">
                        <h3>👓 ${hit.strGlass}</h3>
                        <p>📝 ${hit.strInstructions}</p>
                        <ul>
                        <h3>Ingredients</h3>
                          <li>${hit.strMeasure1} ${hit.strIngredient1}</li>
                          <li>${hit.strMeasure2} ${hit.strIngredient2}</li>
                          <li>${hit.strMeasure3} ${hit.strIngredient3}</li>
                          <li>${hit.strMeasure4} ${hit.strIngredient4}</li>
                          <li>${hit.strMeasure5} ${hit.strIngredient5}</li>
                          <li>${hit.strMeasure6} ${hit.strIngredient6}</li>
                        </ul>
                      </div>

                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                      </div>

                    </div>
                  </div>
                </div>

                <!-- Email form -->
                <div class="form-group" style="padding-top: 20px">
                  <button class="btn btn-secondary" type="button" data-toggle="collapse" data-target="#collapseDrink${hit.idDrink}" aria-expanded="false" aria-controls="collapseDrink${hit.idDrink}">
                    📩 Email Me
                  </button>
                  <div class="collapse" id="collapseDrink${hit.idDrink}">
                    <form class="email-cocktail-form">
                      <div class="input-group">
                        <input type="text" class="form-control" id="email-address${hit.idDrink}" placeholder="Enter your email address" value="${emailFieldValue}">
                        <input type="hidden" class="idDrink" value="${hit.idDrink}">
                        <input type="hidden" class="nameDrink" value="${hit.strDrink}">
                        <button type="submit">Submit</button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            `;
          } catch (e) {
            console.warn("Couldn't render hit", hit, e);
            return "";
          }
        }
      }
    })
  );

  // adds pagination past the results you set on line 33
  search.addWidget(
    instantsearch.widgets.pagination({
      container: '#pagination'
    })
  );

  search.addWidget(
    instantsearch.widgets.refinementList({
      container: '#tags',
      attributeName: 'strCategory',
      operator: 'or',
      limit: 15,
    })
  );

  search.start();

  search.on('render', function() {

   $("form").each(function(index, element) {
      var drinkId = $(element).find('.idDrink').val();
       
      $(element).submit(function(event){
        event.preventDefault();
        var emailAddress = $('#email-address' + drinkId).val();
        var drinkName = $(element).find('.nameDrink').val();

        Cookies.set("email_address", emailAddress);
        
        postEmail(drinkId, emailAddress, drinkName);
      });
    });

  });

  checkForCookie()
});

  var postEmail = function(drinkId, emailAddress, drinkName) {
    var data = { drinkId: drinkId, emailAddress: emailAddress, drinkName: drinkName}; 
    $.ajax({
      type: "POST",
      url: '/email',
      data: data,
      success: function(data) {
        var form = $('div').find('#collapseDrink' + drinkId).first();
        form.removeClass('collapse in')
        form.addClass('collapse')
        $('#success_message').fadeIn()
        $('#success_message').fadeOut(3000)
      }
    });
  };
 
