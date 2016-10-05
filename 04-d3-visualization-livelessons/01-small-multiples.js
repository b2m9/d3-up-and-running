/* global d3 */
(function () {
  'use strict'

  var url = 'low-income.csv'

  // Dimensions
  var dimensions = {
    w: 120,
    h: 90
  }
  var offset = {
    top: 30,
    right: 10,
    bottom: 20,
    left: 50
  }

  var svg = d3.select('#svg-container')

  // Load and transform the data
  d3.csv(url, function (err, res) {
    if (err) throw err

    // Convert data types
    res.forEach(function (val) {
      val.value = parseInt(val.value, 10)
      val.year = d3.timeParse('%Y')(val.year)
    })

    var metaData = {
      x: d3.extent(res, function (d) { return d.year }),
      y: d3.extent(res, function (d) { return d.value })
    }

    // Nest into arbitrary hierarchy
    res = d3.nest().key(function (d) { return d.Country })
      .entries(res).sort(function (a, b) {
        // Sort nested hierarchy alphabetically
        if (a.key < b.key) return -1
        else if (a.key > b.key) return 1
        else return 0
      })

    plotCharts.call(svg, res, metaData, dimensions, offset)
  })

  function plotCharts (data, meta, dim, offset) {
    var scaleX = calcXScale(meta, dim, offset)
    var scaleY = calcYScale(meta, dim, offset)

    var charts = this.selectAll('div').data(data)
      .enter().append('div')
        .attr('class', 'container')
      .append('svg')
        .attr('width', dim.w)
        .attr('height', dim.h)
      .append('g')
        // .attr('transform', 'translate(0,' + offset.top + ')')

    // Axes for every chart
    var bottomAxis = d3.axisBottom(scaleX).ticks(3).tickFormat(function (d) {
      return d3.timeFormat("'%y")(d)
    })
    var leftAxis = d3.axisLeft(scaleY).ticks(1).tickFormat(function (d) {
      return d3.format('$d')(d)
    }).tickPadding(16)

    charts.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (dim.h - offset.bottom) + ')')
      .transition().duration(750)
        .call(bottomAxis)

    charts.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')
      .transition().duration(750)
        .call(leftAxis)

    // Line for every chart
    var line = d3.line()
      .x(function (d) { return scaleX(d.year) })
      .y(function (d) { return scaleY(d.value) })

    charts.append('g')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')
      .append('path')
        .datum(function (d) { return d.values })
        .attr('class', 'line')
        .attr('d', line)
        .attr('opacity', 0)
        .transition().duration(750)
          .attr('opacity', 1)

    // Text for every chart
    charts.append('text')
      .attr('transform', 'translate(' + dim.w / 2 + ',15)')
      .text(function (d) { return d.key })
  }

  function calcXScale (data, dim, offset) {
    return d3.scaleTime().domain(data.x).range([0, dim.w - offset.left -
      offset.right])
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLinear().domain(data.y).range([dim.h - offset.top -
      offset.bottom, 0])
  }
}())
