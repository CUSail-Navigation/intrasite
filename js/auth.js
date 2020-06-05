$(document).ready(function () {
  const login_url = 'https://github.com/login/oauth/authorize?client_id=aea1d3ebf253d278dee2';
  $.ajax({
    url: login_url,
    type: "GET",
    success: function (result) {
      console.log(result)
    },
    error: function (error) {
      console.log('Error ${error}')
    }
  })
})