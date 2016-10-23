/* global d3 */
(function () {
  'use strict'

  // Dimensions
  var dim = {
    w: 700,
    h: 400
  }
  var offset = {
    left: 50,
    top: 40,
    right: 20,
    bottom: 20
  }

  var svg = init(dim, offset)
  var data = []
  var max = 10000
  var scale = {
    x: calcXScale(dim.w - offset.left - offset.right),
    y: null
  }

  createRandomData()

  function createRandomData () {
    if (data.length >= 20) data = []

    data.push(d3.randomUniform(max)())
    plot(svg, data, {
      w: dim.w - offset.left - offset.right,
      h: dim.h - offset.top - offset.bottom
    })

    setTimeout(createRandomData, 2000)
  }

  function plot (ctx, data, dim) {
    scale.y = calcYScale(data, dim.h)

    plotAxes(ctx, scale.x, scale.y)
    plotChart(ctx.select('.chart'), data, scale.x, scale.y)
  }

  function plotChart (ctx, data, x, y) {
    var line = d3.line()
      .x(function (d, i) { return x(i) })
      .y(function (d) { return y(d) })
      .curve(d3.curveStepAfter)
    var circles = ctx.selectAll('.random-circle').data(data)

    circles.enter().append('circle')
      .attr('class', 'random-circle')
      .attr('r', 0)
      .attr('cx', function (d, i) { return x(i) })
      .attr('cy', function (d) { return y(d) })
      .merge(circles)
        .transition().duration(750)
        .attr('cy', function (d) { return y(d) })
        .attr('r', 5)

    circles.exit().remove()

    ctx.select('.random-path')
      .transition().duration(750)
      .attr('d', line(data))
  }

  function plotAxes (ctx, x, y) {
    var bottomAxis = d3.axisBottom().scale(x)
      .tickSizeInner(4).tickSizeOuter(0)
    var leftAxis = d3.axisLeft().scale(y)

    ctx.select('.x.axis').call(bottomAxis)

    ctx.select('.y.axis').transition().duration(750).call(leftAxis)
  }

  function calcXScale (w) {
    return d3.scaleLinear().domain([0, 20]).range([0, w])
  }

  function calcYScale (data, h) {
    return d3.scaleLinear().domain([0, d3.max(data)]).nice().range([h, 0])
  }

  function init (dim, offset) {
    d3.select('body').append('h1').text('Random Time Series')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'line-chart')
      .attr('class', 'line-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (offset.left - 3) + ',' + offset.top +
        ')')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (dim.h - offset.bottom) + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')
      .append('path')
        .attr('class', 'random-path')

    return svg
  }
}())
