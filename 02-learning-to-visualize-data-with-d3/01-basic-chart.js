/* global d3 */
(function () {
  'use strict'

  var data = [132, 75, 2, 92, 72, 11, 9, 30, 88, 100, 51]
  var w = 800
  var h = 450
  var leftOffset = 10
  var topOffset = 10
  var rightOffset = 30

  // Create SVG
  var svg = d3.select('#svg-container').append('svg')
    .attr('width', w)
    .attr('height', h)

  function plot (dataset, dimensions, offset) {
    // Dimensions
    var width = dimensions.w - offset.left - offset.right
    var height = dimensions.h - offset.top - offset.bottom

    // Scales
    var xScale = d3.scaleLinear().domain([0, d3.max(dataset)])
      .range([0, width])
    var yScale = d3.scaleLinear().domain([0, dataset.length])
      .range([0, height])

    // Create bars
    var bars = this.append('g')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')
      .selectAll('.bar').data(dataset)

    // Create text
    var text = this.append('g')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')
      .selectAll('text').data(dataset)

    // Enter bars
    bars.enter().append('rect')
      .attr('class', 'bar')
      .classed('bar--highlight', function (d, i) {
        return i % 2
      })
      .attr('x', 0)
      .attr('y', function (d, i) {
        return yScale(i)
      })
      .attr('width', function (d) {
        return xScale(d)
      })
      .attr('height', function () {
        return yScale(1) - 1
      })

    // Enter text
    text.enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', function (d) {
        return xScale(d)
      })
      .attr('dx', function () {
        return -2
      })
      .attr('y', function (d, i) {
        return yScale(i)
      })
      .attr('dy', function () {
        return yScale(1) / 2 + 3
      })
      .text(function (d) {
        return d
      })
  }

  plot.call(svg, data, { w: w, h: h }, {
    top: topOffset,
    right: rightOffset,
    bottom: 0,
    left: leftOffset
  })
}())
