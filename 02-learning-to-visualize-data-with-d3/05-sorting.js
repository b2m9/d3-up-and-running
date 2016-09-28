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

  // Dimensions
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

  // Create group for grid
  svg.append('g')
    .attr('class', 'y grid')
    .attr('transform', 'translate(' + (w - rightOffset) + ',' +
      topOffset + ')')

  // Create group for x axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(' + leftOffset + ',' +
      (h - bottomOffset) + ')')

  // Create group for y axis
  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + leftOffset + ',' +
      topOffset + ')')

  // Create group for column chart
  svg.append('g')
    .attr('class', 'chart')
    .attr('transform', 'translate(' + leftOffset + ',' + topOffset + ')')

  // Create group for chart labels
  svg.append('g')
    .attr('class', 'chart-labels')
    .attr('transform', 'translate(' + leftOffset + ',' + topOffset + ')')

  // Bind click handler
  window.document.querySelector('#btn-sort')
    .addEventListener('click', sortChart)

  function plot (dataset, dimensions, offset, labels) {
    // Dimensions
    var dim = {
      h: dimensions.h - offset.top - offset.bottom,
      w: dimensions.w - offset.left - offset.right
    }

    // Calc scales
    var scaleX = calcXScale(dataset, dim)
    var scaleY = calcYScale(dataset, dim)
    var scaleColour = calcCScale(dataset)

    // Plot grid, axes, and labels
    plotGrid.call(this, scaleY, dim)
    plotAxes.call(this, scaleX, scaleY)
    plotLabels.call(this, labels, dim, offset)

    // Plot chart
    plotChart.call(this.select('.chart').selectAll('.bar').data(dataset), {
      x: scaleX,
      y: scaleY,
      c: scaleColour
    }, dim)

    // Plot chart labels
    plotChartLabels.call(this.select('.chart-labels').selectAll('text')
      .data(dataset), {
        x: scaleX,
        y: scaleY
      })
  }

  function calcXScale (data, dimensions) {
    return d3.scaleBand().domain(data.map(function (d) {
      return d.key
    })).range([0, dimensions.w])
  }

  function calcYScale (data, dimensions) {
    return d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d.value
    })]).range([dimensions.h, 0])
  }

  function calcCScale (data) {
    return d3.scaleOrdinal(d3.schemeCategory20)
      .domain([0, data.length])
  }

  function plotGrid (scaleY, dimensions) {
    var grid = d3.axisLeft(scaleY)
      .tickSize(dimensions.w)
      .tickFormat('')

    this.select('.y.grid')
      .transition()
        .duration(750)
        .call(grid)
  }

  function plotAxes (scaleX, scaleY) {
    var leftAxis = d3.axisLeft(scaleY).ticks(6)
    var bottomAxis = d3.axisBottom(scaleX)

    this.select('.y.axis')
      .transition()
        .duration(750)
        .call(leftAxis)

    this.select('.x.axis')
      .transition()
        .duration(750)
      .call(bottomAxis)

    // Rotate tick labels
    this.selectAll('.x.axis > .tick > text')
      .style('text-anchor', 'end')
      .attr('dx', -6)
      .attr('dy', 6)
      .attr('transform', 'rotate(-45)')
  }

  function plotLabels (labels, dimensions, offset) {
    this.select('.y.axis')
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .style('fill', '#000')
      .attr('transform', 'translate(' + -offset.left * 0.67 + ',' +
        dimensions.h / 2 + ') rotate(-90)')
      .text(labels.y)

    this.select('.x.axis')
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .style('fill', '#000')
      .attr('transform', 'translate(' + dimensions.w / 2 + ',' +
        offset.bottom * 0.75 + ')')
      .text(labels.x)
  }

  function plotChart (scales, dimensions) {
    this.transition()
      .duration(750)
      .attr('x', function (d) {
        return scales.x(d.key) + 1
      })
      .attr('y', function (d) {
        return scales.y(d.value)
      })
      .attr('width', function () {
        return scales.x.bandwidth() - 1
      })
      .attr('height', function (d) {
        return dimensions.h - scales.y(d.value)
      })
      .style('fill', function (d, i) {
        return scales.c(i)
      })

    // Enter columns
    this.enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function (d) {
        return scales.x(d.key) + 1
      })
      .attr('y', function (d) {
        return scales.y(d.value)
      })
      .attr('width', function () {
        return scales.x.bandwidth() - 1
      })
      .attr('height', function (d) {
        return dimensions.h - scales.y(d.value)
      })
      .style('fill', function (d, i) {
        return scales.c(i)
      })
  }

  function plotChartLabels (scales) {
    this.transition()
      .duration(750)
      .attr('class', 'bar-label')
      .attr('x', function (d) {
        return scales.x(d.key)
      })
      .attr('dx', function () {
        return scales.x.bandwidth() / 2
      })
      .attr('y', function (d) {
        return scales.y(d.value)
      })
      .attr('dy', function () {
        return -3
      })
      .text(function (d) {
        return d.value
      })

    // Enter text
    this.enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', function (d) {
        return scales.x(d.key)
      })
      .attr('dx', function () {
        return scales.x.bandwidth() / 2
      })
      .attr('y', function (d) {
        return scales.y(d.value)
      })
      .attr('dy', function () {
        return -3
      })
      .text(function (d) {
        return d.value
      })
  }

  function sortChart () {
    data.sort(function (a, b) {
      return a.value - b.value
    })

    plot.call(svg, data.sort(), {
      w: w,
      h: h
    }, {
      top: topOffset,
      right: rightOffset,
      bottom: bottomOffset,
      left: leftOffset
    }, {
      y: 'Units sold',
      x: 'Donut type'
    })
  }

  // Let's do this.
  plot.call(svg, data, {
    w: w,
    h: h
  }, {
    top: topOffset,
    right: rightOffset,
    bottom: bottomOffset,
    left: leftOffset
  }, {
    y: 'Units sold',
    x: 'Donut type'
  })
}())
