/* global d3 */
(function () {
  'use strict'

  var path = 'co2-emissions.csv'

  // Dimensions
  var dim = {
    w: 800,
    h: 350
  }
  var offset = {
    left: 50,
    top: 40,
    right: 20,
    bottom: 20
  }

  var svg = init(dim, offset)

  d3.csv(path, function (err, res) {
    if (err) throw err

    plot(svg, prepData(res), dim, offset)
  })

  function plot (ctx, data, dim, offset) {
    var scaleX = calcXScale(data, dim, offset)
    var scaleY = calcYScale(data, dim, offset)

    plotAxes(ctx, scaleX, scaleY)
    plotChart(ctx.select('.chart'), data, scaleX, scaleY,
      dim.h - offset.top - offset.bottom)
  }

  function plotChart (ctx, data, x, y, h) {
    var area = d3.area()
      .x(function (d) { return x(d.year) })
      .y(h)
      .y1(function (d) { return y(d.value) })
      .curve(d3.curveMonotoneX)

    ctx.append('path').datum(data)
      .attr('class', 'area')
      .attr('opacity', 0)
      .transition().duration(750)
        .attr('d', area)
        .attr('opacity', 1)

    ctx.selectAll('circle').data(data)
      .enter().append('circle')
        .attr('class', 'data-circle')
        .attr('cx', function (d) { return x(d.year) })
        .attr('cy', function (d) { return y(d.value) })
        .attr('r', 0)
        .on('mouseover', function (d) { hoverIn(this, d) })
        .on('mouseout', hoverOut)
        .transition().duration(750)
          .attr('r', 3)
  }

  function plotAxes (ctx, x, y) {
    var bottomAxis = d3.axisBottom().scale(x).tickFormat('')
      .tickSizeInner(0).tickSizeOuter(0)
    var leftAxis = d3.axisLeft().scale(y).tickFormat(d3.format('.2s'))

    ctx.select('.x.axis')
      .attr('opacity', 0)
      .call(bottomAxis)
        .transition().duration(750).delay(500)
        .attr('opacity', 1)

    ctx.select('.y.axis')
      .attr('opacity', 0)
      .call(leftAxis)
        .transition().duration(750).delay(500)
        .attr('opacity', 1)
  }

  function calcXScale (data, dim, offset) {
    return d3.scaleLinear().domain(d3.extent(data, function (d) {
      return d.year
    })).range([0, dim.w - offset.left - offset.right])
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d.value
    })]).range([dim.h - offset.top - offset.bottom, 0])
  }

  function hoverIn (ctx, val) {
    var dimCircle = ctx.getBoundingClientRect()

    d3.select('#dimension').text(val.year + ':')
    d3.select('#value').text(d3.format(".3s")(val.value))

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimCircle.left - dimTip.width / 2 + 3) + 'px')
      .style('top', (window.scrollY + dimCircle.top - dimTip.height - 10) + 'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function prepData (data) {
    var cleaned = []
    var us = d3.map(data, function (d) { return d['Country Name'] })
      .get('United States')
    var keys = Object.keys(us)
      .filter(function (d) { return parseInt(d, 10) })
    var l = keys.length

    for (var i = 0; i < l; i++) {
      cleaned.push({
        year: parseInt(keys[i], 10),
        value: parseFloat(us[keys[i]])
      })
    }

    return cleaned.filter(function (d) { return d.value })
  }

  function init (dim, offset) {
    d3.select('body').append('h1').text('United States CO2 Emissions')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'bar-chart')
      .attr('class', 'bar-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (offset.left - 5) + ',' + offset.top + ')')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (dim.h - offset.bottom) + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    return svg
  }
}())
