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

      plot(ctx, data)
    })

  function plot (ctx, data) {
    var outerRadius1 = 175
    var innerRadius1 = 120
    var outerRadius2 = 80
    var innerRadius2 = 25
    var c = calcCScale(data)

    plotChart(ctx.select('.outer'), data.map(function (d) {
      return { country: d.country, data: d['expense'] }
    }), outerRadius1, innerRadius1, c)
    plotChart(ctx.select('.inner'), data.map(function (d) {
      return { country: d.country, data: d['income'] }
    }), outerRadius2, innerRadius2, c)
  }

  function plotChart (ctx, data, oR, iR, c) {
    var arcGenerator = d3.arc().innerRadius(iR).outerRadius(oR)
    var arcs = ctx.selectAll('path').data(d3.pie().sort(null)
      .value(function (d) { return d.data })(data))

    arcs.enter().append('path')
      .attr('fill', function (d, i) { return c(i) })
      .attr('d', arcGenerator)
      .on('mouseover', function (d) { hoverIn(this, d) })
      .on('mouseout', hoverOut)
  }

  function calcCScale (data) {
    return d3.scaleOrdinal().domain(d3.range(data.length)).range([
      '#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c',
      '#ff8c00'
    ])
  }

  function hoverIn (ctx, val) {
    var dimArc = ctx.getBoundingClientRect()

    d3.select('#name').text(val.data.country + ': ')
    d3.select('#value').text(d3.format(',.4r')(val.data.data))

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimArc.left + dimArc.width / 2 - dimTip.width / 2) + 'px')
      .style('top', (window.scrollY + dimArc.top + dimArc.height / 2) + 'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function init (dim, callback) {
    d3.select('body').append('h1').text('Donut Charts')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'donut-chart')
      .attr('class', 'donut-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    var g = svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + (dim.w / 2) + ',' + (dim.h / 2) + ')')

    g.append('g').attr('class', 'outer')
    g.append('g').attr('class', 'inner')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
