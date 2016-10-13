/* global d3 */
(function () {
  'use strict'

  var rv = window.redditVis = window.redditVis || {}
  var bar = rv.barchart = {}

  // Dimensions
  bar.dim = {
    w: 458,
    h: 300
  }
  bar.offset = {
    left: 40,
    top: 10,
    right: 10,
    bottom: 40
  }

  // Create table content
  bar.plot = function (container, data) {
    if (window.document.getElementsByClassName('.barchart').length === 0) {
      this.create(container, this.dim, this.offset)
    }

    var bins = d3.histogram()
      .value(function (d) { return d.data.score })
      .domain(d3.extent(data, function (d) { return d.data.score }))
      .thresholds(5)(data)

    var scaleX = this.calcXScale(bins, this.dim, this.offset)
    var scaleY = this.calcYScale(bins, this.dim, this.offset)

    // debugger

    this.plotAxes.call(container.select('.barchart'), scaleX)
    this.plotChart.call(container.select('.barchart .chart'), bins, scaleX,
      scaleY)
  }

  bar.plotChart = function (data, scaleX, scaleY) {
    var rects = this.selectAll('rect').data(data)

    // Enter
    rects.enter().append('rect')
      .attr('class', 'bar-rect')
      .attr('x', 0)
      .attr('y', function (d, i) { return scaleY(i) })
      .attr('height', scaleY.bandwidth())
      .attr('width', 0)
      .transition().duration(750)
        .attr('width', function (d) { return scaleX(d.length) })

    // Update
    rects.transition().duration(750)
      .attr('y', function (d, i) { return scaleY(i) })
      .attr('width', function (d) { return scaleX(d.length) })

    // Exit
    rects.exit().transition().duration(750)
      .attr('width', 0)
      .remove()
  }

  bar.plotAxes = function (scaleX) {
    var bottomAxis = d3.axisBottom(scaleX).ticks(5)

    this.select('.x.axis').transition().duration(750)
      .call(bottomAxis)
  }

  // Create scaling function for x values
  bar.calcXScale = function (data, dim, offset) {
    return d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d.length
    })]).range([0, dim.w - offset.left - offset.right])
  }

  // Create scaling function for y values
  bar.calcYScale = function (data, dim, offset) {
    return d3.scaleBand().domain(d3.range(data.length))
      .rangeRound([dim.h - offset.top - offset.bottom, 0])
  }

  // Create SVG groups
  bar.create = function (dom, dim, offset) {
    var svg = dom.append('svg')
      .attr('id', 'barchart')
      .attr('class', 'barchart')
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
