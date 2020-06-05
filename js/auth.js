function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');

    if (pair[0] === variable) {
      return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
    }
  }
}

var temp_code = getQueryVariable('code');
var access_url = 'https://github.com/login/oauth/access_token';
access_url += '?client_id=aea1d3ebf253d278dee2';
access_url += '?client_secret=0f1fe723b7838ce933f8eb7d93deecaeea910dba';
access_url += '?code=';
access_url += temp_code;

if (temp_code) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", access_url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () { // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log(this.responseText);
    }
  }
  xhr.send();
} else {
  // somehow bypassed, send them back
  window.location.replace('https://github.com/login/oauth/authorize?client_id=aea1d3ebf253d278dee2&redirect_uri=https://cusail-navigation.github.io/intrasite/progress_gateway');
}
