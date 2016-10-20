/* global d3, topojson */
(function () {
  'use strict'

  var path = 'co2-emissions.csv'
  var topo = 'topo_countries_simplified.json'

  // Dimensions
  var dim = {
    w: 958,
    h: 400
  }

  d3.queue()
    .defer(d3.json, topo)
    .defer(d3.csv, path)
    .defer(init, dim)
    .await(function (err, topo, emissions, ctx) {
      if (err) throw err

      var geo = topojson.feature(topo, topo.objects.countries).features
      var keys = geo.map(function (c) { return c['id'] })
      var data = d3.map(emissions.filter(function (e) {
        return keys.indexOf(e['Country Code']) >= 0
      }), function (e) { return e['Country Code'] })

      plot(ctx, geo, data)
    })

  function plot (ctx, geo, data) {
    var colours = createColourScale(data.values())

    plotChart(ctx.select('.chart'), geo, data, colours)
  }

  function plotChart (ctx, geo, data, c) {
    var countries = ctx.selectAll('.country')
      .data(geo, function (d) { return d.id })

    countries.enter().insert('path', '.country')
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('class', 'country')
      .attr('d', d3.geoPath().projection(d3.geoMercator()))
      .attr('fill', function (d) {
        if (data.get(d.id) && data.get(d.id)['2010'] !== '') {
          return c(data.get(d.id)['2010'])
        }
        return '#ddd'
      })
  }

  function createColourScale (data) {
    return d3.scaleQuantize().domain(d3.extent(data, function (d) {
      return +d['2010']
    })).range(['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'])
  }

  function init (dim, callback) {
    d3.select('body').append('h1').text('Global CO2 Emissions')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'co2-choropleth')
      .attr('class', 'co2-choropleth')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'chart')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
