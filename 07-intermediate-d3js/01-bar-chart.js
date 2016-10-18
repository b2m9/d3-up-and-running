/* global d3 */
(function () {
  'use strict'

  var path = 'data.json'

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

    data = res

    plot(svg, data, dim, offset)
  })

  function plot (ctx, data, dim, offset) {
    scale.x = calcXScale(data, dim, offset)
    scale.y = calcYScale(data, dim, offset)

    plotAxes(ctx, scale.x, scale.y)
    plotChart(ctx.select('.chart'), data, scale.x, scale.y,
      dim.h - offset.top - offset.bottom)
  }

  function plotChart (ctx, data, x, y, h) {
    var bars = ctx.selectAll('.bar').data(data)

    bars.enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function (d, i) { return x(i) })
      .attr('width', x.bandwidth())
      .attr('y', h)
      .attr('height', 0)
      .on('mouseover', function (d) { hoverIn(this, d) })
      .on('mouseout', hoverOut)
      .merge(bars)
        .transition()
          .duration(750)
          .delay(function (d, i) { return 25 * i })
          .attr('y', function (d) { return y(d) })
          .attr('height', function (d) { return h - y(d) })
          .on('end', function () {
            d3.select(this)
              .classed('bar--high', function (d) { return (d >= 20) })
          })
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
      .paddingInner(0.05)
      .paddingOuter(0.05)
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLinear().domain([0, d3.max(data)])
      .range([dim.h - offset.top - offset.bottom, 0])
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

  function init (dim, offset) {
    d3.select('body').append('h1').text('A Beautiful Bar Chart')
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
