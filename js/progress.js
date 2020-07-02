// the number of goals within each milestone
var milestone_goals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// the number of completed goals within each milestone
var milestone_completed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// the progress bar
var prog_bar = new ldBar(".main_bar", {
  "type": 'fill',
  "img": './images/BoatLogo.svg',
  "value": 0,
  "img-size": "110,110",
  "fill-background": '#e7e7e7'
});

/**
 * Map the name of a milestone to its index
 * @param {string} name - the name of a milestone
 * @returns {number} the index of the milestone
 */
function mapMilestoneStrToIdx(name) {
  let i;
  for (i = 0; i < milestone_str.length; i++) {
    if (name.includes(milestone_str[i])) {
      return i;
    }
  }
}

/**
 * Decodes the url to get the requested parameter (for this page, 'auth')
 * @param {string} variable - the variable name
 * @returns {string} the requested parameter
 */
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

/**
 * Parse the date given by the Github API into a prettier format
 * @param {string} date_str - something like "2020-06-05T19:13:40Z"
 * @returns {string} the date as DD/MM/YYYY, HH:MM:SS AM/PM
 */
function parseDate(date_str) {
  var date = new Date(date_str);
  return date.toLocaleString();
}

/**
 * Setup the new goal form and scroll down to view it - called by the create
 * goal button at the top of the page
 */
function makeNewGoal() {
  setupNewGoalForm(null);
  var layout = document.getElementById('make_new_goal');
  layout.style.visibility = 'visible';
  $("html, body").delay(150).animate({
    scrollTop: $('#make_new_goal').offset().top
  }, 1000);
}

/**
 * Update the milestone header (X% Complete)
 * @param {number} i - the index of the milestone
 */
function updateMilestoneHeader(i) {
  let complete_num = document.getElementById(milestone_str[i] + '_complete_num');
  let percentage = Math.floor((milestone_completed[i] * 1.0 / milestone_goals[i]) * 100.0);
  complete_num.innerText = '' + percentage + '% Complete';
}

/**
 * Move an updated goal from one milestone to another (possibly the same)
 * @param {Object} ret_data - the object representing the new goal
 * @param {string} prev_mil - the name of the previous milestone
 * @param {boolean} closed - whether the goal was previously closed
 */
function updateGoalLocation(ret_data, prev_mil, closed) {
  // remove the previous version of the goal
  var prev = document.getElementById('goal_num_' + ret_data.number.toString(10));
  prev.remove();
  const i = mapMilestoneStrToIdx(prev_mil);

  // update the number of goals in the previous milestone
  milestone_goals[i]--;
  if (closed) {
    milestone_completed[i]--;
  }
  updateMilestoneHeader(i);

  // add the goal to the new location
  addGoalToMilestone(ret_data);
}

/**
 * Add a goal to the milestone specified in its representation
 * @param {Object} ret_data - the goal object returned from the api request
 */
function addGoalToMilestone(ret_data) {
  var ul_layout = document.getElementById('ul_' + ret_data.milestone.title);
  var add_html = '';

  add_html += '<li id="goal_num_' + ret_data.number.toString(10) + '">';
  add_html += '<div class="goal_top" id="top_' + ret_data.number.toString(10) + '">';
  add_html += '<img src="' + ret_data.user.avatar_url + '" />';

  add_html += '<div class="goal_creator">';
  add_html += '<h4>' + ret_data.title + '</h4>';
  add_html += '<p id="create_complete_' + ret_data.number.toString(10) + '">Created by ';
  add_html += ret_data.user.login + ' on ' + parseDate(ret_data.created_at);
  if (ret_data.state.includes("closed")) {
    add_html += ' • Completed on ' + parseDate(ret_data.closed_at);
  }
  add_html += '</p></div>';

  const i = mapMilestoneStrToIdx(ret_data.milestone.title);
  milestone_goals[i]++;

  if (ret_data.state.includes("open")) {
    add_html += '<button id="edit_button_' + ret_data.number.toString(10) + '" onclick="updateGoal(';
    add_html += ret_data.number.toString(10) + ')" ' + 'type="button">Edit Goal</button>';
    add_html += '<button id="complete_button_' + ret_data.number.toString(10) + '" onclick="markComplete(';
    add_html += ret_data.number.toString(10) + ', ' + true + ')" type="button">Mark Complete</button>';
  } else {
    milestone_completed[i]++;
    add_html += '<button id="complete_button_' + ret_data.number.toString(10) + '" onclick="markComplete(';
    add_html += ret_data.number.toString(10) + ', ' + false + ')" type="button">Reopen</button>';
  }
  add_html += '</div>';

  var people = '';
  var k;
  for (k = 0; k < ret_data.assignees.length; k++) {
    people += ret_data.assignees[k].login + ', ';
  }
  if (ret_data.assignees.length < 1) {
    add_html += '<p class="goal_assignees">';
    people += 'No one is assigned to this goal. Edit this goal to add someone.';
  } else {
    add_html += '<p class="goal_assignees">Assigned Team Member(s): ';
    people = people.substring(0, people.length - 2);
  }
  add_html += people + '</p>';

  add_html += '<p class="goal_body"><b>' + ret_data.body + '</b></p>';
  add_html += '</li>';

  ul_layout.innerHTML += add_html;

  updateMilestoneHeader(i);
  resetBar();
}

/**
 * Submit a new goal to the Github API
 */
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

  xhr = new XMLHttpRequest();
  xhr.open("POST", post_url, true);
  var token = 'token ' + auth_code;
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
      setupNewGoalForm(null);
      var ret_data = JSON.parse(this.responseText);
      addGoalToMilestone(ret_data);
    }
  }
  xhr.send(jsonString);
}

/**
 * Submit an update to a goal using a PATCH request
 * @param {number} issue_id - the number associated with the goal
 * @param {string} prev_mil - the milestone that the goal was initially in
 * @param {boolean} closed - whether the issue was previously closed
 */
function submitGoalUpdate(issue_id, prev_mil, closed) {
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

  xhr = new XMLHttpRequest();
  xhr.open("PATCH", patch_url, true);
  var token = 'token ' + auth_code;
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      setupNewGoalForm(null);
      var ret_data = JSON.parse(this.responseText);
      updateGoalLocation(ret_data, prev_mil, closed);
    }
  }
  xhr.send(jsonString);
}

/**
 * Mark a goal as being completed or open
 * @param {number} issue_id - the number associated with the goal
 * @param {boolean} mark - true if the goal is being marked closed
 */
function markComplete(issue_id, mark) {
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

  var xhr = new XMLHttpRequest();
  xhr.open("PATCH", patch_url, true);
  var token = 'token ' + auth_code;
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      var ret_data = JSON.parse(this.responseText);
      const i = mapMilestoneStrToIdx(ret_data.milestone.title);

      // if marking closed, remove the edit button and change the text on 
      // the mark complete button to reopen, add 'completed on' annotation
      // if marking open, put back the edit button and change the text on 
      // the reopen button to mark complete, remove the 'completed on' annotation
      if (mark) {
        milestone_completed[i]++
        document.getElementById('edit_button_' + ret_data.number.toString(10)).remove();
        document.getElementById('complete_button_' + ret_data.number.toString(10)).innerText = 'Reopen';
        let fun = 'markComplete(' + ret_data.number.toString(10) + ', ' + false + ')';
        document.getElementById('complete_button_' + ret_data.number.toString(10)).setAttribute("onclick", fun);
        let compl_anno = 'Created by ' + ret_data.user.login + ' on ' + parseDate(ret_data.created_at);
        compl_anno += ' • Completed on ' + parseDate(ret_data.closed_at);
        document.getElementById('create_complete_' + ret_data.number.toString(10)).innerText = compl_anno;
      } else {
        milestone_completed[i]--;
        // remove the mark complete button so that the order will be correct
        document.getElementById('complete_button_' + ret_data.number.toString(10)).remove();
        // put back the edit button
        let edit_button = document.createElement("button");
        edit_button.setAttribute("id", 'edit_button_' + ret_data.number.toString(10));
        edit_button.setAttribute("type", "button");
        edit_button.setAttribute("onclick", 'updateGoal(' + ret_data.number.toString(10) + ')');
        edit_button.innerText = "Edit Goal";
        document.getElementById('top_' + ret_data.number.toString(10)).appendChild(edit_button);
        // put back the complete button
        let complete_button = document.createElement("button");
        complete_button.setAttribute("id", 'complete_button_' + ret_data.number.toString(10));
        complete_button.setAttribute("type", "button");
        complete_button.setAttribute("onclick", 'markComplete(' + ret_data.number.toString(10) + ', ' + true + ')');
        complete_button.innerText = "Mark Complete";
        document.getElementById('top_' + ret_data.number.toString(10)).appendChild(complete_button);
        // reset the annotation
        let compl_anno = 'Created by ' + ret_data.user.login + ' on ' + parseDate(ret_data.created_at);
        document.getElementById('create_complete_' + ret_data.number.toString(10)).innerText = compl_anno;
      }
      // update progress markers
      updateMilestoneHeader(i);
      resetBar();
    }
  }
  xhr.send(jsonString);
}

/**
 * Change the "add goal" form to edit an existing goal
 * @param {number} issue_id - the number associated with the goal to be updated
 */
function updateGoal(issue_id) {
  // load the current goal information into 
  var xhr = new XMLHttpRequest();
  var get_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues/';
  get_url += issue_id;
  xhr.open('GET', get_url, true);

  xhr.onload = function () {
    let ret_data = JSON.parse(this.responseText);

    setupNewGoalForm(ret_data); // assign checkboxes
    var layout = document.getElementById('make_new_goal');
    var title = document.getElementById('goal_adder_label');
    title.innerHTML = 'Edit Goal'
    layout.style.visibility = 'visible';

    document.getElementById('goal_title_input').value = ret_data.title;

    // set the previous milestone
    let q = 'option[value="' + ret_data.milestone.number + '"]';
    let milestone_box = document.querySelector(q);
    milestone_box.selected = true;

    document.getElementById('goal_body_input').value = ret_data.body;

    // update the submit function
    let incl = ret_data.state.includes('closed');
    let fun = 'submitGoalUpdate(' + issue_id + ', "' + ret_data.milestone.title + '", ' + incl + ');';
    document.getElementById('sub_new_button').setAttribute("onclick", fun);

    // scroll to view it
    $("html, body").delay(150).animate({
      scrollTop: $('#make_new_goal').offset().top
    }, 1000);
  };

  xhr.send();
}

/**
 * Setup or reset the "add goal" form
 * @param {Object} edit_data - the object associated with the form (if editing) or null
 */
function setupNewGoalForm(edit_data) {
  var milestone_str = ['August 2020', 'September 2020', 'October 2020', 'November 2020', 'December 2020', 'January 2021', 'February 2021', 'March 2021', 'April 2021', 'May 2021'];
  var milestone_num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  var layout = document.getElementById('make_new_goal');
  var add_html = '';

  add_html += '<h2 id="goal_adder_label">Add a New Goal</h2>';
  add_html += '<p>Note: Any member can add or edit a goal, but only an admin can delete one.</p>';

  add_html += '<div id="goal_adder_overall">';
  add_html += '<div id="goal_adder_top">';
  add_html += '<input id="goal_title_input" type="text" placeholder="New Goal Title..." autocomplete="off">';

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
    sel_layout.innerHTML = inner_sel;

    // if this is to setup for an edit, add stuff to the forms
    if (edit_data) {
      // get assignees
      let k;
      for (k = 0; k < edit_data.assignees.length; k++) {
        let box_id = edit_data.assignees[k].login + '_checkbox';
        let checkbox = document.getElementById(box_id);
        checkbox.checked = true;
      }
    }
  };

  xhr.send();
}

/**
 * Add a header that displays the number of goals until competition
 */
function dispDaysToComp() {
  let header = document.getElementById('goal_header');
  let curDate = new Date();
  let compDate = new Date("06/01/2021");
  let timeDif = compDate.getTime() - curDate.getTime();
  let dayDif = timeDif / (1000 * 3600 * 24);
  dayDif = Math.round(dayDif);
  dayDif = Math.max(0, dayDif);
  header.innerText = 'Progress Tracker • ' + dayDif + ' Days Until Competition';
}

/**
 * Update the progress bar - this is kinda finicky, but whatever
 */
function resetBar() {
  // set the main progress bar
  let total_goals = milestone_goals.reduce(function (a, b) {
    return a + b;
  }, 0);
  let total_completed = milestone_completed.reduce(function (a, b) {
    return a + b;
  }, 0);
  let val = 0;
  if (total_goals > 0) {
    val = (total_completed * 1.0 / total_goals) * 100.0;
  }
  prog_bar.set(val, true);
}

/**
 * Display all goals - THIS MUST BE CALLED BEFORE ANYTHING ELSE
 */
function displayExistingGoals() {
  var goals = document.getElementById('goals_layout');

  var ret_req = 0;
  var add_html = '';
  var i;
  for (i = 0; i < milestone_num.length; i++) {
    add_html += '<div class="milestone_progress" id="' + milestone_num[i] + '_progress"></div>';
    add_html += '<div class="goal_sublayout" id="milestone_' + milestone_str[i] + '"><ul id="ul_' + milestone_str[i] + '">';
    add_html += '</ul></div>';
  }
  goals.innerHTML = add_html;

  for (i = 0; i < milestone_num.length; i++) {
    // make a get request for those issues
    var xhr = new XMLHttpRequest();
    var get_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues';
    get_url += '?milestone=' + milestone_num[i];
    get_url += '&state=all';
    xhr.open('GET', get_url, true);
    xhr.setRequestHeader('Authorization', 'token ' + getQueryVariable('auth'));

    xhr.onload = function () {
      var ret_data = JSON.parse(this.responseText);
      milestone_goals[i] = ret_data.length;

      var j;
      for (j = 0; j < ret_data.length; j++) {
        addGoalToMilestone(ret_data[j]);
      }

      ret_req++;
      if (ret_req === milestone_num.length) {
        resetBar();
      }
    };
    xhr.send();
  }


  for (i = 0; i < milestone_num.length; i++) {
    let prog_layout = document.getElementById(milestone_num[i] + '_progress');
    add_html = '<h2>' + milestone_str[i] + '</h2>';
    if (milestone_goals[i] === 0) {
      add_html += '<h2 id="' + milestone_str[i] + '_complete_num">0% Complete</h2>';
    } else {
      let percentage = Math.floor((milestone_completed[i] * 1.0 / milestone_goals[i]) * 100.0);
      add_html += '<h2 id="' + milestone_str[i] + '_complete_num">' + percentage + '% Complete</h2>';
    }
    prog_layout.innerHTML = add_html;
  }

  dispDaysToComp();
}