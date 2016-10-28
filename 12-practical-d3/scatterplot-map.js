/* global d3 */
(function () {
  'use strict'

  // Open Knowledge Foundation Contributions:
  // http://index.okfn.org/api/places.json
  var okfn = 'okfn-contributions.json'

  // Countries lat/lng position by @sindresorhus:
  // https://github.com/sindresorhus
  // Source: https://gist.github.com/sindresorhus/1341699
  var latlng = 'countries-latlng.json'

  // Dimensions
  var dim = {
    w: 940,
    h: 450
  }
  var offset = {
    left: 20,
    top: 10,
    right: 20,
    bottom: 10
  }

  d3.queue()
    .defer(init, dim, offset)
    .defer(d3.json, okfn)
    .defer(d3.json, latlng)
    .await(function (err, ctx, okfn, geo) {
      if (err) throw err

      var data = prepData(okfn, geo)
      var keys = extractRegions(data)

      plot(ctx, data, keys, dim.w - offset.left - offset.right,
        dim.h - offset.top - offset.bottom)
    })

  function plot (ctx, data, keys, w, h) {
    var scaleX = calcXScale(w)
    var scaleY = calcYScale(h)
    var scaleR = calcRScale(data)
    var scaleC = calcCScale(keys)

    plotLegend(ctx.select('.legend'), keys, scaleC)
    plotChart(ctx.select('.chart'), data, scaleX, scaleY, scaleR, scaleC)
  }

  function plotChart (ctx, data, x, y, r, c) {
    var countries = ctx.selectAll('.country').data(data)
      .enter().append('g')
      .attr('class', 'country')

    countries.append('circle')
      .attr('class', 'country-circle')
      .attr('cx', function (d) { return x(d.lng) })
      .attr('cy', function (d) { return y(d.lat) })
      .attr('r', function (d) { return r(d.score) })
      .attr('fill', function (d) { return c(d.region) })
      // .on('mouseover', function (d) { hoverIn(this, d) })
      // .on('mouseout', hoverOut)
  }

  function plotLegend (ctx, data, c) {
    var entries = ctx.selectAll('.entry').data(data)
      .enter().append('g')
        .attr('class', 'entry')
        // .on('click', function (d) { filter(d) })

    entries.append('rect')
      .attr('class', 'legend-rect')
      .attr('x', 0)
      .attr('y', function (d, i) { return i * 16 })
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', function (d, i) { return c(i) })

    entries.append('text')
      .attr('class', 'legend-text')
      .attr('x', 13)
      .attr('y', function (d, i) { return i * 16 })
      .text(function (d) { return d })
      .attr('dy', 9)
  }

  function hoverIn (ctx, val) {
    var dimBar = ctx.getBoundingClientRect()

    d3.select('#name').text(val.key + ': ')
    d3.select('#value').text(val.score)

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimBar.left + dimBar.width + 9) + 'px')
      .style('top', (window.scrollY + dimBar.top - dimTip.height / 2 + 2) +
        'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function filter (key) {
    if (d3.select('.faded').node() &&
      d3.select('.selected').data()[0].region === key) {
      d3.selectAll('.bar')
        .classed('faded', false)
        .classed('selected', false)
    } else {
      d3.selectAll('.bar').filter(function (d) { return d.region !== key })
        .classed('faded', true)
        .classed('selected', false)
      d3.selectAll('.bar').filter(function (d) { return d.region === key })
        .classed('faded', false)
        .classed('selected', true)
    }
  }

  function calcXScale (w) {
    // x is longitude
    return d3.scaleLinear().domain([-160, 180]).range([0, w])
  }

  function calcYScale (h) {
    // y is latitude (shortened poles)
    return d3.scaleLinear().domain([-45, 80]).range([h, 0])
  }

  function calcRScale (data) {
    // debugger
    return d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d.score
    })]).range([0, 30])
  }

  function calcCScale (data) {
    return d3.scaleOrdinal().domain(data).range(['#8dd3c7', '#ffffb3',
      '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69' ])
  }

  function extractRegions (data) {
    return d3.nest().key(function (d) { return d.region }).entries(data)
      .map(function (d) { return d.key })
  }

  function prepData (data, geo) {
    var result = []

    data.map(function (d) {
      var pos = geo[d['id']]

      if (pos) {
        result.push({
          name: d['name'],
          score: +d['score'],
          region: d['region'],
          lat: +pos[0],
          lng: +pos[1]
        })
      }
    })

    return result
  }

  function init (dim, offset, callback) {
    d3.select('body').append('h1').text('Open Knowledge Foundation: ' +
      'Open Data Score')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'scattermap')
      .attr('class', 'scattermap')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(15,15)')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
