$(document).ready(function () {
  const login_url = 'https://github.com/login/oauth/authorize?client_id=aea1d3ebf253d278dee2';
  $.ajax({
    // url: 'https://api.github.com/repos/cusail-navigation/intrasite/issues',
    url: login_url,
    type: "GET",
    crossDomain: true,
    success: function (response) {
      var resp = JSON.parse(response)
      alert(resp.status);
    },
    error: function (xhr, status) {
      alert("error");
    }
  });
})