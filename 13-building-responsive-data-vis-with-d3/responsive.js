/* global d3 */
(function () {
  'use strict'

  var path = 'data.json'

  // Dimensions
  var width = parseInt(d3.select('.svg').style('width'), 10)
  var height = width * 0.5

  var offset = {
    left: 50,
    top: 40,
    right: 20,
    bottom: 20
  }
  var scale = {
    x: null,
    y: null
  }
  var data
  var svg

  d3.queue()
    .defer(init, width, height, offset)
    .defer(d3.json, path)
    .await(function (err, ctx, res) {
      if (err) throw err

      svg = ctx
      data = res
      plot(ctx, res, width, height, offset)
    })

  function plot (ctx, data, w, h, offset) {
    scale.x = calcXScale(data, w, offset)
    scale.y = calcYScale(data, h, offset)

    plotAxes(ctx, scale.x, scale.y)
    plotChart(ctx.select('.chart'), data, scale.x, scale.y,
      h - offset.top - offset.bottom)
  }

  function plotChart (ctx, data, x, y, h) {
    var bars = ctx.selectAll('.bar').data(data)

    bars.enter().append('rect')
      .attr('class', 'bar')
      .attr('y', h)
      .attr('height', 0)
      .on('mouseover', function (d) { hoverIn(this, d) })
      .on('mouseout', hoverOut)
      .merge(bars)
        .attr('x', function (d, i) { return x(i) })
        .attr('width', x.bandwidth() - 1)
        .transition()
          .duration(750)
          .delay(function (d, i) { return 25 * i })
          .attr('y', function (d) { return y(d) })
          .attr('height', function (d) { return h - y(d) })
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

  function calcXScale (data, w, offset) {
    return d3.scaleBand().domain(d3.range(data.length))
      .range([0, w - offset.left - offset.right])
  }

  function calcYScale (data, h, offset) {
    return d3.scaleLinear().domain([0, d3.max(data)])
      .range([h - offset.top - offset.bottom, 0])
  }

  function resize () {
    width = parseInt(d3.select('.svg').style('width'), 10)
    height = width * 0.5
    svg.attr('width', width).attr('height', height)
    svg.select('.x.axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (height - offset.bottom) + ')')

    plot(svg, data, width, height, offset)
  }

  function hoverIn (ctx, val) {
    var dimBar = ctx.getBoundingClientRect()

    d3.select('#value').text(val)

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimBar.left - dimTip.width / 4) + 'px')
      .style('top', (window.scrollY + dimBar.top - dimTip.height - 10) + 'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function sort () {
    if (this.dataset.type === 'asc') {
      d3.selectAll('.bar').sort(d3.ascending)
        .transition().duration(750).delay(function (d, i) { return 50 * i })
        .attr('x', function (d, i) { return scale.x(i) })
    } else {
      d3.selectAll('.bar').sort(d3.descending)
        .transition().duration(750).delay(function (d, i) { return 50 * i })
        .attr('x', function (d, i) { return scale.x(i) })
    }
  }

  function init (w, h, offset, callback) {
    d3.select(window).on('resize', resize)

    var controls = d3.select('.controls')

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

    var svg = d3.select('.svg').append('svg')
      .attr('id', 'bar-chart')
      .attr('class', 'bar-chart')
      .attr('width', w)
      .attr('height', h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (offset.left - 3) + ',' + offset.top +
        ')')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (h - offset.bottom) + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    setTimeout(function () { callback(null, svg) }, 200)
  }
}())
