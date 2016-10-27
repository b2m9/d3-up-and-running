/* global d3 */
(function () {
  'use strict'

  // Gender Gap Index 2014, Source:
  // https://github.com/ali-ce/datasets
  // Credits to @ali-ce: https://github.com/ali-ce
  var path = 'gender-gap-2014.csv'

  // Dimensions
  var dim = {
    w: 940,
    h: 900
  }
  var offset = {
    left: 20,
    top: 20,
    right: 45,
    bottom: 40
  }
  var scale = {
    x: null,
    y: null,
    c: null
  }

  d3.queue()
    .defer(init, dim, offset)
    .defer(d3.csv, path)
    .await(function (err, ctx, res) {
      if (err) throw err

      var data = prepData(res)
      var regions = extractRegions(res)

      plot(ctx, data, regions, scale, dim.w - offset.left - offset.right,
        dim.h - offset.top - offset.bottom)
    })

  function plot (ctx, data, keys, scale, w, h) {
    scale.x = calcXScale(data, w)
    scale.y = calcYScale(data, h)
    scale.c = calcCScale(keys)

    plotAxis(ctx, scale.x)
    plotLegend(ctx.select('.legend'), keys, scale.c)
    plotChart(ctx.select('.chart'), data, scale.x, scale.y, scale.c)
  }

  function plotChart (ctx, data, x, y, c) {
    var bars = ctx.selectAll('.bar').data(data)
      .enter().append('g')
      .attr('class', 'bar')

    bars.append('rect')
      .attr('class', 'bar-rect')
      .attr('x', 0)
      .attr('y', function (d, i) { return y(i) })
      .attr('width', function (d) { return x(d.score) })
      .attr('height', y.bandwidth() - 2)
      .attr('fill', function (d) { return c(d.region) })
  }

  function plotAxis (ctx, x) {
    var bottomAxis = d3.axisBottom().scale(x)

    ctx.select('.x.axis')
      .attr('opacity', 0)
      .call(bottomAxis)
        .transition().duration(750).delay(500)
        .attr('opacity', 1)
  }

  function plotLegend (ctx, data, c) {
    var entries = ctx.selectAll('.entry').data(data)
      .enter().append('g')
        .attr('class', 'entry')
        .on('mouseover', function (d) { filter(d) })

    entries.append('rect')
      .attr('class', 'legend-rect')
      .attr('x', 0)
      .attr('y', function (d, i) { return i * 16 })
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', function (d, i) { return c(i) })

    entries.append('text')
      .attr('class', 'legend-text')
      .attr('x', 13)
      .attr('y', function (d, i) { return i * 16 })
      .text(function (d) { return d })
      .attr('dy', 9)
  }

  function hoverIn () {}

  function hoverOut () {}

  function filter () {

  }

  function sort () {
    debugger
  }

  function calcXScale (data, w) {
    // Gender Gap Index domain is 0..1
    return d3.scaleLinear().domain([0, 1]).range([0, w])
  }

  function calcYScale (data, h) {
    return d3.scaleBand().domain(d3.range(data.length)).range([h, 0])
  }

  function calcCScale (data) {
    return d3.scaleOrdinal().domain(data).range(['#8dd3c7', '#ffd92f',
      '#bebada', '#fb8072', '#80b1d3', '#fdb462'])
  }

  function extractRegions (data) {
    var regions = []

    data.map(function (d) {
      if (regions.indexOf(d['Region']) <= -1) regions.push(d['Region'])
    })

    return regions
  }

  function prepData (data) {
    var result = []

    data.map(function (d) {
      result.push({
        key: d['Country'],
        score: +d['Overall - Score'],
        region: d['Region']
      })
    })

    return result
  }

  function init (dim, offset, callback) {
    d3.select('body').append('h1').text('Gender Gap Index 2014')
    d3.select('body').append('div').attr('class', 'wrapper')

    var controls = d3.select('.wrapper').append('div')
      .attr('class', 'controls')

    controls.append('button')
      .attr('class', 'btn btn-default')
      .attr('data-type', 'asc')
      .on('click', sort)
      .text('Sort ascending')

    controls.append('button')
      .attr('class', 'btn btn-default')
      .attr('data-type', 'desc')
      .on('click', sort)
      .text('Sort descending')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'barchart')
      .attr('class', 'barchart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (dim.h - offset.bottom) + ')')

    svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + (dim.w - 160) + ',' + offset.top + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
