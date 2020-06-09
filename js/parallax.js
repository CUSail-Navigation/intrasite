function parallax(pid) {
  const p = document.getElementById(pid);

  window.addEventListener("scroll", function () {
    let offset = window.pageYOffset;
    p.style.backgroundPositionY = offset * 0.7 + "px";
  })
};