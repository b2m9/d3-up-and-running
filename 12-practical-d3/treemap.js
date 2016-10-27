/* global d3 */
(function () {
  'use strict'

  // Source, Germany Budget 2015:
  // https://www.govdata.de/daten/-/details/bundeshaushalt-2015
  var path = 'germany-2015.dsv'

  // Dimensions
  var dim = {
    w: 960,
    h: 550
  }

  d3.queue()
    .defer(init, dim)
    .defer(d3.request, path)
    .await(function (err, ctx, res) {
      if (err) throw err

      var data = prepData(res.response, dim)

      plot(ctx, data)
    })

  function plot (ctx, data, dim) {
    plotChart(ctx.select('.chart'), data)
  }

  function plotChart (ctx, data) {
    var colours = d3.shuffle(d3.schemeCategory20.concat(['#35978f', '#c51b7d']))
    var nodes = ctx.selectAll('.node').data(data.leaves())
      .enter().append('g')
        .attr('class', 'node')

    nodes.append('rect')
      .attr('class', 'tree-rect')
      .attr('x', function (d) { return d.x0 })
      .attr('y', function (d) { return d.y0 })
      .attr('width', function (d) { return d.x1 - d.x0 })
      .attr('height', function (d) { return d.y1 - d.y0 })
      .attr('fill', function (d) {
        return colours[d.data.itemNo]
      })
      .on('mouseover', function (d) { hoverIn(this, d) })
      .on('mouseout', hoverOut)

    nodes.append('text')
      .attr('class', 'tree-text')
      .attr('x', function (d) { return d.x0 })
      .attr('y', function (d) { return d.y0 })
      .attr('dx', 3)
      .attr('clip-path', 'url(#overflow)')
      .attr('dy', 13)
      .text(function (d) { return d.data.key })
  }

  function hoverIn (ctx, val) {
    var dimRect = ctx.getBoundingClientRect()

    d3.select('#parent').text(val.parent.data.key)
    d3.select('#item').text(val.data.key)
    d3.select('#value').text(d3.format(',.2r')(val.data.budget + '000') + ' EUR')

    var dimTip = document.getElementById('tooltip').getBoundingClientRect()

    d3.select('#tooltip')
      .style('left', (dimRect.left + dimRect.width / 2 - dimTip.width / 2) +
        'px')
      .style('top', (window.scrollY + dimRect.top - dimTip.height - 10) + 'px')
      .transition().duration(250)
        .style('opacity', 1)
  }

  function hoverOut () {
    d3.select('#tooltip')
      .transition().duration(250)
        .style('opacity', 0)
  }

  function prepData (csv, dim) {
    // Root of hierarchy
    var output = {
      key: 'Budget 2015',
      values: []
    }

    // Only keep the 'spending' part of the budget
    var parsed = d3.dsvFormat(';').parse(csv).filter(function (d) {
      return d['einnahmen-ausgaben'] === 'A'
    })

    // Index for spending categories
    var keys = []

    // Let's modify the budget...
    d3.nest().key(function (d) {
      // ...by grouping it by spending category...
      return d['einzelplan-text']
    }).key(function (d) {
      // ...and then by spending item...
      return d['kapitel-text']
    }).entries(parsed).map(function (d) {
      output.values.push({
        key: d.key,
        values: d.values.map(function (v) {
          // ...and sum up spending of all values in this item/group
          return {
            key: v.key,
            budget: d3.sum(v.values, function (d) { return +d['soll'] }),
            itemNo: (keys.indexOf(v.values[0]['einzelplan']) >= 0)
              ? keys.indexOf(v.values[0]['einzelplan'])
              : keys.push(v.values[0]['einzelplan']) - 1
          }
        })
      })
    })

    // Create tree map layout
    return d3.treemap()
      .size([dim.w - 4, dim.h])(d3.hierarchy(output, function (d) {
        // Define accessor
        return d.values
      }).sum(function (d) {
        // Sum up all the values
        return d.budget
      }).sort(function (a, b) {
        // Sort by either height or value
        return b.height - a.height || b.value - a.value
      }))
  }

  function init (dim, callback) {
    d3.select('body').append('h1').text('Germany: Budget 2015')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'graph')
      .attr('class', 'graph')
      .attr('width', dim.w)
      .attr('height', dim.h)

    // Prevent text from overflowing
    svg.append('defs')
      .append('clipPath')
        .attr('id', 'overflow')
        .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', dim.w - 6)
          .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'chart')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
