/* global d3 */
(function () {
  'use strict'

  // Data sets
  var data = {}
  var url2010 = 'http://atlas.media.mit.edu/hs/export/2010/show/all/all/'
  var url2011 = 'http://atlas.media.mit.edu/hs/export/2011/show/all/all/'
  var urlCountries = 'http://atlas.media.mit.edu/attr/country/'
  var done2010 = false
  var done2011 = false
  var doneCountries = false

  // Dimensions
  var dimensions = {
    w: 900,
    h: 400
  }
  var offset = {
    left: 40,
    top: 40,
    right: 40,
    bottom: 40
  }

  // Create SVG
  var svg = d3.select('#svg-container').append('svg')
    .attr('width', dimensions.w)
    .attr('height', dimensions.h)

  // Create group for x axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(' + offset.left + ',' +
      (dimensions.h - offset.bottom) + ')')

  // Create group for y axis
  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

  // Create group for chart
  svg.append('g')
    .attr('class', 'chart')
    .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

  // Retrieve 2010 data
  d3.json(url2010).get(function (err, res) {
    if (err) {
      throw err
    }

    res.data.forEach(function (d) {
      if (data[d.origin_id]) {
        data[d.origin_id]['export_val_2010'] = d.export_val
      } else {
        data[d.origin_id] = {
          export_val_2010: d.export_val,
          id: d.origin_id
        }
      }
    })

    done2010 = true
    plot.call(svg, data, dimensions, offset)
  })

  // Retrieve 2011 data
  d3.json(url2011).get(function (err, res) {
    if (err) {
      throw err
    }

    res.data.forEach(function (d) {
      if (data[d.origin_id]) {
        data[d.origin_id]['export_val_2011'] = d.export_val
      } else {
        data[d.origin_id] = {
          export_val_2011: d.export_val,
          id: d.origin_id
        }
      }
    })

    done2011 = true
    plot.call(svg, data, dimensions, offset)
  })

  // Retrieve attributes
  d3.json(urlCountries).get(function (err, res) {
    if (err) {
      throw err
    }

    res.data.forEach(function (d) {
      if (data[d.id]) {
        data[d.id]['name'] = d.name
        data[d.id]['color'] = d.color
      } else {
        data[d.id] = {
          name: d.name,
          color: d.color,
          id: d.id
        }
      }
    })

    doneCountries = true
    plot.call(svg, data, dimensions, offset)
  })

  d3.select('button').on('click', toggleLabels)

  function plot (data, dim, offset) {
    if (done2010 && done2011 && doneCountries) {
      data = cleanData(data)

      var scaleX = calcXScale(data, dim, offset)
      var scaleY = calcYScale(data, dim, offset)

      plotAxes.call(this, scaleX, scaleY)
      plotChart.call(this.select('.chart'), data, scaleX, scaleY)
    }
  }

  function cleanData (data) {
    var keys = Object.keys(data)
    var l = keys.length
    var ret = {}

    for (var i = 0; i < l; i++) {
      var key = keys[i]
      var d = data[key]

      if (d.export_val_2010 && d.export_val_2011 && d.name && d.color && d.id) {
        ret[key] = data[key]
      }
    }

    return d3.values(ret)
  }

  function calcXScale (data, dim, offset) {
    return d3.scaleLog().domain(d3.extent(data, function (d) {
      return d.export_val_2010
    })).range([0, dim.w - offset.left - offset.right])
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLog().domain(d3.extent(data, function (d) {
      return d.export_val_2011
    })).range([dim.h - offset.top - offset.bottom, 0])
  }

  function plotAxes (scaleX, scaleY) {
    var bottomAxis = d3.axisBottom(scaleX).ticks(5, function (d) {
      return d3.format('.2s')(d).replace('G', 'B')
    })
    var leftAxis = d3.axisLeft(scaleY).ticks(5, function (d) {
      return d3.format('.2s')(d).replace('G', 'B')
    })

    this.select('.x.axis').call(bottomAxis)
    this.select('.y.axis').call(leftAxis)
  }

  function plotChart (data, scaleX, scaleY) {
    var ctx = this.selectAll('.country').data(data)
      .enter().append('g')
        .attr('class', 'country')

    ctx.append('circle')
        .attr('class', 'point')
        .attr('cx', function (d) { return scaleX(d.export_val_2010) })
        .attr('cy', function (d) { return scaleY(d.export_val_2011) })
        .attr('r', 5)
        .attr('fill', function (d) { return d.color })

    ctx.append('text')
      .attr('class', 'point-label hidden')
      .attr('x', function (d) { return scaleX(d.export_val_2010) })
      .attr('y', function (d) { return scaleY(d.export_val_2011) })
      .text(function (d) { return d.name })
  }

  function toggleLabels () {
    var toggle = d3.select('.point-label').attr('class').includes('hidden')

    d3.selectAll('.point-label').classed('hidden', !toggle)
    this.textContent = (!toggle) ? 'Show Labels' : 'Hide Labels'
  }
}())
