/* global d3 */
(function () {
  'use strict'

  var rv = window.redditVis = window.redditVis || {}
  var splot = rv.scatterplot = {}

  // Dimensions
  splot.dim = {
    w: 500,
    h: 300
  }
  splot.offset = {
    left: 40,
    top: 10,
    right: 10,
    bottom: 40
  }

  // Create table content
  splot.plot = function (container, data) {
    if (window.document.getElementsByClassName('.scatterplot').length === 0) {
      this.create(container, this.dim, this.offset)
    }

    var scaleX = this.calcXScale(data, this.dim, this.offset)
    var scaleY = this.calcYScale(data, this.dim, this.offset)

    this.plotAxes.call(container.select('.scatterplot'), scaleX, scaleY)
    this.plotChart.call(container.select('.scatterplot .chart'), data, scaleX, scaleY)
  }

  splot.plotChart = function (data, scaleX, scaleY) {
    var circles = this.selectAll('circle').data(data)

    // Enter
    circles.enter().append('circle')
      .attr('class', 'splot-circle')
      .attr('cx', function (d) { return scaleX(d.data.created_utc) })
      .attr('cy', function (d) { return scaleY(d.data.score) })
      .attr('r', 0)
      .transition().duration(750)
        .attr('r', 5)

    // Update
    circles
      .transition().duration(375)
        .attr('cx', function (d) { return scaleX(d.data.created_utc) })
      .transition().duration(375)
        .attr('cy', function (d) { return scaleY(d.data.score) })

    // Exit
    circles.exit().transition().duration(750)
      .attr('opacity', 0)
      .remove()
  }

  splot.plotAxes = function (scaleX, scaleY) {
    var bottomAxis = d3.axisBottom(scaleX).ticks(5).tickFormat(rv.timeFormat)
    var leftAxis = d3.axisLeft(scaleY).ticks(5)
      .tickFormat(d3.formatPrefix(',.0', 1e3))

    this.select('.x.axis').transition().duration(750)
      .call(bottomAxis)
    this.select('.y.axis').transition().duration(750)
      .call(leftAxis)
  }

  // Create scaling function for x axis
  splot.calcXScale = function (data, dim, offset) {
    return d3.scaleLinear().domain(d3.extent(data, function (d) {
      return d.data.created_utc
    })).range([0, dim.w - offset.left - offset.right])
  }

  // Create scaling function for y axis
  splot.calcYScale = function (data, dim, offset) {
    return d3.scaleLinear().domain(d3.extent(data, function (d) {
      return d.data.score
    })).range([dim.h - offset.top - offset.bottom, 0])
  }

  // Create SVG groups
  splot.create = function (dom, dim, offset) {
    var svg = dom.append('svg')
      .attr('id', 'scatterplot')
      .attr('class', 'scatterplot')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (dim.h - offset.bottom) + ')')

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    return svg
  }
}())
