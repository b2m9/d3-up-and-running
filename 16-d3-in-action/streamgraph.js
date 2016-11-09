/* global d3 */
(function () {
  'use strict'

  var dim = (function () {
    var offset = { left: 20, top: 20, right: 20, bottom: 20 }
    var ratio = 0.5
    var width = parseInt(d3.select('.svg').style('width'), 10)
    var height = Math.round(width * ratio)

    return {
      w: function (val) {
        if (val) width = (val - offset.left - offset.right)
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
    y: null,
    c: null
  }
  var data = {
    numLayers: 5,
    numSamples: 40,
    values1: null,
    values2: null
  }
  var svg = null
  var area = null
  var stack = d3.stack()
    .keys(d3.keys(d3.range(data.numLayers)))
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetWiggle)

  d3.queue()
    .defer(init, dim.w(), dim.h(), dim.offset())
    .await(function (err, ctx) {
      if (err) throw err

      svg = ctx

      // Create 2 random dat asets
      data.values1 = stack(d3.range(data.numSamples).map(function () {
        return d3.range(data.numLayers).map(function () {
          return d3.randomUniform()()
        })
      }))

      data.values2 = stack(d3.range(data.numSamples).map(function () {
        return d3.range(data.numLayers).map(function () {
          return d3.randomUniform()()
        })
      }))

      plot(ctx, data, scale, dim.w(), dim.h())
    })

  function plot (ctx, series, scale, w, h) {
    scale.x = calcXScale(series, w)
    scale.y = calcYScale(series, h)
    scale.c = calcCScale()

    area = d3.area()
      .x(function (d, i) { return scale.x(i) })
      .y0(function (d) { return scale.y(d[0]) })
      .y1(function (d) { return scale.y(d[1]) })
      .curve(d3.curveBasis)

    plotChart(ctx.select('.chart'), series.values1, area, scale.c)
  }

  function plotChart (ctx, series, area, c) {
    var groups = ctx.selectAll('path').data(series)

    var enter = groups.enter().append('path')
      .style('fill', function () { return c(Math.random()) })

    groups.merge(enter).attr('d', area)
  }

  function update () {
    // Swap data sets
    d3.selectAll('path')
      .data(function () {
        var d = data.values2
        data.values2 = data.values1
        data.values1 = d

        return d
      })
    .transition()
      .duration(1500)
      .attr('d', area)
  }

  function calcXScale (data, w) {
    return d3.scaleLinear().domain([0, data.numSamples - 1]).range([0, w])
  }

  function calcYScale (data, h) {
    return d3.scaleLinear()
      .domain([d3.min(data.values1.concat(data.values2), function (layers) {
        return d3.min(layers, function (d) { return d[0] })
      }), d3.max(data.values1.concat(data.values2), function (layers) {
        return d3.max(layers, function (d) { return d[1] })
      })])
      .range([h, 0])
  }

  function calcCScale () {
    return d3.scaleLinear().range(['#f7fbff', '#08306b'])
  }

  function resize () {
    var w = dim.w(parseInt(d3.select('.svg').style('width'), 10))
    var h = dim.h(w)
    var offset = dim.offset()

    svg.attr('width', w + offset.left + offset.right)
      .attr('height', h + offset.top + offset.bottom)

    plot(svg, data, scale, dim.w(), dim.h())
  }

  function init (w, h, offset, callback) {
    var controls = d3.select('.controls')

    controls.append('button')
      .attr('class', 'btn btn-default')
      .on('click', update)
      .text('Update data')

    var svg = d3.select('.svg').append('svg')
      .attr('id', 'vis')
      .attr('class', 'vis')
      .attr('width', w + offset.left + offset.right)
      .attr('height', h + offset.top + offset.bottom)

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    d3.select(window).on('resize', resize)

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
