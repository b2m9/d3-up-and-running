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
  var leftOffset = 60
  var topOffset = 20
  var rightOffset = 20
  var bottomOffset = 80

  // Create SVG
  var svg = d3.select('#svg-container').append('svg')
    .attr('width', w)
    .attr('height', h)

  function plot (dataset, dimensions, offset) {
    // Dimensions
    var width = dimensions.w - offset.left - offset.right
    var height = dimensions.h - offset.top - offset.bottom

    // Ordinal scaling for X
    var scaleX = d3.scaleBand().domain(dataset.map(function (d) {
      return d.key
    })).range([0, width])

    // Linear scaling for Y
    var scaleY = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
      return d.value
    })]).range([height, 0])

    // Colour scale
    var scaleColour = d3.scaleOrdinal(d3.schemeCategory20)
      .domain([0, dataset.length])

    // Create left axis, horizontal grid lines, and label
    var leftAxis = d3.axisLeft(scaleY).ticks(6)
    var leftGrid = d3.axisLeft(scaleY)
      .tickSize(width)
      .tickFormat('')

    this.append('g')
      .attr('class', 'y grid')
      .attr('transform', 'translate(' + (width + offset.left) + ',' +
        offset.top + ')')
      .call(leftGrid)

    this.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        offset.top + ')')
      .call(leftAxis)

    this.select('.y.axis')
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .style('fill', '#000')
      .attr('transform', 'translate(' + -offset.left * 0.67 + ',' +
        height / 2 + ') rotate(-90)')
      .text('Units sold')

    // Create bottom axis and label
    var bottomAxis = d3.axisBottom(scaleX)

    this.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (height + offset.top) + ')')
      .call(bottomAxis)
        .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', -6)
          .attr('dy', 6)
          .attr('transform', 'rotate(-45)')

    this.select('.x.axis')
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .style('fill', '#000')
      .attr('transform', 'translate(' + width / 2 + ',' +
        offset.bottom * 0.75 + ')')
      .text('Donut type')

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
      .attr('x', function (d) {
        return scaleX(d.key) + 1
      })
      .attr('y', function (d) {
        return scaleY(d.value)
      })
      .attr('width', function () {
        return scaleX.bandwidth() - 1
      })
      .attr('height', function (d) {
        return height - scaleY(d.value)
      })
      .style('fill', function (d, i) {
        return scaleColour(i)
      })

    // Enter text
    text.enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', function (d) {
        return scaleX(d.key)
      })
      .attr('dx', function () {
        return scaleX.bandwidth() / 2
      })
      .attr('y', function (d) {
        return scaleY(d.value)
      })
      .attr('dy', function () {
        return -3
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
