// this is being weird
// $('nav').removeClass('no_scroll');
// $('.subnav').removeClass('no_scroll');

// $(window).on('scroll', function () {
//   if ($(window).scrollTop()) {
//     $('nav').addClass('scrolled');
//     $('.subnav').addClass('scrolled');
//   } else {
//     $('nav').removeClass('scrolled');
//     $('.subnav').removeClass('scrolled');
//   }
// });

function parallax(pid) {
  const p = document.getElementById(pid);

  window.addEventListener("scroll", function () {
    let offset = window.pageYOffset;
    p.style.backgroundPositionY = offset * 0.7 + "px";
  })
};