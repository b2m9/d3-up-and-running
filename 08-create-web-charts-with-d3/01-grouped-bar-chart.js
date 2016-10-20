/* global d3 */
(function () {
  'use strict'

  var path = 'us-states-population-breakdown.csv'

  // Dimensions
  var dim = {
    w: 800,
    h: 400
  }
  var margin = {
    left: 50,
    top: 30,
    right: 30,
    bottom: 20
  }

  d3.queue()
    .defer(d3.csv, path)
    .defer(init, dim, margin)
    .await(function (err, data, ctx) {
      if (err) throw err

      var keys = d3.keys(data[0]).filter(function (key) {
        return key !== 'State'
      })

      data.forEach(function (d) {
        d.ages = keys.map(function (name) {
          return { age: name, value: +d[name] }
        })
      })

      plot(ctx, data, keys, { w: dim.w - margin.left - margin.right,
        h: dim.h - margin.top - margin.bottom })
    })

  function plot (ctx, data, keys, dim) {
    var x0 = calcOuterXScale(data, dim)
    var x1 = calcInnerXScale(keys, x0)
    var y = calcYScale(data, dim)
    var c = calcCScale(data)

    plotAxes(ctx, x0, y)
    plotChart(ctx.select('.chart'), data, x0, x1, y, c, dim.h)
  }

  function plotChart (ctx, data, x0, x1, y, c, h) {
    var groups = ctx.selectAll('.state').data(data)
      .enter().append('g')
        .attr('class', 'state')
      .attr('transform', function (d) {
        return 'translate(' + x0(d['State']) + ',0)'
      })

    groups.selectAll('rect')
        .data(function (d) { return d.ages })
      .enter().append('rect')
        .attr('width', x1.bandwidth() - 1)
        .attr('x', function (d) { return x1(d.age) })
        .attr('y', h)
        .attr('height', 0)
        .attr('fill', function (d, i) { return c(i)})
        .transition()
          .duration(750)
          .delay(function (d, i) { return 50 * i })
          .attr('y', function (d) { return y(d.value) })
          .attr('height', function (d) { return h - y(d.value) })

    // bars.enter().append('rect')
    //   .attr('class', 'bar')
    //   .attr('x', function (d, i) { return x(i) })
    //   .attr('width', x.bandwidth())
    //   .attr('y', h)
    //   .attr('height', 0)
    //   // .on('mouseover', function (d) { hoverIn(this, d) })
    //   // .on('mouseout', hoverOut)
    //   .merge(bars)
    //     .transition()
    //       .duration(750)
    //       .delay(function (d, i) { return 25 * i })
    //       .attr('y', function (d) { return y(d) })
    //       .attr('height', function (d) { return h - y(d) })
    //       .on('end', function () {
    //         d3.select(this)
    //           .classed('bar--high', function (d) { return (d >= 20) })
    //       })
  }

  function plotAxes (ctx, x, y) {
    var bottomAxis = d3.axisBottom().scale(x)
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

  function calcOuterXScale (data, dim) {
    return d3.scaleBand().domain(data.map(function (d) { return d['State'] }))
      .range([0, dim.w]).paddingOuter(0.1).paddingInner(0.1)
  }

  function calcInnerXScale (data, outerScale) {
    return d3.scaleBand().domain(data).range([0, outerScale.bandwidth()])
  }

  function calcYScale (data, dim) {
    return d3.scaleLinear().domain([0, d3.max(data.map(function (d) {
      return d3.max(d.ages.map(function (g) { return g.value }))
    }))]).range([dim.h, 0])
  }

  function calcCScale (data) {
    return d3.scaleOrdinal().domain(d3.range(data.length)).range([
      '#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c',
      '#ff8c00'
    ])
  }

  // function hoverIn (ctx, val) {
  //   var dimBar = ctx.getBoundingClientRect()
  //
  //   d3.select('#value').text(val)
  //
  //   var dimTip = document.getElementById('tooltip').getBoundingClientRect()
  //
  //   d3.select('#tooltip')
  //     .style('left', (dimBar.left - dimTip.width / 4) + 'px')
  //     .style('top', (window.scrollY + dimBar.top - dimTip.height - 10) + 'px')
  //     .transition().duration(250)
  //       .style('opacity', 1)
  // }
  //
  // function hoverOut () {
  //   d3.select('#tooltip')
  //     .transition().duration(250)
  //       .style('opacity', 0)
  // }
  //
  // function sort () {
  //   if (this.dataset.type === 'asc') {
  //     d3.selectAll('.bar').sort(d3.ascending)
  //       .transition().duration(750).delay(function (d, i) { return 50 * i })
  //       .attr('x', function (d, i) { return scale.x(i) })
  //   } else {
  //     d3.selectAll('.bar').sort(d3.descending)
  //       .transition().duration(750).delay(function (d, i) { return 50 * i })
  //       .attr('x', function (d, i) { return scale.x(i) })
  //   }
  // }

  function init (dim, margin, callback) {
    d3.select('body').append('h1').text('Population by Age Group')
    d3.select('body').append('div').attr('class', 'wrapper')

    var controls = d3.select('.wrapper').append('div')
      .attr('class', 'controls')

    controls.append('button')
      .attr('class', 'btn btn-default')
      .attr('data-type', 'asc')
      // .on('click', sort)
      .text('Sort ascending')

    controls.append('button')
      .attr('class', 'btn btn-default')
      .attr('data-type', 'desc')
      // .on('click', sort)
      .text('Sort descending')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'bar-chart')
      .attr('class', 'bar-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left - 3) + ',' + margin.top + ')')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + margin.left + ',' +
        (dim.h - margin.bottom) + ')')

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    setTimeout(function () { callback(null, svg) }, 250)
  }
}())
