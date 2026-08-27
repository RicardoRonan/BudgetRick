(function () {
  var pref = localStorage.getItem('br_theme') || 'light'
  var dark =
    pref === 'dark' ||
    (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (dark) document.documentElement.classList.add('dark')
})()
