/* global d3, topojson */
(function () {
  'use strict'

  var dataPath = 'unemployment.tsv'
  var topoPath = 'us.json'

  // Dimensions
  var dim = {
    w: 850,
    h: 500
  }

  d3.queue()
    .defer(d3.tsv, dataPath)
    .defer(d3.json, topoPath)
    .defer(init, dim)
    .await(function (err, tsv, topo, ctx) {
      if (err) throw err

      var data = d3.map()

      tsv.map(function (d) { data.set(d['id'], +d['rate']) })
      plot(ctx, data, topo, dim)
    })

  function plot (ctx, data, topo, dim) {
    var colour = calcCScale(data)

    var projection = d3.geoAlbersUsa()
      .translate([dim.w / 2, dim.h / 2])

    plotChart(ctx.select('.choropleth'), data, topo, projection, colour)
  }

  function plotChart (ctx, data, topo, projection, c) {
    var path = d3.geoPath()
      .projection(projection)

    ctx.append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(topojson.feature(topo, topo.objects.counties).features)
      .enter().append('path')
        .attr('fill', function (d) { return c(data.get(d['id'])) })
        .attr('d', path)
  }

  function calcCScale () {
    return d3.scaleQuantize().domain([0, 0.15]).range(['rgb(247,251,255)',
      'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)',
      'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,81,156)',
      'rgb(8,48,107)'])
  }

  function init (dim, callback) {
    d3.select('body').append('h1').text('US Unemployment')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'map')
      .attr('class', 'map')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'choropleth')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
