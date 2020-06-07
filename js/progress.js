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
  var date = date_str.substring(5, 7);
  var month = date_str.substring(8, 10);
  return date + "/" + month + "/" + year;
}

function makeNewGoal() {
  setupNewGoalForm();
  var layout = document.getElementById('make_new_goal');
  layout.style.visibility = 'visible';
  $("html, body").delay(150).animate({
    scrollTop: $('#make_new_goal').offset().top
  }, 1000);
}

function submitNewGoal() {
  var auth_code = getQueryVariable('auth');
  var post_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues';

  var req = new Object();
  req.title = document.getElementById('goal_title_input').value;
  req.body = document.getElementById('goal_body_input').value;
  req.milestone = parseInt(document.getElementById('milestone_selector').value, 10);

  // add assignees
  const checkboxes = document.querySelectorAll('input[name="login_check"]:checked');
  let people = [];
  let i;
  for (i = 0; i < checkboxes.length; i++) {
    people.push(checkboxes[i].value);
  }
  req.assignees = people;

  var jsonString = JSON.stringify(req);
  console.log(jsonString);

  xhr = new XMLHttpRequest();
  xhr.open("POST", post_url, true);
  var token = 'token ' + auth_code;
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () { // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
      setupNewGoalForm();
    }
  }
  xhr.send(jsonString);
}

function submitGoalUpdate(issue_id) {
  console.log("got here...");
  var auth_code = getQueryVariable('auth');
  var patch_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues/';
  patch_url += issue_id;

  var req = new Object();
  req.title = document.getElementById('goal_title_input').value;
  req.body = document.getElementById('goal_body_input').value;
  req.milestone = parseInt(document.getElementById('milestone_selector').value, 10);

  // add assignees
  const checkboxes = document.querySelectorAll('input[name="login_check"]:checked');
  let people = [];
  let i;
  for (i = 0; i < checkboxes.length; i++) {
    people.push(checkboxes[i].value);
  }
  req.assignees = people;

  var jsonString = JSON.stringify(req);
  console.log(jsonString);

  xhr = new XMLHttpRequest();
  xhr.open("PATCH", patch_url, true);
  var token = 'token ' + auth_code;
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      setupNewGoalForm();
    }
  }
  xhr.send(jsonString);
}

// mark is either "open" or "closed"
function markComplete(issue_id, mark) {
  // submit patch here
  var auth_code = getQueryVariable('auth');
  var patch_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues/';
  patch_url += issue_id;

  let update_req = new Object();
  if (mark) {
    update_req.state = "closed";
  } else {
    update_req.state = "open";
  }

  var jsonString = JSON.stringify(update_req);
  console.log(jsonString);

  var xhr = new XMLHttpRequest();
  xhr.open("PATCH", patch_url, true);
  var token = 'token ' + auth_code;
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () { // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
      // nothing to do here
      //console.log("marked " + issue_id + " as " + mark);
    }
  }
  xhr.send(jsonString);
}

function updateGoal(issue_id) {
  console.log(issue_id);
  setupNewGoalForm();
  var layout = document.getElementById('make_new_goal');
  var title = document.getElementById('goal_adder_label');
  document.getElementById('sub_new_button').setAttribute("onclick", 'submitGoalUpdate(' + issue_id + ')');
  console.log(document.getElementById('sub_new_button').getAttribute("onclick"));
  title.innerHTML = 'Edit Goal'
  layout.style.visibility = 'visible';

  // load the current goal information into 
  var xhr = new XMLHttpRequest();
  var get_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues/';
  get_url += issue_id;
  xhr.open('GET', get_url, true);

  xhr.onload = function () {
    let ret_data = JSON.parse(this.responseText);
    document.getElementById('goal_title_input').value = ret_data.title;

    // set the previous milestone
    let q = 'option[value="' + ret_data.milestone.number + '"]';
    let milestone_box = document.querySelector(q);
    milestone_box.selected = true;

    // get assignees
    let i;
    for (i = 0; i < ret_data.assignees.length; i++) {
      let box_id = ret_data.assignees[i].login + '_checkbox';
      console.log("login box id is " + box_id);
      let checkbox = document.getElementById(box_id);
      checkbox.checked = true;
    }

    document.getElementById('goal_body_input').value = ret_data.body;

    // scroll to view it
    $("html, body").delay(150).animate({
      scrollTop: $('#make_new_goal').offset().top
    }, 1000);
  };

  xhr.send();
}

function setupNewGoalForm() {
  var milestone_str = ['August 2020', 'September 2020', 'October 2020', 'November 2020', 'December 2020', 'January 2021', 'February 2021', 'March 2021', 'April 2021', 'May 2021'];
  var milestone_num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  var layout = document.getElementById('make_new_goal');
  var add_html = '';

  add_html += '<h2 id="goal_adder_label">Add a New Goal</h2>';
  add_html += '<p>Note: Any member can add or edit a goal, but only an admin (Courtney) can delete one. It may take a few seconds for the new goal to appear (refresh the page to see it).</p>';

  add_html += '<div id="goal_adder_overall">';
  add_html += '<div id="goal_adder_top">';
  add_html += '<input id="goal_title_input" type="text" placeholder="New Goal Title...">';

  add_html += '<label for="milestone">Due Date:</label>';
  add_html += '<select id="milestone_selector" name="milestone">';
  let i;
  for (i = 0; i < milestone_num.length; i++) {
    add_html += '<option value="' + milestone_num[i] + '">' + milestone_str[i] + '</option>';
  }
  add_html += '</select></div>';

  // add this in later so it can be asynch
  add_html += '<p><b>Assign Team Members:</b></p>';
  add_html += '<div id="members_selector"></div>';

  add_html += '<textarea id="goal_body_input" name="body" placeholder="A couple sentences about what this goal is, what you need to do to accomplish it, etc."></textarea>';
  add_html += '<button id="sub_new_button" onclick="submitNewGoal()" type="button">Submit Goal</button>';
  add_html += '</div>';
  layout.innerHTML = add_html;

  // now use a get request to get the org members
  let sel_layout = document.getElementById("members_selector");
  let inner_sel = '';

  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.github.com/orgs/cusail-navigation/members', true);
  xhr.setRequestHeader('Authorization', 'token ' + getQueryVariable('auth'));

  xhr.onload = function () {
    let ret_data = JSON.parse(this.responseText);
    let j;
    for (j = 0; j < ret_data.length; j++) {
      inner_sel += '<div id="login_checkbox">';
      inner_sel += '<input type="checkbox" id="' + ret_data[j].login + '_checkbox" value="' + ret_data[j].login + '" name="login_check">';
      inner_sel += '<label for="' + ret_data[j].login + '_checkbox">' + ret_data[j].login + '</label>';
      inner_sel += '</div>';
    }

    // testing for formatting only
    test_names = ['dwightSchrute', 'jimHalpert', 'michaelScott', 'pamBeesley', 'angelaMartin', 'oscarMartinez', 'kevin', 'merideth', 'creed', 'kellyKapoor', 'ryanTheTemp', 'holly', 'stanley', 'phyllisvance'];
    for (j = 0; j < test_names.length; j++) {
      inner_sel += '<div id="login_checkbox">';
      inner_sel += '<input type="checkbox" id="' + test_names[j] + '_checkbox" value="' + test_names[j] + '" name="login_check">';
      inner_sel += '<label for="' + test_names[j] + '_checkbox">' + test_names[j] + '</label>';
      inner_sel += '</div>';
    }
    // end

    sel_layout.innerHTML = inner_sel;
  };

  xhr.send();
}

function displayExistingGoals() {
  var goals = document.getElementById('goals_layout');
  var milestone_str = ['August 2020', 'September 2020', 'October 2020', 'November 2020', 'December 2020', 'January 2021', 'February 2021', 'March 2021', 'April 2021', 'May 2021'];
  var milestone_num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  var milestone_goals = [];
  var milestone_completed = [];

  var add_html = '';
  var i;
  for (i = 0; i < milestone_num.length; i++) {
    add_html += '<div class="milestone_progress" id="' + milestone_num[i] + '_progress"></div>';

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

      milestone_goals.push(ret_data.length);
      milestone_completed.push(0);

      var j;
      for (j = 0; j < ret_data.length; j++) {
        local_complete = 0;
        add_html += '<li>';

        add_html += '<div id="goal_top">';
        add_html += '<img src="' + ret_data[j].user.avatar_url + '" />';

        add_html += '<div id="goal_creator">';
        add_html += '<h4>' + ret_data[j].title + '</h4>';
        add_html += '<p>Created by ' + ret_data[j].user.login + ' on ' + parseDate(ret_data[j].created_at);
        if (ret_data[j].state.includes("closed")) {
          add_html += ' • Completed on ' + parseDate(ret_data[j].closed_at);
        }
        add_html += '</p></div>';

        if (ret_data[j].state.includes("open")) {
          add_html += '<button onclick="updateGoal(' + ret_data[j].number.toString(10) + ')" ' + 'type="button">Edit Goal</button>';
          add_html += '<button onclick="markComplete(' + ret_data[j].number.toString(10) + ', ' + true + ')" type="button">Mark Complete</button>';
        } else {
          milestone_completed[i]++;
          add_html += '<button onclick="markComplete(' + ret_data[j].number.toString(10) + ', ' + false + ')" type="button">Reopen</button>';
        }
        add_html += '</div>';

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

        add_html += '<p id="goal_body"><b>' + ret_data[j].body + '</b></p>';
        add_html += '</li>';
      }
      add_html += '</ul></div>';
    }
  }
  goals.innerHTML = add_html;

  for (i = 0; i < milestone_num.length; i++) {
    let prog_layout = document.getElementById(milestone_num[i] + '_progress');
    add_html = '<h2>' + milestone_str[i] + '</h2>';
    add_html += '<div class="prog_bar_and_label>"';
    if (milestone_goals[i] === 0) {
      add_html += '<progress class="milestone_bar" value="0" max="100"></progress>';
      add_html += '<h2>0% Complete</h2>';
    } else {
      add_html += '<progress class="milestone_bar" value="';
      add_html += milestone_completed[i];
      add_html += '" max="';
      add_html += milestone_goals[i];
      add_html += '"></progress>';

      let percentage = Math.floor((milestone_completed[i] * 1.0 / milestone_goals[i]) * 100.0);
      add_html += '<h2>' + percentage + '% Complete</h2>';
    }
    add_html += '</div>';
    prog_layout.innerHTML = add_html;
  }

  let main_prog = document.getElementById('main_goal_progress');
  let total_goals = milestone_goals.reduce(function (a, b) {
    return a + b;
  }, 0);
  let total_completed = milestone_completed.reduce(function (a, b) {
    return a + b;
  }, 0);

  if (total_goals === 0) {
    main_prog.max = 100;
    main_prog.value = 0;
    document.getElementById('main_prog_label').innerText = '0% Complete';
  } else {
    main_prog.max = total_goals;
    main_prog.value = total_completed;
    let percentage = Math.floor((total_completed * 1.0 / total_goals) * 100.0);
    document.getElementById('main_prog_label').innerText = '' + percentage + '% Complete';
  }

  // set the number of days until competition
  let header = document.getElementById('days_to_comp');
  let curDate = new Date();
  let compDate = new Date("06/01/2021");
  let timeDif = compDate.getTime() - curDate.getTime();
  let dayDif = timeDif / (1000 * 3600 * 24);
  dayDif = Math.round(dayDif);
  dayDif = Math.max(0, dayDif);
  header.innerText = '' + dayDif + ' Days Until Competition';

  var load_icon = document.getElementById('loadIcon');
  load_icon.style.visibility = 'hidden';
}