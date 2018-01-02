$(document).ready(function() {
  var instantsearch = window.instantsearch;

  // create an instantsearch instance with our app id and api key
  var search = instantsearch({
    appId: window.glitchApp.algolia.app_id,
    apiKey: window.glitchApp.algolia.search_api_key,
    indexName: window.glitchApp.algolia.index_name,
    urlSync: true,
    searchParameters: {
      hitsPerPage: 3
    }
  });

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
                  <p>
                    <div class="form-group">
                      <h2 class="hit-text">
                      ${hit._highlightResult.strDrink.value}
                        <span type="checkbox" class="heart fa fa-heart-o" value=${hit.idDrink}></span>
                      </h2>
                      <img src="${hit.strDrinkThumb}" class="drink-images">
                    </p>
                  <p>
                  <p>
                    <button class="btn btn-secondary drink-details" type="button" data-toggle="collapse" data-target="#collapseDrink${hit.idDrink}" aria-expanded="false" aria-controls="collapseDrink${hit.idDrink}">
                      😋 Drink Details
                    </button>
                    <div class="collapse" id="collapseDrink${hit.idDrink}">
                      <h2>👓 ${hit.strGlass}</h2>
                      <li>📝 ${hit.strInstructions}</li>
                    <ul>
                    <h2>Ingredients</h2>
                      <li>${hit.strMeasure1} ${hit.strIngredient1}</li>
                      <li>${hit.strMeasure2} ${hit.strIngredient2}</li>
                      <li>${hit.strMeasure3} ${hit.strIngredient3}</li>
                      <li>${hit.strMeasure4} ${hit.strIngredient4}</li>
                      <li>${hit.strMeasure5} ${hit.strIngredient5}</li>
                      <li>${hit.strMeasure6} ${hit.strIngredient6}</li>
                    </ul>
                    </div>
                  </div>
                </p>
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
      var objectId = $(element).find('.object-id').first().val();
      
      $(element).submit(function(event){
        var emailAddress = $('#email-address' + objectId).val();
        event.preventDefault(); 
        postEmail(objectId, emailAddress);
      });
    });

   $(".heart.fa").click(function() {
    $(this).toggleClass("fa-heart fa-heart-o");
    $(document.getElementById("email-drink-form")).show();
    // take values of checkboxed send with form 
    console.log($(this).attr('value'));
    });
  });

});

  var postEmail = function( objectId, emailAddress) {
    data = { objectId: objectId, emailAddress: emailAddress};    

    $.post({
      url: '/email',
      contentType: 'application/json',
      success: function(data) {
        console.log(data)
      }
    });
  };

 
