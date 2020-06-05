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
  var milestone_str = ['August 2020', 'September 2020', 'October 2020', 'November 2020', 'December 2020', 'January 2021', 'February 2021', 'March 2021', 'April 2021', 'May 2021'];
  var milestone_num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  var add_html = '';
  var i;
  for (i = 0; i < milestone_num.length; i++) {
    add_html += '<h2>' + milestone_str[i] + '</h2>';
    // make a get request for those issues
    var xhr = new XMLHttpRequest();
    var get_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues';
    get_url += '?milestone=' + milestone_num[i];
    xhr.open('GET', get_url, false); // synch is deprecated, but screw it
    xhr.setRequestHeader('Authorization', 'token ' + getQueryVariable('auth'));
    xhr.send();

    if (xhr.status === 200) {
      var ret_data = JSON.parse(xhr.responseText);

      add_html += '<ul id="goal_sublayout">';
      var j;
      for (j = 0; j < ret_data.length; j++) {
        add_html += '<li>';
        add_html += '<h3 id="goal_title">' + ret_data[j].title + '</h3>';

        add_html += '<div id="goal_creator">';
        add_html += '<img src="' + ret_data[j].user.avatar_url + '" />';
        add_html += '<h3>' + ret_data[j].user.login + '</h3>';
        add_html += '</div>';

        add_html += '<ul id="goal_assignees">';
        add_html += '<h4>Team Members</h4>';
        var k;
        console.log(ret_data[j].assignees);
        for (k = 0; k < ret_data[j].assignees; k++) {
          add_html += '<li>' + ret_data[j].assignees[k].login + '</li>';
        }
        add_html += '</ul>';

        add_html += '<p>' + ret_data[j].body + '</p>';
        add_html += '</li>';
      }
      add_html += '</ul>';
    }
  }
  goals.innerHTML = add_html;
}