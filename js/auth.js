$(document).ready(function () {
  const login_url = 'https://github.com/login/oauth/authorize?client_id=aea1d3ebf253d278dee2';
  $.get(
    login_url, function (data, status) {
      console.log('${data}')
    }
  )
})