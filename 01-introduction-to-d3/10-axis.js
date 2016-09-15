/* global d3 */
(function () {
  'use strict'

  // Dimensions of visualisation
  var w = 500
  var h = 300

  // Offsets for axes
  var leftOffset = 30
  var bottomOffset = 25

  // Create new random data set
  var dataset = []
  var maxNumPoints = 50
  var maxValue = Math.random() * 1000
  var maxRadius = Math.random() * 25

  for (var i = 0; i < maxNumPoints; i++) {
    dataset.push({
      x: Math.floor(Math.random() * maxValue),
      y: Math.floor(Math.random() * maxValue),
      r: Math.floor(Math.random() * maxRadius)
    })
  }

  // Create linear scales
  var xLinear = d3.scaleLinear()
    .domain([0, d3.max(dataset, function (d) { return d.x })])
    .range([0, w])
  var yLinear = d3.scaleLinear()
    .domain([0, d3.max(dataset, function (d) { return d.y })])
    .range([h, 0])

  // Create axes
  var bottomAxis = d3.axisBottom(xLinear)
  var leftAxis = d3.axisLeft(yLinear)

  // Create SVG
  var s = d3.select('body').append('svg')
    .attr('height', h + bottomOffset)
    .attr('width', w + (leftOffset * 2))
    .attr('class', 'axis')

  // Create bottom axis
  s.append('g')
    .attr('transform', 'translate(' + leftOffset + ',' + h + ')')
    .call(bottomAxis)

  // Create left axis
  s.append('g')
    .attr('transform', 'translate(' + leftOffset + ',0)')
    .call(leftAxis)

  s = s.append('g')
    .attr('transform', 'translate(' + leftOffset + ', 0)')

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
        var r = Math.floor(Math.random() * 255)
        var g = Math.floor(Math.random() * 255)
        var b = Math.floor(Math.random() * 255)

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
