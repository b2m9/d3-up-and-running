/* global d3 */
(function () {
  'use strict'

  /*
   * Members of G7:
   * Canada (CAN), France (FRA), Germany (DEU), Italy (ITA), Japan (JPN),
   * UK (GBR), United States (USA)
   * Source: https://en.wikipedia.org/wiki/Group_of_Seven
   * */
  var g7Codes = ['CAN', 'FRA', 'DEU', 'ITA', 'JPN', 'GBR', 'USA']

  var path = 'co2-emissions.csv'

  // Dimensions
  var dim = {
    w: 800,
    h: 350
  }
  var offset = {
    left: 50,
    top: 40,
    right: 20,
    bottom: 20
  }

  var svg = init(dim, offset)

  d3.csv(path, function (err, res) {
    if (err) throw err

    plot(svg, prepData(res, g7Codes), dim, offset, g7Codes)
  })

  function plot (ctx, data, dim, offset, keys) {
    var scaleX = calcXScale(data, dim, offset)
    var scaleY = calcYScale(data, dim, offset, keys)

    plotAxes(ctx, scaleX, scaleY)
    plotChart(ctx.select('.chart'), d3.stack().keys(keys)
        .order(d3.stackOrderDescending)(data), scaleX, scaleY)
  }

  function plotChart (ctx, data, x, y) {
    var area = d3.area()
      .x(function (d) { return x(d.data.year) })
      .y0(function (d) { return y(d[0]) })
      .y1(function (d) { return y(d[1]) })

    var countries = ctx.selectAll('.country').data(data)
        .enter().append('g')
          .attr('class', 'country')

    countries.append('path')
      .attr('class', 'country-area')
      .attr('fill', function (d, i) { return d3.schemeCategory20[i] })
      .attr('d', area)
  }

  function plotAxes (ctx, x, y) {
    var bottomAxis = d3.axisBottom().scale(x).tickFormat('')
      .tickSizeInner(0).tickSizeOuter(0)
    var leftAxis = d3.axisLeft().scale(y).tickFormat(d3.format('.2s'))

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
    return d3.scaleLinear().domain(d3.extent(data, function (d) {
      return d.year
    })).range([0, dim.w - offset.left - offset.right])
  }

  function calcYScale (data, dim, offset, keys) {
    return d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d3.sum(keys.map(function (key) { return d[key] }))
    })]).range([dim.h - offset.top - offset.bottom, 0])
  }

  function prepData (data, g7Codes) {
    // Filter G7 out of the international data set
    var g7 = data.filter(function (d) {
      return g7Codes.indexOf(d['Country Code']) >= 0
    })

    // Create map for each year
    var cleaned = d3.map(Object.keys(g7[5]).filter(function (key) {
      // Remove all non-numeric keys
      return parseInt(key, 10)
    }).map(function (year) {
      // Use numeric keys to initialise objects
      return {year: year}
    }), function (d) {
      // Set key, group by year
      return d.year
    })

    // Add data points for each country per year
    cleaned.each(function (year) {
      g7.map(function (country) {
        year[country['Country Code']] = parseInt(country[year.year], 10) || 0
      })
    })

    // And a little hack to slice of 2014 - 2016 because we don't have any data
    return cleaned.values().slice(0, -3)
  }

  function init (dim, offset) {
    d3.select('body').append('h1').text('G7 CO2 Emissions')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'bar-chart')
      .attr('class', 'bar-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (offset.left - 5) + ',' + offset.top + ')')

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
