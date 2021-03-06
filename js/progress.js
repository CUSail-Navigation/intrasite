// the progress bar
var prog_bar = new ldBar(".main_bar", {
  "type": 'fill',
  "img": './images/BoatLogo.svg',
  "value": 0,
  "img-size": "110,110",
  "fill-background": '#e7e7e7'
});

// all members that can be assigned to a goal
var all_members;

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
 * Map an issue id to a goal object (necessary because indices may change as things
 * are added or removed)
 * @param {number} issue_id - the number associated with a goal/issue
 * @returns {Object} the object representing the desired goal
 */
function mapIssueNumToObject(issue_id) {
  let i;
  let j;
  for (i = 0; i < all_goals.length; i++) {
    if (typeof all_goals[i] !== 'undefined') {
      for (j = 0; j < all_goals[i].length; j++) {
        if (all_goals[i][j].number === issue_id) {
          return all_goals[i][j];
        }
      }
    }
  }
}

/**
 * Maps an issue number to indices within all_goals
 * @param {number} issue_id - the number associated with a goal/issue
 * @returns {Object} an objects which gives the indices
 */
function mapIssueNumToIndices(issue_id) {
  let i;
  let j;
  for (i = 0; i < all_goals.length; i++) {
    if (typeof all_goals[i] !== 'undefined') {
      for (j = 0; j < all_goals[i].length; j++) {
        if (all_goals[i][j].number === issue_id) {
          let ret_data = new Object();
          ret_data.milestone_num = i;
          ret_data.goal_num = j;
          return ret_data;
        }
      }
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
  $("html, body").animate({
    scrollTop: $('#make_new_goal').offset().top
  }, 1000);
}

/**
 * Update the milestone header (X% Complete)
 * @param {number} i - the index of the milestone
 */
function updateMilestoneHeader(i) {
  let complete_num = document.getElementById(milestone_str[i] + '_complete_num');
  let percentage = all_goals[i] ? (all_goals[i].length > 0 ? Math.floor((milestone_completed[i] * 1.0 / all_goals[i].length) * 100.0) : 0) : 0;
  complete_num.innerText = '' + percentage + '% Complete';
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
      setupNewGoalForm(null); // reset form
      var ret_data = JSON.parse(this.responseText);

      let milestone_idx = mapMilestoneStrToIdx(ret_data.milestone.title);
      if (typeof all_goals[milestone_idx] === 'undefined') {
        all_goals[milestone_idx] = new Array(1);
        all_goals[milestone_idx][0] = Object.assign({}, ret_data);
      } else {
        all_goals[milestone_idx].push(Object.assign({}, ret_data));
      }
      displayMilestone(milestone_idx);
    }
  }
  xhr.send(jsonString);
}

/**
 * Submit an update to a goal using a PATCH request
 * @param {number} issue_id - the number associated with the goal
 */
function submitGoalUpdate(issue_id) {
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

  let prev_goal = mapIssueNumToObject(issue_id);
  let prev_idx = mapIssueNumToIndices(issue_id);

  xhr = new XMLHttpRequest();
  xhr.open("PATCH", patch_url, true);
  var token = 'token ' + auth_code;
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      setupNewGoalForm(null);
      var ret_data = JSON.parse(this.responseText);

      if (ret_data.milestone.number === prev_goal.milestone.number) {
        all_goals[prev_idx.milestone_num][prev_idx.goal_num] = Object.assign({}, ret_data);
        displayMilestone(prev_idx.milestone_num);
      } else {
        all_goals[prev_idx.milestone_num].splice(prev_idx.goal_num, 1);

        let milestone_idx = mapMilestoneStrToIdx(ret_data.milestone.title);
        if (typeof all_goals[milestone_idx] === 'undefined') {
          all_goals[milestone_idx] = new Array(1);
          all_goals[milestone_idx][0] = Object.assign({}, ret_data);
        } else {
          all_goals[milestone_idx].push(Object.assign({}, ret_data));
        }

        displayMilestone(prev_idx.milestone_num);
        displayMilestone(milestone_idx);
      }
    }
  }
  xhr.send(jsonString);
}

/**
 * Mark a goal as being completed or open
 * @param {number} issue_id - the number associated with the goal
 */
function markComplete(issue_id) {
  var auth_code = getQueryVariable('auth');
  var patch_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues/';
  patch_url += issue_id;

  let goal_obj = mapIssueNumToObject(issue_id);
  let update_req = new Object();
  if (goal_obj.state.includes("open")) {
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
      const milestone_idx = mapMilestoneStrToIdx(ret_data.milestone.title);

      let goal_idx = mapIssueNumToIndices(ret_data.number);
      all_goals[goal_idx.milestone_num][goal_idx.goal_num] = Object.assign({}, ret_data);
      displayMilestone(milestone_idx);
    }
  }
  xhr.send(jsonString);
}

/**
 * Change the "add goal" form to edit an existing goal
 * @param {number} issue_id - the number associated with the goal to be updated
 */
function updateGoal(issue_id) {
  // load the current goal information into the goal form
  let goal_obj = mapIssueNumToObject(issue_id);
  setupNewGoalForm(goal_obj); // assign checkboxes
  var layout = document.getElementById('make_new_goal');
  var title = document.getElementById('goal_adder_label');
  title.innerHTML = 'Edit Goal'
  layout.style.visibility = 'visible';

  document.getElementById('goal_title_input').value = goal_obj.title;

  // set the currently assigned milestone
  let q = 'option[value="' + goal_obj.milestone.number + '"]';
  let milestone_box = document.querySelector(q);
  milestone_box.selected = true;

  document.getElementById('goal_body_input').value = goal_obj.body;

  // update the submit function
  let fun = 'submitGoalUpdate(' + issue_id + ');';
  document.getElementById('sub_new_button').setAttribute("onclick", fun);

  // scroll to view it
  $("html, body").animate({
    scrollTop: $('#make_new_goal').offset().top
  }, 1000);
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

  // add this in later
  add_html += '<p><b>Assign Team Members:</b></p>';
  add_html += '<div id="members_selector"></div>';

  add_html += '<textarea id="goal_body_input" name="body" placeholder="A couple sentences about what this goal is, what you need to do to accomplish it, etc."></textarea>';
  add_html += '<div id="inline_buttons"><button id="sub_new_button" onclick="submitNewGoal()" type="button">Submit Goal</button>';
  add_html += '<button onclick="setupNewGoalForm(null)" type="button">Cancel</button>';
  add_html += '</div></div>';
  layout.innerHTML = add_html;

  // now get the org members
  let sel_layout = document.getElementById("members_selector");
  let inner_sel = '';

  let j;
  for (j = 0; j < all_members.length; j++) {
    inner_sel += '<div id="login_checkbox">';
    inner_sel += '<input type="checkbox" id="' + all_members[j].login + '_checkbox" value="' + all_members[j].login + '" name="login_check">';
    inner_sel += '<label for="' + all_members[j].login + '_checkbox">';
    inner_sel += '<a href="' + all_members[j].html_url + '" target="_blank">' + all_members[j].login + '</a></label>';
    inner_sel += '</div>';
  }
  sel_layout.innerHTML = inner_sel;

  // if this is to setup for an edit, check the necessary boxes
  if (edit_data) {
    let k;
    for (k = 0; k < edit_data.assignees.length; k++) {
      let box_id = edit_data.assignees[k].login + '_checkbox';
      let checkbox = document.getElementById(box_id);
      if (checkbox) {
        checkbox.checked = true;
      }
    }
  }
}

/**
 * Add a header that displays the number of goals until competition
 */
function dispDaysToComp() {
  let header = document.getElementById('goal_header');
  let curDate = new Date();
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
  let total_goals = 0;
  let i;
  for (i = 0; i < all_goals.length; i++) {
    total_goals += all_goals[i] ? all_goals[i].length : 0;
  }

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
 * Requires that a milestone has at least one goal
 * @param {number} num 
 */
function displayMilestone(num) {
  var ul_layout = document.getElementById('ul_' + milestone_str[num]);
  milestone_completed[num] = 0;
  var add_html = '';

  let i;
  for (i = 0; i < all_goals[num].length; i++) {
    // add goal to milestone
    add_html += '<li id="goal_num_' + all_goals[num][i].number.toString(10) + '">';
    add_html += '<div class="goal_top" id="top_' + all_goals[num][i].toString(10) + '">';
    add_html += '<a href="' + all_goals[num][i].user.html_url + '" target="_blank">';
    add_html += '<img src="' + all_goals[num][i].user.avatar_url + '" /></a>';

    add_html += '<div class="goal_creator">';
    add_html += '<h4>' + all_goals[num][i].title + '</h4>';
    add_html += '<p class="goal_creator_tag" id="create_complete_' + all_goals[num][i].number.toString(10) + '">Created by <a href="';
    add_html += all_goals[num][i].user.html_url + '" target="_blank">';
    add_html += all_goals[num][i].user.login + '</a> on ' + parseDate(all_goals[num][i].created_at);
    if (all_goals[num][i].state.includes("closed")) {
      add_html += ' • Completed on ' + parseDate(all_goals[num][i].closed_at);
    }
    add_html += '</p></div>';

    if (all_goals[num][i].state.includes("open")) {
      add_html += '<button id="edit_button_' + all_goals[num][i].number.toString(10) + '" onclick="updateGoal(';
      add_html += all_goals[num][i].number.toString(10) + ')" ' + 'type="button">Edit Goal</button>';
      add_html += '<button id="complete_button_' + all_goals[num][i].number.toString(10) + '" onclick="markComplete(';
      add_html += all_goals[num][i].number.toString(10) + ')" type="button">Mark Complete</button>';
    } else {
      milestone_completed[num]++;
      add_html += '<button id="complete_button_' + all_goals[num][i].number.toString(10) + '" onclick="markComplete(';
      add_html += all_goals[num][i].number.toString(10) + ')" type="button">Reopen</button>';
    }
    add_html += '</div>';

    var people = '';
    var k;
    for (k = 0; k < all_goals[num][i].assignees.length; k++) {
      people += '<a href="' + all_goals[num][i].assignees[k].html_url + '" target="_blank">' + all_goals[num][i].assignees[k].login + '</a>, ';
    }
    if (all_goals[num][i].assignees.length < 1) {
      add_html += '<p class="goal_assignees">';
      people += 'No one is assigned to this goal. Edit this goal to add someone.';
    } else {
      add_html += '<p class="goal_assignees">Assigned Team Member(s): ';
      people = people.substring(0, people.length - 2);
    }
    add_html += people + '</p>';

    add_html += '<p class="goal_body"><b>' + all_goals[num][i].body + '</b></p>';

    // for comments
    add_html += '<div class="comments_layout" id="comments_layout_' + all_goals[num][i].number.toString(10);
    add_html += '"></div>';

    add_html += '</li>';
  }

  ul_layout.innerHTML = add_html;

  for (i = 0; i < all_goals[num].length; i++) {
    setCommentButton(all_goals[num][i].number, all_goals[num][i].comments);
  }

  updateMilestoneHeader(num);
  resetBar();
}

/**
 * Display all goals - THIS MUST BE CALLED BEFORE ANYTHING ELSE
 */
function displayExistingGoals() {
  var goals = document.getElementById('goals_layout');

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
    let xhr = new XMLHttpRequest();
    var get_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues';
    get_url += '?milestone=' + milestone_num[i];
    get_url += '&state=all';
    xhr.open('GET', get_url, true);
    xhr.setRequestHeader('Authorization', 'token ' + getQueryVariable('auth'));

    xhr.onload = function () {
      var ret_data = JSON.parse(this.responseText);

      if (ret_data.length > 0) {
        milestone_idx = mapMilestoneStrToIdx(ret_data[0].milestone.title);
        all_goals[milestone_idx] = new Array(ret_data.length);

        let j;
        for (j = 0; j < ret_data.length; j++) {
          all_goals[milestone_idx][j] = Object.assign({}, ret_data[j]);
        }

        displayMilestone(milestone_idx);
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

  // update the list of members
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.github.com/orgs/cusail-navigation/members', true);
  xhr.setRequestHeader('Authorization', 'token ' + getQueryVariable('auth'));

  xhr.onload = function () {
    let ret_data = JSON.parse(this.responseText);
    all_members = new Array(ret_data.length);

    let j;
    for (j = 0; j < ret_data.length; j++) {
      all_members[j] = Object.assign({}, ret_data[j]);
    }
    setupNewGoalForm();
  };

  xhr.send();
}

/**
 * Display a 'view comments' button if there are comments to view, or an 'add
 * a comment' view if there are none so far
 * @param {number} issue_id 
 * @param {number} num_comments
 */
function setCommentButton(issue_id, num_comments) {
  var layout = document.getElementById('comments_layout_' + issue_id.toString(10));
  var add_html = '';

  // if there are existing comments, display them and add an input for 
  // adding a new comment
  if (num_comments > 0) {
    add_html += '<button id="view_comments_' + issue_id.toString(10) + '" ';
    add_html += 'class="comment_button" type="button" onclick="displayComments(';
    add_html += issue_id.toString(10) + ')">View Comments</button>';
  } else {
    add_html += '<button id="view_comments_' + issue_id.toString(10) + '" ';
    add_html += 'class="comment_button" type="button" onclick="displayComments(';
    add_html += issue_id.toString(10) + ')">Add a Comment</button>';
  }
  layout.innerHTML = add_html;
}

/**
 * Display the existing comments for a specific issue and an input for a new reply
 * @param {number} issue_id 
 */
function displayComments(issue_id) {
  var get_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues/';
  get_url += issue_id + '/comments';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', get_url, true);
  xhr.setRequestHeader('Authorization', 'token ' + getQueryVariable('auth'));
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');

  xhr.onload = function () {
    var ret_data = JSON.parse(this.responseText);
    var layout = document.getElementById('comments_layout_' + issue_id.toString(10));
    var add_html = '';

    // change view to hide
    add_html += '<button id="view_comments_' + issue_id.toString(10) + '" ';
    add_html += 'class="comment_button" type="button" onclick="setCommentButton(';
    add_html += issue_id.toString(10) + ', ' + ret_data.length + ')">Hide Comments</button>';

    // existing comments
    add_html += '<div id="comments_' + issue_id.toString(10) + '">';
    let i;
    for (i = 0; i < ret_data.length; i++) {
      add_html += '<div class="comment"><div class="comment_top"><a href="';
      add_html += ret_data[i].user.html_url + '">';
      add_html += '<img src="' + ret_data[i].user.avatar_url + '" /></a>';
      add_html += '<p>Posted by <a href="' + ret_data[i].user.html_url + '">' + ret_data[i].user.login;
      add_html += '</a> on ' + parseDate(ret_data[i].created_at);
      add_html += '</p></div>';
      add_html += '<p class="comment_body"><b>' + ret_data[i].body + '</b></p></div>';
    }
    add_html += '</div>';

    // input a new comment
    add_html += '<div class="comment_adder">';
    add_html += '<textarea id="comment_input_' + issue_id.toString(10);
    add_html += '" name="comment_body" placeholder="Leave a comment..."></textarea>';
    add_html += '<button type="button" id="comment_submit_' + issue_id.toString(10);
    add_html += '" class="comment_button" ';
    add_html += 'onclick="submitComment(' + issue_id.toString(10) + ')">Reply</button>';
    add_html += '</div>';

    layout.innerHTML = add_html;
  };
  xhr.send();
}

/**
 * Hide comments for a goal (assumes that there is at least one)
 * @param {number} issue_id 
 */
function hideComments(issue_id) {
  var layout = document.getElementById('comments_layout_' + issue_id.toString(10));

  var add_html = '<button id="view_comments_' + issue_id.toString(10) + '" ';
  add_html += 'class="comment_button" type="button" onclick="displayComments(';
  add_html += issue_id.toString(10) + ')">View Comments</button>';

  layout.innerHTML = add_html;
}

/**
 * Submit a new comment and display it
 * @param {number} issue_id 
 */
function submitComment(issue_id) {
  var req_data = new Object();
  req_data.body = document.getElementById('comment_input_' + issue_id.toString(10)).value;

  var auth_code = getQueryVariable('auth');
  var jsonString = JSON.stringify(req_data);
  var post_url = 'https://api.github.com/repos/cusail-navigation/intrasite/issues/';
  post_url += issue_id + '/comments';

  xhr = new XMLHttpRequest();
  xhr.open("POST", post_url, true);
  var token = 'token ' + auth_code;
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/vnd.github.v3+json');

  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
      var ret_data = JSON.parse(this.responseText);

      // add created comment to the existing comments (if any)
      var layout = document.getElementById('comments_' + issue_id.toString(10));

      // add in the new comment
      add_html = '<div class="comment"><div class="comment_top"><a href="';
      add_html += ret_data.user.html_url + '">';
      add_html += '<img src="' + ret_data.user.avatar_url + '" /></a>';
      add_html += '<p>Posted by <a href="' + ret_data.user.html_url + '">' + ret_data.user.login;
      add_html += '</a> on ' + parseDate(ret_data.created_at);
      add_html += '</p></div>';
      add_html += '<p class="comment_body"><b>' + ret_data.body + '</b></p></div>';

      layout.innerHTML += add_html;
      document.getElementById('comment_input_' + issue_id.toString(10)).value = '';

      var button = document.getElementById('view_comments_' + issue_id.toString(10));
      button.setAttribute("onclick", 'setCommentButton(' + issue_id.toString(10) + ', 1)');
    }
  }
  xhr.send(jsonString);
}