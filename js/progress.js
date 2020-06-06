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

function parseDate(date_str) {
  // input is something like "2020-06-05T19:13:40Z"
  var year = date_str.substring(0, 4);
  var month = date_str.substring(5, 7);
  var date = date_str.substring(8, 10);
  return date + "/" + month + "/" + year;
}

function makeNewGoal() {
  var layout = document.getElementById('make_new_goal');
  layout.style.visibility = 'visible';
  $("html, body").delay(2000).animate({
    scrollTop: $('"make_new_goal"').offset().top
  }, 2000);
}

function setupNewGoalForm() {
  //var layout = document.getElementById()
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
    get_url += '&state=all';
    xhr.open('GET', get_url, false); // synch is deprecated, but screw it
    xhr.setRequestHeader('Authorization', 'token ' + getQueryVariable('auth'));
    xhr.send();

    if (xhr.status === 200) {
      var ret_data = JSON.parse(xhr.responseText);

      add_html += '<div id="goal_sublayout"><ul>';
      var j;
      for (j = 0; j < ret_data.length; j++) {
        add_html += '<li>';

        add_html += '<div id="goal_top">';
        add_html += '<img src="' + ret_data[j].user.avatar_url + '" />';

        add_html += '<div id="goal_creator">';
        add_html += '<h4>' + ret_data[j].title + '</h4>';
        add_html += '<p>Created by ' + ret_data[j].user.login + ' on ' + parseDate(ret_data[j].created_at);
        if (ret_data[j].state.includes("closed")) {
          add_html += ' • Completed on ' + parseDate(ret_data[j].closed_at);
        }
        add_html += '</p>';
        add_html += '</div></div>';

        var people = '';
        var k;
        for (k = 0; k < ret_data[j].assignees.length; k++) {
          people += ret_data[j].assignees[k].login + ', ';
        }
        if (ret_data[j].assignees.length < 1) {
          add_html += '<p id="goal_assignees">';
          people += 'No one is assigned to this goal. Edit this goal to add someone.';
        } else {
          add_html += '<p id="goal_assignees">Assigned Team Members: ';
          people = people.substring(0, people.length - 2);
        }
        add_html += people + '</p>';

        add_html += '<p><b>' + ret_data[j].body + '</b></p>';
        add_html += '<button type="button">Edit Goal</button>';
        add_html += '</li>';
      }
      add_html += '</ul></div>';
    }
  }
  goals.innerHTML = add_html;
  var load_icon = document.getElementById('loadIcon');
  load_icon.style.visibility = 'hidden';
}