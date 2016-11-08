/* global d3 */
(function () {
  'use strict'

  var path = 'data.csv'

  var dim = (function () {
    var offset = { left: 20, top: 20, right: 20, bottom: 40 }
    var ratio = 0.5
    var width = parseInt(d3.select('.svg').style('width'), 10)
    var height = Math.round(width * ratio)

    return {
      w: function (val) {
        if (val) width = val
        return width - offset.left - offset.right
      },
      h: function (val) {
        if (val) height = Math.round(val * ratio)
        return height - offset.top - offset.bottom
      },
      offset: function () { return offset }
    }
  }())

  var scale = {
    x: null,
    y: null
  }

  var axis = {
    x: null,
    y: null
  }

  var svg = null
  var data = null

  d3.queue()
    .defer(init, dim.w(), dim.h(), dim.offset())
    .defer(d3.csv, path)
    .await(function (err, ctx, res) {
      if (err) throw err

      res.forEach((d) => {
        d['day'] = +d['day']
        d['min'] = +d['min']
        d['max'] = +d['max']
        d['median'] = +d['median']
        d['q1'] = +d['q1']
        d['q3'] = +d['q3']
      })
      svg = ctx
      data = res

      plot(ctx, res, scale, dim.w(), dim.h())
    })

  function plot (ctx, data, scale, w, h) {
    scale.x = calcXScale(data, w)
    scale.y = calcYScale(data, h)

    plotAxis(ctx, scale.x, scale.y)
    plotChart(ctx.select('.chart'), data, scale.x, scale.y)
  }

  function plotChart (ctx, data, x, y) {
    console.log('plot chart')
    const halfBandwidth = x.bandwidth() / 2

    var groups = ctx.selectAll('.box').data(data)

    var enter = groups.enter().append('g')
      .attr('class', 'box')

    groups.merge(enter)
      .attr('transform', (d) => ('translate(' + (x(d['day']) + halfBandwidth) +
        ',0)'))
      .on('mouseover', function (d) { hoverIn(this, d) })
      .on('mouseout', hoverOut)

    // Connection from 3rd quartile to max
    enter.append('line')
      .attr('class', 'box__upper-connector')
      .attr('x1', 0)
      .attr('x2', 0)

    groups.merge(enter).select('.box__upper-connector')
      .attr('y1', (d) => (y(d['q3'])))
      .attr('y2', (d) => (y(d['q3'])))
      .transition()
        .duration(500)
        .delay((d, i) => (500 + 50 * i))
        .attr('y2', (d) => (y(d['max'])))

    // Connection from 1st quartile to min
    enter.append('line')
      .attr('class', 'box__lower-connector')
      .attr('x1', 0)
      .attr('x2', 0)

    groups.merge(enter).select('.box__lower-connector')
      .attr('y1', (d) => (y(d['q1'])))
      .attr('y2', (d) => (y(d['q1'])))
      .transition()
        .duration(500)
        .delay((d, i) => (500 + 50 * i))
        .attr('y2', (d) => (y(d['min'])))

    // Rectangle from 3rd quartile to 1st quartile
    enter.append('rect')
      .attr('class', 'box__rect')
      .attr('x', -20)
      .attr('width', 40)
      .attr('height', 0)

    groups.merge(enter).select('rect')
      .attr('y', (d) => (y(d['median'])))
        .transition()
          .duration(500)
          .delay((d, i) => (50 * i))
          .attr('y', (d) => (y(d['q3'])))
          .attr('height', (d) => (y(d['q1']) - y(d['q3'])))

    // Minimum
    enter.append('line')
      .attr('class', 'box__min')

    groups.merge(enter).select('.box__min')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', (d) => (y(d['min'])))
      .attr('y2', (d) => (y(d['min'])))
      .transition()
        .duration(500)
        .delay((d, i) => (1000 + 50 * i))
        .attr('x1', -10)
        .attr('x2', 10)

    // Maximum
    enter.append('line')
      .attr('class', 'box__max')

    groups.merge(enter).select('.box__max')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', (d) => (y(d['max'])))
      .attr('y2', (d) => (y(d['max'])))
      .transition()
        .duration(500)
        .delay((d, i) => (1000 + 50 * i))
        .attr('x1', -10)
        .attr('x2', 10)

    // Median
    enter.append('line')
      .attr('class', 'box__median')

    groups.merge(enter).select('.box__median')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', (d) => (y(d['median'])))
      .attr('y2', (d) => (y(d['median'])))
      .transition()
        .duration(500)
        .delay((d, i) => (1000 + 50 * i))
        .attr('x1', -20)
        .attr('x2', 20)
  }

  function plotAxis (ctx, x, y) {
    axis.x = d3.axisBottom().scale(x)
    axis.y = d3.axisLeft().scale(y)

    ctx.select('.axis--x')
      .attr('opacity', 0)
      .call(axis.x)
        .transition().duration(750).delay(500)
        .attr('opacity', 1)

    ctx.select('.axis--y')
      .attr('opacity', 0)
      .call(axis.y)
        .transition().duration(750).delay(500)
        .attr('opacity', 1)
  }

  function hoverIn (ctx, d) {
    d3.select('#min').text(d['min'])
    d3.select('#q1').text(d['q1'])
    d3.select('#median').text(d['median'])
    d3.select('#q3').text(d['q3'])
    d3.select('#max').text(d['max'])

    var dimElem = ctx.getBoundingClientRect()
    var dimMedian = ctx.getElementsByClassName('box__median')[0]
      .getBoundingClientRect()
    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (window.scrollX + dimElem.left + dimElem.width + 9) +
        'px')
      .style('top', (window.scrollY + dimMedian.top - (dimTip.height / 2) - 6) +
        'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function sort () {
    var transition = svg.transition().duration(750)
    var delay = (d, i) => (80 * i)
    var x = scale.x

    if (this.dataset.type === 'asc') {
      x.domain(data.sort((a, b) => {
        var diff = a['median'] - b['median']
        return (diff === 0) ? a['q3'] - b['q3'] : diff
      }).map((d) => d['day']))

      svg.selectAll('.box').sort((a, b) => (x(a['day']) - x(b['day'])))
    } else {
      x.domain(data.sort((a, b) => {
        var diff = b['median'] - a['median']
        return (diff === 0) ? b['q1'] - a['q1'] : diff
      }).map((d) => d['day']))

      svg.selectAll('.box').sort((a, b) => (x(b['day']) - x(a['day'])))
    }

    transition.selectAll('.box')
      .delay(delay)
      .attr('transform', (d) => ('translate(' + (x(d['day']) +
        x.bandwidth() / 2) + ',0)'))

    transition.select('.axis--x')
      .call(axis.x)
      .selectAll('g')
        .delay(delay)
  }

  function calcXScale (data, w) {
    return d3.scaleBand()
      .domain(data.map((d) => (d['day'])))
      .range([0, w])
  }

  function calcYScale (data, h) {
    return d3.scaleLinear()
      .domain([0, d3.max(data, (d) => (d['max']))])
      .range([h, 0])
  }

  function resize () {
    var w = dim.w(parseInt(d3.select('.svg').style('width'), 10))
    var h = dim.h(w)
    var offset = dim.offset()

    svg.attr('width', w + offset.left + offset.right)
      .attr('height', h + offset.top + offset.bottom)
    svg.select('.axis--y')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')
    svg.select('.axis--x')
      .attr('transform', 'translate(' + offset.left + ',' +
        (h + offset.top) + ')')

    plot(svg, data, scale, w, h)
  }

  function init (w, h, offset, callback) {
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
      .attr('id', 'vis')
      .attr('class', 'vis')
      .attr('width', w + offset.left + offset.right)
      .attr('height', h + offset.top + offset.bottom)

    svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(' + offset.left + ',' +
        (h + offset.top) + ')')

    svg.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    d3.select(window).on('resize', resize)

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
