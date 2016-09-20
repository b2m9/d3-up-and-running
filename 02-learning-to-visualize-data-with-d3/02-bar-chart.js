/* global d3 */
(function () {
  'use strict'

  var data = [
    { key: 'Glazed', value: 132 },
    { key: 'Jelly', value: 71 },
    { key: 'Holes', value: 337 },
    { key: 'Sprinkles', value: 93 },
    { key: 'Crumb', value: 78 },
    { key: 'Chocolate', value: 43 },
    { key: 'Coconut', value: 20 },
    { key: 'Cream', value: 16 },
    { key: 'Cruller', value: 30 },
    { key: 'Éclair', value: 8 },
    { key: 'Fritter', value: 17 },
    { key: 'Bearclaw', value: 21 }
  ]

  var w = 800
  var h = 450
  var leftOffset = 65
  var topOffset = 10
  var rightOffset = 10
  var bottomOffset = 20

  // Create SVG
  var svg = d3.select('#svg-container').append('svg')
    .attr('width', w)
    .attr('height', h)

  function plot (dataset, dimensions, offset) {
    // Dimensions
    var width = dimensions.w - offset.left - offset.right
    var height = dimensions.h - offset.top - offset.bottom

    // Linear scaling for X
    var scaleX = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
      return d.value
    })]).range([0, width])

    // Ordinal scaling for Y
    var scaleY = d3.scaleBand().domain(dataset.map(function (d) {
      return d.key
    })).range([0, height])

    // Colour scale
    var scaleColour = d3.scaleOrdinal(d3.schemeCategory20)
      .domain([0, dataset.length])

    // Create left axis
    var leftAxis = d3.axisLeft(scaleY)

    this.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (offset.left - 5) + ',' +
        offset.top + ')')
      .call(leftAxis)

    // Create bottom axis
    var bottomAxis = d3.axisBottom(scaleX).ticks(6)

    this.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (height + offset.top) + ')')
      .call(bottomAxis)

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
      .attr('x', 0)
      .attr('y', function (d) {
        return scaleY(d.key)
      })
      .attr('width', function (d) {
        return scaleX(d.value)
      })
      .attr('height', function () {
        return scaleY.bandwidth() - 1
      })
      .style('fill', function (d, i) {
        return scaleColour(i)
      })

    // Enter text
    text.enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', function (d) {
        return scaleX(d.value)
      })
      .attr('dx', function () {
        return -2
      })
      .attr('y', function (d) {
        return scaleY(d.key)
      })
      .attr('dy', function () {
        return scaleY.bandwidth() / 2 + 3
      })
      .text(function (d) {
        return d.value
      })
  }

  plot.call(svg, data, { w: w, h: h }, {
    top: topOffset,
    right: rightOffset,
    bottom: bottomOffset,
    left: leftOffset
  })
}())
