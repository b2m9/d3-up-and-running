/* global d3 */
(function () {
  'use strict'

  var path = 'dummy-data-2.csv'

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
    var radius = calcRadiusScale(data, dim)
    var angle = calcAngleScale(data.map(function (d) { return d['section'] }))
    var colour = calcColourScale(Object.keys(data[0]).slice(1))

    plotAxes(ctx.select('.axis'), radius, angle, data.map(function (d) {
      return d['section']
    }))

    data = [extractByKey(data, 'set1'), extractByKey(data, 'set2')]
    plotChart(ctx.select('.chart'), data, radius, angle, colour)
  }

  function plotChart (ctx, data, radius, angle, colour) {
    var g = ctx.selectAll('.set').data(data)
      .enter().append('g')
        .attr('class', 'set')

    g.append('polygon')
      .attr('class', 'set-polygon')
      .attr('points', function (d) {
        return d.map(function (d) {
          return radius(d.data) * Math.sin(angle(d.values['section'])) + ',' +
            radius(d.data) * Math.cos(angle(d.values['section']))
        }).join(' ')
      })
      .attr('stroke', function (d) { return colour(d[0].key) })
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    g.selectAll('.set-circle').data(function (d) { return d })
      .enter().append('circle')
      .attr('cx', function (d) {
        return radius(d.data) * Math.sin(angle(d.values['section']))
      })
      .attr('cy', function (d) {
        return radius(d.data) * Math.cos(angle(d.values['section']))
      })
      .attr('r', 4)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('fill', function (d) { return colour(d.key) })
      .on('mouseover', function (d) { hoverIn(this, d) })
      .on('mouseout', hoverOut)
  }

  function plotAxes (ctx, radius, angle, data) {
    var length = radius.range()[1] * 1.05

    // Add radial scale
    var radial = ctx.selectAll('.radial').data(radius.ticks(5).slice(1))
      .enter().append('g')
        .attr('class', 'radial')

    radial.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', function (d) { return radius(d) })

    radial.append('text')
      .attr('class', 'radial-text')
      .text(function (d) { return d })
      .attr('x', 0)
      .attr('y', function (d) { return -radius(d) })
      .attr('dx', 2)
      .attr('dy', -1)

    // Add grid lines
    var grid = ctx.selectAll('.line')
      .data(data).enter().append('g')
        .attr('class', 'line')

    grid.append('line')
      .attr('class', 'line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', function (d) { return length * Math.sin(angle(d)) })
      .attr('y2', function (d) { return length * Math.cos(angle(d)) })

    grid.append('text')
      .attr('class', 'grid-text')
      .text(function (d) { return d })
      .attr('x', function (d) { return length * Math.sin(angle(d)) })
      .attr('y', function (d) { return length * Math.cos(angle(d)) })
      .attr('text-anchor', 'middle')
      .attr('dx', function (d) { return 10 * Math.sin(angle(d)) })
      .attr('dy', function (d) { return 10 * Math.cos(angle(d)) })
      .attr('transform', 'translate(0, 3)')
  }

  function calcAngleScale (data) {
    var l = data.length

    return d3.scaleOrdinal().domain(data).range(data.map(function (d, i) {
      return i * ((Math.PI * 2) / l)
    }))
  }

  function calcRadiusScale (data, dim) {
    return d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d3.max([+d['set1'], +d['set2']])
    })]).nice(5).range([0, dim.h * 0.42])
  }

  function calcColourScale (data) {
    return d3.scaleOrdinal().domain(data).range(['#d95f0e', '#2c7fb8'])
  }

  function extractByKey (data, key) {
    return data.map(function (d) {
      return { key: key, data: d[key], values: d }
    })
  }

  function hoverIn (ctx, val) {
    var dimPt = ctx.getBoundingClientRect()

    d3.select('#name').text(val.values['section'] + ': ')
    d3.select('#value').text(val.data)

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimPt.left + dimPt.width / 2 - dimTip.width / 2) + 'px')
      .style('top', (window.scrollY + dimPt.top - dimTip.height - 10) + 'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function init (dim, callback) {
    d3.select('body').append('h1').text('Radar Chart')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'donut-chart')
      .attr('class', 'donut-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + (dim.w / 2) + ',' + (dim.h / 2) + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + (dim.w / 2) + ',' + (dim.h / 2) + ')')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
