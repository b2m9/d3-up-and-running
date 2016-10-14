/* global d3 */
(function () {
  'use strict'

  var path = 'eng2-2013-14.json'

  // Dimensions
  var dim = {
    w: 700,
    h: 350
  }
  var offset = {
    left: 50,
    top: 20,
    right: 20,
    bottom: 20
  }

  var svg = init(dim, offset)
  var data = []

  // Let's load all teams!
  d3.json(path, function (err, res) {
    if (err) throw err

    data = res
    plot(svg, data, dim, offset)
  })

  function plot (ctx, data, dim, offset) {
    var scaleX = calcXScale(data, dim, offset)
    var scaleY = calcYScale(data, dim, offset)

    plotAxes(ctx, scaleX, scaleY)
    plotChart(ctx.select('.chart'), data, scaleX, scaleY)
  }

  function plotChart (ctx, data, x, y) {

  }

  function plotAxes (ctx, x, y) {

  }

  function calcXScale (data, dim, offset) {

  }

  function calcYScale (data, dim, offset) {

  }

  function init (dim, offset) {
    d3.select('body').append('h1').text('England League 2: Season 2013/14')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'bar-chart')
      .attr('class', 'bar-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (dim.h - offset.bottom) + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    return svg
  }
}())
