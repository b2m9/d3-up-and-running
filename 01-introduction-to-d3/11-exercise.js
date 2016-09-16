/* global d3 */
(function () {
  'use strict'

  // Dimensions and stuff
  var w = 600
  var h = 400
  var leftOffset = 30
  var bottomOffset = 30
  var padding = 5
  var duration = 750

  var dataset
  var xScale
  var yScale
  var c

  // Create SVG
  var s = d3.select('#svg-container').append('svg')
    .attr('height', h + leftOffset + (padding * 2))
    .attr('width', w + bottomOffset + (padding * 2))

  // Create bottom axis
  s.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(' + (leftOffset + padding) + ',' +
      (h + padding + padding) + ')')

  // Create left axis
  s.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + leftOffset + ',' + padding + ')')

  s.append('g')
    .attr('class', 'chart-area')
    .attr('transform', 'translate(' + (leftOffset + padding) + ',' +
      padding + ')')

  // Attach click handler for button
  window.document.querySelector('button')
    .addEventListener('click', clickHandler)

  // Let's start the show
  clickHandler()

  function clickHandler () {
    dataset = createDataset()
    xScale = createXScale()
    yScale = createYScale()

    updateAxes(xScale, yScale)

    c = s.select('.chart-area').selectAll('circle').data(dataset)

    // Update circles
    c.transition().duration(duration)
      .attr('cx', function (d) { return xScale(d.x) })
      .attr('cy', function (d) { return yScale(d.y) })
      .attr('r', function (d) { return d.r })

    // Enter circles
    c.enter().append('circle')
      .attr('cx', function (d) { return xScale(d.x) })
      .attr('cy', -25)
      .attr('r', function (d) { return d.r })
      .attr('fill', function () {
        var r = Math.floor(Math.random() * 255)
        var g = Math.floor(Math.random() * 255)
        var b = Math.floor(Math.random() * 255)

        return 'rgb(' + r + ',' + g + ',' + b + ')'
      })
      .transition().duration(duration)
        .attr('cy', function (d) { return yScale(d.y) })

    // Exit circles
    c.exit()
      .transition().duration(duration)
      .attr('cx', w + leftOffset + (padding * 3))
      .remove()
  }

  // Create random data set
  function createDataset () {
    var set = []
    var numPoints = Math.random() * 100
    var maxX = Math.random() * 1000
    var maxY = Math.random() * 500
    var maxR = Math.random() * 25

    for (var i = 0; i < numPoints; i++) {
      set.push({
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
        r: Math.floor(Math.random() * maxR)
      })
    }

    return set
  }

  // Create xScale
  function createXScale () {
    return d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
      return d.x
    })]).range([0, w])
  }

  // Create yScale
  function createYScale () {
    return d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
      return d.y
    })]).range([h, 0])
  }

  // Update axes
  function updateAxes (xScale, yScale) {
    var leftAxis = d3.axisLeft(yScale).ticks(4)
    var bottomAxis = d3.axisBottom(xScale).ticks(6)

    s.select('.x.axis')
      .transition()
        .duration(750)
        .call(bottomAxis)

    s.select('.y.axis')
      .transition()
        .duration(750)
        .call(leftAxis)
  }
}())
