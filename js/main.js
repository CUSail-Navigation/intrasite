// enable enter key for search
var input = document.getElementById("nav_search");
input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("search_button").click();
  }
});