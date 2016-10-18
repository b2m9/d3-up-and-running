/* global d3 */
(function () {
  'use strict'

  var path = 'stacked-data.json'

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
  var scale = {
    x: null,
    y: null
  }

  d3.json(path, function (err, res) {
    if (err) throw err

    data = prepData(res)

    plot(svg, data, dim, offset)
  })

  function plot (ctx, data, dim, offset) {
    scale.x = calcXScale(data, dim, offset)
    scale.y = calcYScale(data, dim, offset)

    plotAxes(ctx, scale.x, scale.y)
    plotChart(ctx.select('.chart'), d3.stack().keys(Object.keys(data[0]))(data),
      scale.x, scale.y)
  }

  function plotChart (ctx, data, x, y) {
    var stacks = ctx.selectAll('.stack').data(data)
      .enter().append('g')
        .attr('class', 'stack')
        .attr('fill', function (d, i) { return d3.schemeCategory10[i] })

    stacks.selectAll('rect').data(function (d) { return d })
      .enter().append('rect')
        .attr('class', 'rect')
        .attr('x', function (d, i) { return scale.x(i) })
        .attr('width', scale.x.bandwidth() - 1)
        .attr('y', function (d) { return scale.y(d[1]) })
        .attr('height', function (d) { return scale.y(d[0]) - scale.y(d[1]) })
        .on('mouseover', function (d) { hoverIn(this, d) })
        .on('mouseout', hoverOut)
  }

  function plotAxes (ctx, x, y) {
    var bottomAxis = d3.axisBottom().scale(x).tickFormat('')
      .tickSizeInner(4).tickSizeOuter(0)
    var leftAxis = d3.axisLeft().scale(y)

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
    return d3.scaleBand().domain(d3.range(data.length))
      .range([0, dim.w - offset.left - offset.right])
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLinear().domain([0, d3.max(data.map(function (stack) {
      return d3.sum(d3.map(stack).values())
    }))]).range([dim.h - offset.top - offset.bottom, 0])
  }

  function hoverIn (ctx, val) {
    var dimRect = ctx.getBoundingClientRect()

    d3.select('#value').text(val[1])

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimRect.left + dimRect.width / 2 - dimTip.width / 2) + 'px')
      .style('top', (window.scrollY + dimRect.top + dimRect.height / 2 -
        dimTip.height / 2) + 'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function prepData (data) {
    // Transforming data so it fits d3's new stack layout
    return d3.nest().key(function (d) { return d.x })
      .entries(d3.merge(data)).map(function (d) {
        var stack = {}
        d.values.map(function (n, i) { stack[i] = n.y })

        return stack
      })
  }

  function init (dim, offset) {
    d3.select('body').append('h1').text('A Beautiful Stacked Bar Chart')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'bar-chart')
      .attr('class', 'bar-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (offset.left - 3) + ',' + offset.top + ')')

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
