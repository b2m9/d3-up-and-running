/* global d3 */
(function () {
  'use strict'

  var path = 'flare.csv'

  // Dimensions
  var width = parseInt(d3.select('.svg').style('width'), 10)
  var height = width

  var scale = {
    x: null,
    y: null,
    c: null
  }
  var data
  var svg

  d3.queue()
    .defer(init, width, height)
    .defer(d3.csv, path)
    .await(function (err, ctx, res) {
      if (err) throw err

      var stratify = d3.stratify().parentId(function (d) {
        return d.id.substring(0, d.id.lastIndexOf('.'))
      })

      var pack = d3.pack().size([width - 2, height - 2]).padding(3)

      data = stratify(res).sum(function (d) { return d.value })
        .sort(function (a, b) { return b.value - a.value })

      pack(data)
      svg = ctx

      plot(ctx, data)
    })

  function plot (ctx, data) {
    var c = d3.scaleSequential(d3.interpolateMagma).domain([-4, 4])
    var f = d3.format(',d')

    var nodes = ctx.select('.chart').selectAll('g')
      .data(data.descendants())
        .enter().append('g')
          .attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')'
          })
          .attr('class', function (d) {
            return 'node' + (!d.children
                ? ' node--leaf'
                : d.depth ? '' : ' node--root')
          })
          .each(function (d) { d.node = this })
          .on('mouseover', hovered(true))
          .on('mouseout', hovered(false))

    nodes.append('circle')
      .attr('id', function (d) { return 'node-' + d.id })
      .attr('r', function (d) { return d.r })
      .style('fill', function (d) { return c(d.depth) })

    var leaves = nodes.filter(function (d) { return !d.children })

    leaves.append('clipPath')
      .attr('id', function (d) { return 'clip-' + d.id })
      .append('use')
        .attr('xlink:href', function(d) { return '#node-' + d.id })

    leaves.append('text')
      .attr('clip-path', function(d) { return 'url(#clip-' + d.id + ')'; })
      .selectAll('tspan')
      .data(function (d) {
        return d.id.substring(d.id.lastIndexOf('.') + 1)
          .split(/(?=[A-Z][^A-Z])/g)
      })
      .enter().append('tspan')
        .attr('x', 0)
        .attr('y', function (d, i, nodes) {
          return 13 + (i - nodes.length / 2 - 0.5) * 10
        })
        .text(function (d) { return d })

    nodes.append('title')
      .text(function (d) { return d.id + '\n' + f(d.value) })
  }

  function hovered (hover) {
    return function (d) {
      d3.selectAll(d.ancestors().map(function (d) {
        return d.node
      })).classed('node--hover', hover)
    }
  }

  function init (w, h, callback) {
    var svg = d3.select('.svg').append('svg')
      .attr('id', 'packed-chart')
      .attr('class', 'packed-chart')
      .attr('width', w)
      .attr('height', h)

    svg.append('g')
      .attr('class', 'chart')

    setTimeout(function () { callback(null, svg) }, 200)
  }
}())
