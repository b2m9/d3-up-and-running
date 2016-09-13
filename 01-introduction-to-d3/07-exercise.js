/* global d3 */
(function () {
  'use strict'

  /*
  * Dataset from Scott Murray:
  * https://github.com/alignedleft/scattered-scatterplot/blob/master/06_circles.html
  * */
  var dataset = [{
    x: 5,
    y: 20,
    r: 10
  }, {
    x: 480,
    y: 90,
    r: 20
  }, {
    x: 250,
    y: 50,
    r: 15
  }, {
    x: 100,
    y: 33,
    r: 7
  }, {
    x: 330,
    y: 95,
    r: 18
  }, {
    x: 410,
    y: 12,
    r: 19
  }, {
    x: 475,
    y: 44,
    r: 25
  }, {
    x: 25,
    y: 67,
    r: 12
  }, {
    x: 85,
    y: 21,
    r: 5
  }, {
    x: 220,
    y: 88,
    r: 3
  }]

  // Create SVG
  var s = d3.select('body').append('svg')
    .attr('height', 100)
    .attr('width', 500)

  // Create circles
  s.selectAll('circle')
    .data(dataset)
    .enter().append('circle')
    .attr('cx', function (d) {
      return d.x
    })
    .attr('cy', function (d) {
      return d.y
    })
    .attr('r', function (d) {
      return d.r
    })
    .attr('fill', function () {
      var r = parseInt(Math.random() * 255)
      var g = parseInt(Math.random() * 255)
      var b = parseInt(Math.random() * 255)

      return 'rgb(' + r + ',' + g + ',' + b + ')'
    })
}())
