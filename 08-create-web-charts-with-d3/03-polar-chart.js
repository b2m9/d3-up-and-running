/* global d3 */
(function () {
  'use strict'

  var path = 'dummy-data.csv'

  // Dimensions
  var dim = {
    w: 800,
    h: 400
  }

  d3.queue()
    .defer(d3.csv, path)
    .defer(init, dim)
    .await(function (err, data, ctx) {
      if (err) throw err

      plot(ctx, data, dim)
    })

  function plot (ctx, data) {
    var c = calcCScale(data)
    var r = calcRScale(data, dim)

    plotChart(ctx.select('.chart'), data, 0, r, c)
  }

  function plotChart (ctx, data, iR, r, c) {
    var arcGenerator = d3.arc().innerRadius(iR).outerRadius(function (d) {
      return r(d.data['expense'])
    })
    var arcs = ctx.selectAll('path').data(d3.pie().sort(null)
      .value(function (d) { return d['income'] })(data))

    arcs.enter().append('path')
      .attr('fill', function (d, i) { return c(i) })
      .attr('d', arcGenerator)
      .on('mouseover', function (d) { hoverIn(this, d) })
      .on('mouseout', hoverOut)
  }

  function calcRScale (data, dim) {
    return d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return +d['expense']
    })]).range([0, dim.h * 0.45])
  }

  function calcCScale (data) {
    return d3.scaleOrdinal().domain(d3.range(data.length)).range([
      '#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c',
      '#ff8c00'
    ])
  }

  function hoverIn (ctx, val) {
    var dimArc = ctx.getBoundingClientRect()

    d3.select('#country').text(val.data['country'])
    d3.select('#income').text(d3.format(',.4r')(val.data['income']))
    d3.select('#expense').text(d3.format(',.4r')(val.data['expense']))

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimArc.left + dimArc.width / 2 - dimTip.width / 2) + 'px')
      .style('top', (window.scrollY + dimArc.top + dimArc.height / 2 -
        dimTip.height / 2) + 'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function init (dim, callback) {
    d3.select('body').append('h1').text('Polar Chart')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'donut-chart')
      .attr('class', 'donut-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    var g = svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + (dim.w / 2) + ',' + (dim.h / 2) + ')')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
