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

function displayExistingGoals() {
  var goals = document.getElementById('goals_layout');
  var milestone_str = ['August 2020', 'September 2020', 'October 2020', 'November 2020', 'December 2020', 'January 2020', 'February 2020', 'March 2020', 'April 2020', 'May 2020'];
  var milestone_num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  var add_html = '';
  var i;
  for (i = 0; i < milestone_num.length; i++) {
    add_html += '<h2>' + milestone_str[i] + '</h2>';
    // make a get request for those issues

    // make and display the html
  }
  goals.innerHTML = add_html;
}