/* global d3 */
(function () {
  'use strict'

  // OEC APIs
  var baseURL = 'http://atlas.media.mit.edu/hs/export/'
  var baseSuffix = '/show/all/all/'
  var metaURL = 'http://atlas.media.mit.edu/attr/country/'
  var promise = {
    x: false,
    y: false,
    meta: false
  }
  var data = {}
  var meta = {}
  var showLabels = false
  var xYear = 2010
  var yYear = 2011

  // Dimensions
  var dimensions = {
    w: parseInt(d3.select('#svg-container').style('width'), 10),
    h: parseInt(d3.select('#svg-container').style('height'), 10)
  }
  var offset = {
    left: 40,
    top: 40,
    right: 40,
    bottom: 40
  }

  var svg = createSVGGroups(dimensions, offset)

  d3.select('form').on('submit', function () {
    xYear = document.getElementById('xaxis').value
    yYear = document.getElementById('yaxis').value
    showLabels = document.getElementById('labels').checked

    data = {}
    promise.x = false
    promise.y = false

    if (promise.meta === false) {
      queryOEC(metaURL, promise, 'meta', getMeta)
    }

    queryOEC(baseURL + xYear + baseSuffix, promise, 'x', getData)
    queryOEC(baseURL + yYear + baseSuffix, promise, 'y', getData)

    d3.event.preventDefault()
  })

  function queryOEC (url, promise, flag, callback) {
    d3.json(url).get(function (err, res) {
      if (err) throw err

      callback(res, flag)
      promise[flag] = true

      plot.call(svg, meta, data, dimensions, offset)
    })
  }

  function plot (meta, data, dim, offset) {
    if (promise.x && promise.y && promise.meta) {
      data = cleanData(meta, data)

      var scaleX = calcXScale(data, dim, offset)
      var scaleY = calcYScale(data, dim, offset)

      plotAxes.call(this, scaleX, scaleY)
      plotChart.call(this.select('.chart'), data, scaleX, scaleY)
    }
  }

  function calcXScale (data, dim, offset) {
    console.log('x-scale: ', d3.extent(data, function (d) { return d.x }))

    return d3.scaleLog().domain(d3.extent(data, function (d) { return d.x }))
      .range([0, dim.w - offset.left - offset.right])
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLog().domain(d3.extent(data, function (d) { return d.y }))
      .range([dim.h - offset.top - offset.bottom, 0])
  }

  function plotAxes (scaleX, scaleY) {
    var bottomAxis = d3.axisBottom(scaleX).ticks(5, function (d) {
      return d3.format('.2s')(d).replace('G', 'B')
    })
    var leftAxis = d3.axisLeft(scaleY).ticks(5, function (d) {
      return d3.format('.2s')(d).replace('G', 'B')
    })

    this.select('.x.axis').transition().duration(750)
      .call(bottomAxis)
    this.select('.y.axis').transition().duration(750)
      .call(leftAxis)
  }

  function plotChart (data, scaleX, scaleY) {
    var ctx = this.selectAll('.country').data(data)

    // Enter
    var g = ctx.enter().append('g')
      .attr('class', 'country')

    g.append('circle')
      .attr('cx', function (d) { return scaleX(d.x) })
      .attr('cy', function (d) { return scaleY(d.y) })
      .attr('fill', function (d) { return d.color })
      .attr('r', 0)
      .on('mouseover', hoverIn)
      .on('mouseout', hoverOut)
      .transition().duration(750)
        .attr('r', 5)

    g.append('text')
      .attr('class', 'point-label')
      .classed('hidden', !showLabels)
      .attr('x', function (d) { return scaleX(d.x) })
      .attr('y', function (d) { return scaleY(d.y) })
      .text(function (d) { return d.name })

    // Update
    ctx.select('circle').transition().duration(750)
      .attr('cx', function (d) { return scaleX(d.x) })
      .attr('cy', function (d) { return scaleY(d.y) })

    ctx.select('text')
      .attr('x', function (d) { return scaleX(d.x) })
      .attr('y', function (d) { return scaleY(d.y) })
      .classed('hidden', !showLabels)
      .text(function (d) { return d.name })

    // Exit
    ctx.exit().transition().duration(750)
      .attr('opacity', 0)
      .remove()
  }

  function hoverIn (d) {
    d3.select('.tooltip-header').text(d.name)
    d3.select('.tooltip-subtitle').text(d.id.toUpperCase())
    d3.select('.tooltip-data-row-x > th')
      .text(xYear + ' Export Value')
    d3.select('.tooltip-data-row-x > td')
      .text(d3.format('$,.0f')(d.x))
    d3.select('.tooltip-data-row-y > td')
      .text(d3.format('$,.0f')(d.y))
    d3.select('.tooltip-data-row-y > th')
      .text(yYear + ' Export Value')

    d3.select('#tooltip')
      .style('top', d3.event.clientY + 'px')
      .style('left', d3.event.clientX + 'px')
      .classed('hidden', false)
  }

  function hoverOut () {
    d3.select('#tooltip').classed('hidden', true)
  }

  function createSVGGroups (dim, offset) {
    // Create SVG
    var svg = d3.select('#svg-container').append('svg')
      .attr('width', dim.w)
      .attr('height', dim.h)

    // Create group for x axis
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + offset.left + ',' +
        (dim.h - offset.bottom) + ')')

    // Create group for y axis
    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    // Create group for chart
    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

    return svg
  }

  function getData (res, flag) {
    res.data.forEach(function (d) {
      var id = d.origin_id

      if (!data[id]) {
        data[id] = {
          id: id
        }
      }

      data[id][flag] = d.export_val
    })

    console.log('Data:', Object.keys(data).length)
  }

  function getMeta (res) {
    meta = res.data
  }

  function cleanData (meta, data) {
    var keys = Object.keys(data)
    var l = keys.length
    var ret = []

    data = addMeta(meta, data)

    for (var i = 0; i < l; i++) {
      var d = data[keys[i]]

      if (Object.keys(d).length === 5) {
        ret.push(d)
      }
    }

    console.log('Data:', ret.length)
    return ret
  }

  function addMeta (meta, data) {
    meta.forEach(function (d) {
      if (data[d.id]) {
        data[d.id]['name'] = d.name
        data[d.id]['color'] = d.color
        data[d.id]['id'] = d.id
      }
    })

    return data
  }
}())
