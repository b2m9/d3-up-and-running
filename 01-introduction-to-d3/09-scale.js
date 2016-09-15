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

  var w = 500
  var h = 100

  // Create linear scales
  var xLinear = d3.scaleLinear()
    .domain([0, d3.max(dataset, function (d) { return d.x })])
    .range([0, w])
  var yLinear = d3.scaleLinear()
    .domain([0, d3.max(dataset, function (d) { return d.y })])
    .range([0, h])

  // Create SVG
  var s = d3.select('body').append('svg')
    .attr('height', h)
    .attr('width', w)

  // Create circles
  s.selectAll('circle')
    .data(dataset)
    .enter().append('circle')
      .attr('cx', function (d) {
        return xLinear(d.x)
      })
      .attr('cy', -30)
      .attr('r', 3)
      .attr('fill', function () {
        var r = parseInt(Math.random() * 255)
        var g = parseInt(Math.random() * 255)
        var b = parseInt(Math.random() * 255)

        return 'rgb(' + r + ',' + g + ',' + b + ')'
      })
    .transition()
      .delay(function (d, i) {
        return i * 25
      })
      .duration(750)
      .attr('cy', function (d) {
        return yLinear(d.y)
      })
      .attr('r', function (d) {
        return d.r
      })
}())
