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
    placeholder: 'Search for your favorite drink recipe'
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
                  <h3 class="hit-text">${hit._highlightResult.strDrink.value}</h3>
                  <img src="${hit.strDrinkThumb}" height="50" width="50">
                </p>
                <p>
                  Category: 🤹‍ ${hit.strCategory}
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

  search.start();
});