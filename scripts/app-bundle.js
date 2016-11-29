define('app',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function App() {
    _classCallCheck(this, App);

    this.message = 'Hello World!';
  };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('search-form',['exports', 'aurelia-fetch-client'], function (exports, _aureliaFetchClient) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SearchForm = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var SEARCH_AGAIN_CONFIRM = 'Are you sure you want to start a new search? You will lose any data that you haven\'t saved.';
  var SEARCH_RESULTS_DOWNLOAD_CONFIRM = 'Are you sure you want to download places.json?';
  var SEARCH_RESULTS_CITY_LIMIT = 1;

  var httpClient = new _aureliaFetchClient.HttpClient();

  httpClient.configure(function (config) {
    config.useStandardConfiguration().withBaseUrl('http://localhost:8080/api/').withDefaults({
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'Fetch'
      }
    });
  });

  var SearchForm = exports.SearchForm = function () {
    function SearchForm() {
      _classCallCheck(this, SearchForm);

      this.isRequesting = false;
      this.searchResults = [];
      this.searchResultsCityLimit = SEARCH_RESULTS_CITY_LIMIT;
    }

    SearchForm.prototype.getPossibleDuplicates = function getPossibleDuplicates(i, placeId) {
      var dupes = [];

      if (this.searchResults[i].possible_duplicates && this.searchResults[i].possible_duplicates.hasOwnProperty(placeId) && this.searchResults[i].possible_duplicates[placeId].length > 0) {
        dupes = this.searchResults[i].possible_duplicates[placeId];
      }

      return dupes;
    };

    SearchForm.prototype.hasPossibleDuplicates = function hasPossibleDuplicates(i, placeId) {
      return this.getPossibleDuplicates(i, placeId).length > 0;
    };

    SearchForm.prototype.requestIndex = function requestIndex(i) {
      var _this = this;

      return httpClient.fetch('search?google_api_key=' + this.googleAPIKey + '&i=' + i + '&keyword=' + this.keyword, {
        method: 'get'
      }).then(function (response) {
        return response.json();
      }).then(function (response) {
        response.city_population = response.city_population.toLocaleString();
        response.people_per_result = Math.round(response.people_per_result).toLocaleString();
        _this.searchResults.push(response);
        _this.searchResultsCount += response.result.results.length;
      });
    };

    SearchForm.prototype.submit = function submit() {
      var _this2 = this;

      var i = 0,
          doRequest = function doRequest() {
        _this2.requestIndex(i).then(function () {
          i++;

          if (i < SEARCH_RESULTS_CITY_LIMIT) {
            doRequest();
          } else {
            _this2.isRequesting = false;
          }
        }).catch(function (error) {
          _this2.isRequesting = false;
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

    SearchForm.prototype.download = function download() {
      var dataStr = void 0,
          dlAnchor = void 0;

      if (window.confirm(SEARCH_RESULTS_DOWNLOAD_CONFIRM)) {
        dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(window.JSON.stringify(this.searchResults, null, 2)), dlAnchor = window.document.getElementById('download-anchor');

        dlAnchor.setAttribute('href', dataStr);
        dlAnchor.setAttribute('download', 'places.json');
        dlAnchor.click();
      }
    };

    return SearchForm;
  }();

  ;
});
define('resources/index',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {
    config.globalResources(['./elements/loading-indicator']);
  }
});
define('resources/elements/loading-indicator',['exports', 'nprogress', 'aurelia-framework'], function (exports, _nprogress, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LoadingIndicator = undefined;

  var nprogress = _interopRequireWildcard(_nprogress);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var LoadingIndicator = exports.LoadingIndicator = (0, _aureliaFramework.decorators)((0, _aureliaFramework.noView)(['nprogress/nprogress.css']), (0, _aureliaFramework.bindable)({ name: 'loading', defaultValue: false })).on(function () {
    function _class() {
      _classCallCheck(this, _class);
    }

    _class.prototype.loadingChanged = function loadingChanged(newValue) {
      if (newValue) {
        nprogress.start();
      } else {
        nprogress.done();
      }
    };

    return _class;
  }());
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./app.css\"></require>\n  <require from=\"./search-form\"></require>\n  <h3>\n    Lugares &middot; Place Finder<br>\n    <small>search the US for places that match a keyword</small>\n  </h3>\n  <search-form></search-form>\n</template>\n"; });
define('text!search-form.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./search-form.css\"></require>\n  <form submit.trigger=\"submit()\">\n    <fieldset class=\"fieldset\">\n      <div class=\"row\">\n        <div class=\"small-3 columns\">\n          <label for=\"google-api-key\" class=\"text-right middle\">Google API Key</label>\n        </div>\n        <div class=\"small-9 columns\">\n          <input type=\"text\" id=\"google-api-key\" placeholder=\"aBc123EfG\" value.bind=\"googleAPIKey\">\n        </div>\n      </div>\n      <div class=\"row\">\n        <div class=\"small-3 columns\">\n          <label for=\"keyword\" class=\"text-right middle\">Keyword</label>\n        </div>\n        <div class=\"small-9 columns\">\n          <input type=\"text\" id=\"keyword\" placeholder=\"i.e., capoeira\" value.bind=\"keyword\">\n        </div>\n      </div>\n      <div class=\"row\">\n        <div class=\"small-9 columns float-right\">\n          <input type=\"submit\" class=\"button\" value=\"Search\">\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <loading-indicator loading.bind=\"isRequesting\"></loading-indicator>\n  <div id=\"search-results\">\n    <div class.bind=\"searchResults.length ? 'hide' : ''\" class=\"text-center\">Ready to search ${searchResultsCityLimit} cities</div>\n    <div class.bind=\"searchResults.length ? '' : 'hide'\" class=\"text-center\">\n      <p>Found ${searchResultsCount} places in ${searchResults.length} cities</p>\n      <button type=\"button\" id=\"download\" class=\"success button small\" click.trigger=\"download()\">Download Results</button>\n      <a id=\"download-anchor\" style=\"display:none\"></a>\n    </div>\n    <div repeat.for=\"c of searchResults\">\n      <hr>\n      <h4>${c.city_name} [${c.result.results.length}] <small>population ${c.city_population} (2013) &mdash; serving ${c.people_per_result} people per result</small></h4>\n      <table class=\"hover\">\n        <thead>\n          <tr>\n            <th>Name</th>\n            <th>Address</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr repeat.for=\"r of c.result.results\" id=\"place-${r.place_id}\">\n            <td>\n              ${r.name}\n              <p if.bind=\"hasPossibleDuplicates($parent.$index, r.place_id)\">\n                <small>\n                  similar:\n                  <ul>\n                    <li repeat.for=\"p of getPossibleDuplicates($parent.$index, r.place_id)\">\n                      <a href=\"#place-${r.place_id}\">${p.place2}</a>\n                    </li>\n                  </ul>\n                </small>\n              </p>\n            </td>\n            <td>\n              ${r.vicinity}\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</template>\n"; });
define('text!styles.css', ['module'], function(module) { module.exports = "#download {\n  vertical-align: baseline;\n}\n"; });
define('text!search-form.css', ['module'], function(module) { module.exports = "#download {\n  vertical-align: baseline;\n}\n"; });
define('text!app.css', ['module'], function(module) { module.exports = "body {\n  margin: 10px;\n}\n"; });
//# sourceMappingURL=app-bundle.js.map