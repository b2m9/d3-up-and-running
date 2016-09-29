/* global d3 */
(function () {
  'use strict'

  var dataset = [
    { key: 'Jelly', value: 60, date: '2014/01/01' },
    { key: 'Jelly', value: 58, date: '2014/01/02' },
    { key: 'Jelly', value: 59, date: '2014/01/03' },
    { key: 'Jelly', value: 56, date: '2014/01/04' },
    { key: 'Jelly', value: 57, date: '2014/01/05' },
    { key: 'Jelly', value: 55, date: '2014/01/06' },
    { key: 'Jelly', value: 56, date: '2014/01/07' },
    { key: 'Jelly', value: 52, date: '2014/01/08' },
    { key: 'Jelly', value: 54, date: '2014/01/09' },
    { key: 'Jelly', value: 57, date: '2014/01/10' },
    { key: 'Jelly', value: 56, date: '2014/01/11' },
    { key: 'Jelly', value: 59, date: '2014/01/12' },
    { key: 'Jelly', value: 56, date: '2014/01/13' },
    { key: 'Jelly', value: 52, date: '2014/01/14' },
    { key: 'Jelly', value: 48, date: '2014/01/15' },
    { key: 'Jelly', value: 47, date: '2014/01/16' },
    { key: 'Jelly', value: 48, date: '2014/01/17' },
    { key: 'Jelly', value: 45, date: '2014/01/18' },
    { key: 'Jelly', value: 43, date: '2014/01/19' },
    { key: 'Jelly', value: 41, date: '2014/01/20' },
    { key: 'Jelly', value: 37, date: '2014/01/21' },
    { key: 'Jelly', value: 36, date: '2014/01/22' },
    { key: 'Jelly', value: 39, date: '2014/01/23' },
    { key: 'Jelly', value: 41, date: '2014/01/24' },
    { key: 'Jelly', value: 42, date: '2014/01/25' },
    { key: 'Jelly', value: 40, date: '2014/01/26' },
    { key: 'Jelly', value: 43, date: '2014/01/27' },
    { key: 'Jelly', value: 41, date: '2014/01/28' },
    { key: 'Jelly', value: 39, date: '2014/01/29' },
    { key: 'Jelly', value: 40, date: '2014/01/30' },
    { key: 'Jelly', value: 39, date: '2014/01/31' }
  ]

  // Dimensions
  var dimensions = {
    w: 800,
    h: 450
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

  function plot (data, dim, offset) {
    data.forEach(function (el) { el.date = d3.timeParse('%Y/%m/%d')(el.date) })

    var scaleX = calcXScale(data, dim, offset)
    var scaleY = calcYScale(data, dim, offset)

    plotAxes.call(this, scaleX, scaleY)

    plotChart.call(this.select('.chart'), data, {
      x: scaleX,
      y: scaleY
    }, dim, offset)
  }

  function calcXScale (data, dim, offset) {
    return d3.scaleTime()
      .domain(d3.extent(data, function (d) { return d.date }))
      .range([0, dim.w - offset.left - offset.right])
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLinear()
      .domain([0, d3.max(data, function (d) { return d.value })])
      .range([dim.h - offset.top - offset.bottom, 0])
  }

  function plotAxes (scaleX, scaleY) {
    var bottomAxis = d3.axisBottom(scaleX).ticks(d3.timeDay.every(7))
      .tickFormat(d3.timeFormat('%d/%m'))
    var leftAxis = d3.axisLeft(scaleY).ticks(5)

    this.select('.x.axis')
      .transition().duration(750)
        .call(bottomAxis)

    this.select('.y.axis')
      .transition().duration(750)
        .call(leftAxis)
  }

  function plotChart (data, scales, dim, offset) {
    // Create area function
    var area = d3.area()
      .x(function (d) { return scales.x(d.date) })
      .y0(dim.h - offset.bottom - offset.top)
      .y1(function (d) { return scales.y(d.value) })
      .curve(d3.curveMonotoneX)

    // Create line function
    var line = d3.line()
      .x(function (d) { return scales.x(d.date) })
      .y(function (d) { return scales.y(d.value) })
      .curve(d3.curveMonotoneX)

    // Append area
    this.append('path').datum(data)
      .attr('class', 'area')
      .attr('opacity', 0)
      .transition().duration(750)
        .attr('d', area)
        .attr('opacity', 1)

    // Append line
    this.append('path').datum(data)
      .attr('class', 'line')
      .attr('opacity', 0)
      .transition().duration(750)
        .attr('d', line)
        .attr('opacity', 1)

    // Enter points
    this.selectAll('.point').data(data).enter().append('circle')
      .attr('class', 'point')
      .attr('cx', function (d) { return scales.x(d.date) })
      .attr('cy', function (d) { return scales.y(d.value) })
      .attr('r', 0)
      .transition().duration(750)
        .attr('r', 2)
  }

  plot.call(svg, dataset, dimensions, offset)
}())
