// $(document).ready(function () {
//   const login_url = 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/authorize?client_id=aea1d3ebf253d278dee2&redirect_uri=https://cusail-navigation.github.io/intrasite/progress2020-2021';
//   $.ajax({
//     url: login_url,
//     type: "GET",
//     crossDomain: true,
//     success: function (response) {
//       console.log(response);
//     },
//     error: function (xhr, status) {
//       alert(":(");
//     }
//   });
// })

window.location.replace('https://github.com/login/oauth/authorize?client_id=aea1d3ebf253d278dee2&redirect_uri=https://cusail-navigation.github.io/intrasite/progress2020-2021');