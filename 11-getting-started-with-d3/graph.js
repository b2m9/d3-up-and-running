/* global d3 */
(function () {
  'use strict'

  var path = 'stations_graph.json'

  // Dimensions
  var dim = {
    w: 960,
    h: 550
  }

  var svg = init(dim)

  d3.json(path, function (err, res) {
    if (err) throw err

    plot(svg, res, dim)
  })

  function plot (ctx, data, dim) {
    plotChart(ctx.select('.chart'), data, dim)
  }

  function plotChart (ctx, data, dim) {
    // Force Simulation
    var simulation = d3.forceSimulation()
      .force('center', d3.forceCenter(dim.w / 2, dim.h / 2))
      .force('charge', d3.forceManyBody())
      .force('link', d3.forceLink())

    // Add edges
    var edges = ctx.selectAll('line').data(data.links)
      .enter().append('line')
        .style('stroke', '#ccc')
        .style('stroke-width', 1)

    // Add nodes
    var nodes = ctx.selectAll('circle').data(data.nodes)
      .enter().append('circle')
        .attr('r', 5)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))

    nodes.append('title')
      .text(function (d) { return d.name })

    simulation.nodes(data.nodes).on('tick',
      function () { ticked(edges, nodes) })
    simulation.force('link').links(data.links)

    function dragstarted (d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()

      d.fx = d.x
      d.fy = d.y
    }

    function dragged (d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended (d) {
      if (!d3.event.active) simulation.alphaTarget(0)

      d.fx = null
      d.fy = null
    }
  }

  function ticked (edges, nodes) {
    edges.attr('x1', function (d) { return d.source.x })
      .attr('y1', function (d) { return d.source.y })
      .attr('x2', function (d) { return d.target.x })
      .attr('y2', function (d) { return d.target.y })

    nodes.attr('cx', function (d) { return d.x })
      .attr('cy', function (d) { return d.y })
  }

  function init (dim, offset) {
    d3.select('body').append('h1').text('MTA Line Network')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'graph')
      .attr('class', 'graph')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'chart')

    return svg
  }
}())
