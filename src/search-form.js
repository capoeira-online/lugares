import {HttpClient} from 'aurelia-fetch-client';

const SEARCH_AGAIN_CONFIRM = 'Are you sure you want to start a new search? You will lose any data that you haven\'t saved.';
const SEARCH_RESULTS_DOWNLOAD_CONFIRM = 'Are you sure you want to download places.json?';
const SEARCH_RESULTS_CITY_LIMIT = 1;

let httpClient = new HttpClient();

httpClient.configure(config => {
  config
    .useStandardConfiguration()
    .withBaseUrl('http://localhost:8080/api/')
    .withDefaults({
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'Fetch'
      }
    });
});

export class SearchForm {
  isRequesting = false;
  searchResults = [];
  searchResultsCount;
  googleAPIKey;
  keyword;

  searchResultsCityLimit = SEARCH_RESULTS_CITY_LIMIT;
  
  getPossibleDuplicates(i, placeId) {
    let dupes = [];

    if (this.searchResults[i].possible_duplicates &&
        this.searchResults[i].possible_duplicates.hasOwnProperty(placeId) &&
        this.searchResults[i].possible_duplicates[placeId].length > 0)
    {
      dupes = this.searchResults[i].possible_duplicates[placeId];
    }

    return dupes;
  };

  hasPossibleDuplicates(i, placeId) {
    return this.getPossibleDuplicates(i, placeId).length > 0;
  };

  requestIndex(i) {
    return httpClient
      .fetch('search?google_api_key=' + this.googleAPIKey + '&i=' + i + '&keyword=' + this.keyword, {
        method: 'get'
      })
      .then(response => response.json())
      .then(response => {
        response.city_population = response.city_population.toLocaleString();
        response.people_per_result = Math.round(response.people_per_result).toLocaleString();
        this.searchResults.push(response);
        this.searchResultsCount += response.result.results.length;
      });
  };

  submit() {
    let i = 0,
        doRequest = () => {
          this.requestIndex(i)
            .then(() => {
              i++;

              if (i < SEARCH_RESULTS_CITY_LIMIT) {
                doRequest();
              } else {
                this.isRequesting = false;
              }
            })
            .catch(error => {
              this.isRequesting = false;
            });
        };

    if (!this.googleAPIKey) {
      alert('Please enter a Google API Key to use for your search.');
      return;
    }

    if (!this.keyword) {
      alert('Please enter a keyword to to use for your search.');
      return;
    }

    if (this.searchResults.length > 0 && !window.confirm(SEARCH_AGAIN_CONFIRM)) {
      return;
    }

    if (this.isRequesting === false) {
      this.isRequesting = true;
      this.searchResults = [];
      this.searchResultsCount = 0;
      doRequest();
    }
  };

  download() {
    let dataStr,
        dlAnchor;

    if (window.confirm(SEARCH_RESULTS_DOWNLOAD_CONFIRM)) {
      dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(window.JSON.stringify(this.searchResults, null, 2)),
      dlAnchor = window.document.getElementById('download-anchor');

      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', 'places.json');
      dlAnchor.click();
    }
  };
};
