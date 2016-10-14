/* global d3 */
(function () {
  'use strict'

  var path = 'afcw-results.csv'

  // Dimensions
  var dim = {
    w: 700,
    h: 350
  }
  var offset = {
    left: 50,
    top: 20,
    right: 20,
    bottom: 20
  }

  var svg = init(dim, offset)
  var data = []

  // Let's load all teams!
  d3.csv(path, function (err, res) {
    if (err) throw err

    data = res.map(function (d) {
      d['Date'] = d3.timeParse('%Y-%m-%d')(d['Date'])
      return d
    })
    plot(svg, data, dim, offset)
  })

  function plot (ctx, data, dim, offset) {
    var scaleX = calcXScale(data, dim, offset)
    var scaleY = calcYScale(data, dim, offset)

    plotAxes(ctx, scaleX, scaleY)
    plotChart(ctx.select('.chart'), data, scaleX, scaleY,
      (dim.h - offset.top - offset.bottom) / 2)
  }

  function plotChart (ctx, data, x, y, middle) {
    var matches = ctx.selectAll('g').data(data)

    var match = matches.enter().append('g')
      .attr('class', 'match')

    match.append('rect')
      .attr('class', 'scored')
      .attr('x', function (d, i) { return x(i) })
      .attr('y', middle)
      .attr('height', 0)
      .attr('width', x.bandwidth())
      .transition()
        .delay(function (d, i) { return 25 * i })
        .duration(750)
        .attr('y', function (d) { return y(d['GoalsScored']) })
        .attr('height', function (d) { return middle - y(d['GoalsScored']) })

    match.append('rect')
      .attr('class', 'allowed')
      .attr('x', function (d, i) { return x(i) })
      .attr('y', middle + 1)
      .attr('height', 0)
      .attr('width', x.bandwidth())
      .transition()
          .delay(function (d, i) { return 25 * i })
          .duration(750)
          .attr('height', function (d) { return middle - y(d['GoalsAllowed']) })

    match.append('circle')
      .attr('class', 'result')
      .attr('cx', function (d, i) { return x(i) + (x.bandwidth() / 2) })
      .attr('cy', middle)
      .attr('r', 3)
      .attr('opacity', 0)
      .transition()
        .delay(function (d, i) { return 25 * i })
        .duration(750)
        .attr('cy', function (d) { return y(d['GoalsScored'] - d['GoalsAllowed']) })
        .attr('opacity', 1)
  }

  function plotAxes (ctx, x, y) {
    var left = d3.axisLeft(y)
    var bottom = d3.axisBottom(x).tickSizeOuter(0).tickSizeInner(0)
      .tickFormat('')

    ctx.select('.y.axis').transition().duration(750).call(left)
    ctx.select('.x.axis').transition().duration(750).call(bottom)
  }

  function calcXScale (data, dim, offset) {
    return d3.scaleBand().domain(d3.range(data.length))
      .rangeRound([0, dim.w - offset.left - offset.right])
      .paddingInner(0.05)
      .paddingOuter(0.05)
  }

  function calcYScale (data, dim, offset) {
    var max = d3.max([
      d3.max(data, function (d) { return d['GoalsScored'] }),
      d3.max(data, function (d) { return d['GoalsAllowed'] })
    ])

    return d3.scaleLinear().domain([-max, max])
      .range([dim.h - offset.top - offset.bottom, 0])
  }

  function init (dim, offset) {
    d3.select('body').append('h1').text('AFC Wimbledon Results')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'bar-chart')
      .attr('class', 'bar-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (offset.top + (dim.h - offset.top - offset.bottom) / 2) + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    return svg
  }
}())
