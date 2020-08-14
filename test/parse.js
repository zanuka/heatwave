module.exports = function (markup) {
  const d = document.createElement('div')
  d.innerHTML = markup.trim()
  return d.firstChild
}
