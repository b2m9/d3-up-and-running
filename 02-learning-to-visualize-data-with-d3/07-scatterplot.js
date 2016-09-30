/* global d3 */
(function () {
  'use strict'

  // Dimensions
  var dimensions = {
    w: 900,
    h: 400
  }
  var offset = {
    left: 40,
    top: 40,
    right: 40,
    bottom: 40
  }

  // Create SVG
  var svg = d3.select('#svg-container').append('svg')
    .attr('width', dimensions.w)
    .attr('height', dimensions.h)

  // Create groups for grid
  svg.append('g')
    .attr('class', 'y grid')
    .attr('transform', 'translate(' + (dimensions.w - offset.right) + ',' +
      offset.top + ')')
  svg.append('g')
    .attr('class', 'x grid')
    .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

  // Create group for x axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(' + offset.left + ',' +
      (dimensions.h - offset.bottom) + ')')

  // Create group for y axis
  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

  // Create group for chart
  svg.append('g')
    .attr('class', 'chart')
    .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

  d3.csv('07-scatterplot.csv', function (error, data) {
    if (error) {
      throw error
    }

    plot.call(svg, data, data.columns.slice(2, 6), dimensions, offset)
  })

  function plot (data, dataColumns, dim, offset) {
    var scaleX = calcXScale(data, dim, offset)
    var scaleY = calcYScale(data, dim, offset)

    plotGrid.call(this, scaleX, scaleY, dim, offset)
    plotAxes.call(this, scaleX, scaleY)

    // TODO: Plot labels

    plotChart.call(this.select('.chart'), data, dataColumns, scaleX, scaleY)
  }

  function calcXScale (data, dim, offset) {
    return d3.scaleLinear().domain(d3.extent(data, function (d) {
      return d.age
    })).range([0, dim.w - offset.left - offset.right])
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLinear().domain([
      d3.min(data, function (d) {
        return d3.min([ d.glazed, d.jelly, d.powdered, d.sprinkles ])
      }),
      d3.max(data, function (d) {
        return d3.max([ d.glazed, d.jelly, d.powdered, d.sprinkles ])
      })
    ]).range([dim.h - offset.top - offset.bottom, 0])
  }

  function plotGrid (scaleX, scaleY, dim, offset) {
    var yGrid = d3.axisLeft(scaleY)
      .tickSize(dim.w - offset.left - offset.right)
      .tickFormat('')
    var xGrid = d3.axisBottom(scaleX)
      .tickSize(dim.h - offset.top - offset.bottom)
      .tickFormat('')

    this.select('.y.grid')
      .transition().duration(750)
        .call(yGrid)

    this.select('.x.grid')
      .transition().duration(750)
      .call(xGrid)
  }

  function plotAxes (scaleX, scaleY) {
    var bottomAxis = d3.axisBottom(scaleX)
      .tickValues([18, 25, 32, 39, 46, 53, 60, 67, 74, 81])
    var leftAxis = d3.axisLeft(scaleY).tickSizeInner(12)

    this.select('.x.axis')
      .transition().duration(750)
        .call(bottomAxis)

    this.select('.y.axis')
      .transition().duration(750)
        .call(leftAxis)
  }

  function plotChart (data, dataColumns, scaleX, scaleY) {
    var circles = this.selectAll('circles').data(data)

    dataColumns.forEach(function (el) {
      circles.enter().append('circle')
        .attr('class', 'point ' + el)
        .attr('cx', function (d) { return scaleX(d.age) })
        .attr('cy', function (d) { return scaleY(d[el]) })
        .attr('r', 0)
        .on('mouseover', hoverIn)
        .on('mouseout', hoverOut)
        .transition().duration(750)
          .attr('r', function (d) { return d.responses })
    })
  }

  function hoverIn () { d3.selectAll(arguments[2]).classed('active', true) }

  function hoverOut () { d3.selectAll('.active').classed('active', false) }
}())
