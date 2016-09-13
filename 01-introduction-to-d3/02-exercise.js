/* global d3 */
(function () {
  /*
  * f
  * */
  var b = d3.select('body')

  b.append('h1')
    .text('I was promised...')
    .style('color', 'blue')
  b.append('p')
    .text('data visualisation and not text')
    .style('background-color', 'yellow')
}())
