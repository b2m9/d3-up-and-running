/* global d3 */
(function () {
  'use strict'

  var path = 'pie-data.json'

  // Dimensions
  var dim = {
    w: 700,
    h: 400
  }

  var svg = init(dim)
  var data = []

  d3.json(path, function (err, res) {
    if (err) throw err

    data = res

    plot(svg, data, dim)
  })

  function plot (ctx, data, dim) {
    var outerRadius = dim.h / 2
    var innerRadius = 0

    plotChart(ctx.select('.chart'), d3.pie()(data), outerRadius, innerRadius)
  }

  function plotChart (ctx, data, oR, iR) {
    var arcGenerator = d3.arc().innerRadius(iR).outerRadius(oR)
    var arcs = ctx.selectAll('path').data(data)

    arcs.enter().append('path')
      .attr('fill', function (d, i) { return d3.schemeCategory10[i] })
      .attr('d', arcGenerator)
      .on('mouseover', function (d) { hoverIn(this, d) })
      .on('mouseout', hoverOut)
  }

  function hoverIn (ctx, val) {
    var dimSlice = ctx.getBoundingClientRect()

    d3.select('#value').text(val.value)

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimSlice.left + dimSlice.width / 2 - dimTip.width / 4) + 'px')
      .style('top', (window.scrollY + dimSlice.top + dimSlice.height / 2 -
        dimTip.height) + 'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function init (dim) {
    d3.select('body').append('h1').text('A Beautiful Pie Chart')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'pie-chart')
      .attr('class', 'pie-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + (dim.w / 2) + ',' + (dim.h / 2) + ')')

    return svg
  }
}())
