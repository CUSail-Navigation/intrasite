// enable enter key for search
var input = document.getElementById("nav_search");
input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("search_button").click();
  }
});

// resize nav bar if necessary
$(document).ready(function () {
  if ($(window).width() < 1420) {
    document.getElementById("overall_nav").classList.add("small");
  }
});

window.onresize = (function () {
  var nav_elem = document.getElementById("overall_nav");
  if ($(window).width() < 1420 && nav_elem.classList.contains("small")) {
    nav_elem.classList.add("small");
  } else if ($(window).width() >= 1420 && nav_elem.classList.contains("small")) {
    nav_elem.classList.remove("small");
  }
});