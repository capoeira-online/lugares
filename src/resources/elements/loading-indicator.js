import * as nprogress from 'nprogress';
import {bindable, noView, decorators} from 'aurelia-framework';

export let LoadingIndicator = decorators(
  // don't use an aurelia view (.html)
  noView(
    // same as require statement in html
    ['nprogress/nprogress.css']
  ),
  // maps to loadingChanged()
  bindable({name: 'loading', defaultValue: false})
).on(class {
  loadingChanged(newValue){
    if (newValue) {
      nprogress.start();
    } else {
      nprogress.done();
    }
  }
});
