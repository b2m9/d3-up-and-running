/* global d3, topojson */
(function () {
  'use strict'

  var map = {
    width: 1200,
    height: 500,
    product: '0901',
    year: 2012,
    topoUrl: 'topo_countries.json',
    oecUrlBase: 'http://atlas.media.mit.edu/hs07/export/',
    oecUrlPath: '/show/all/',
    oecUrlSuffix: '/'
  }

  function init (map, cb) {
    map.svg = d3.select('#svg-container').append('svg')
      .attr('width', map.width)
      .attr('height', map.height)

    loadTopoJson(map, cb)

    return map
  }

  function loadTopoJson (map, cb) {
    d3.json(map.topoUrl, function (err, res) {
      if (err) throw err

      if (typeof cb === 'function') cb(map, res)
      else if (typeof cb[0] === 'function') {
        cb.splice(0, 1)[0](map, res, cb)
      }
    })
  }

  function mergeTopoJson (map, json, cb) {
    map.countries = topojson.feature(json, json.objects.countries).features

    if (typeof cb === 'function') cb(map)
    else if (typeof cb[0] === 'function') {
      cb.splice(0, 1)[0](map, cb)
    }
  }

  function prepMap (map, cb) {
    var oecUrl = map.oecUrlBase + map.year + map.oecUrlPath + map.product +
      map.oecUrlSuffix

    d3.json(oecUrl, function (err, res) {
      if (err) throw err

      if (typeof cb === 'function') cb(map, res)
      else if (typeof cb[0] === 'function') {
        cb.splice(0, 1)[0](map, res, cb)
      }
    })
  }

  function loadOecData (map, json, cb) {
    json.data.forEach(function (d) {
      var countryId = d.origin_id.substr(2)
      var val = parseFloat(d.export_val)

      map.countries.some(function (geo) {
        var geoId = geo.id.toLowerCase()

        if (countryId === geoId) {
          geo.properties.export_val = val
          return true
        }
      })
    })

    if (typeof cb === 'function') cb(map)
    else if (typeof cb[0] === 'function') {
      cb.splice(0, 1)[0](map, cb)
    }
  }

  function plotMap (map) {
    var paths = map.svg.selectAll('.country')
      .data(map.countries, function (d) { return d.id })
    var color = d3.scaleLinear().domain(d3.extent(map.countries, function (d) {
      return d.properties.export_val
    })).range(['#f7fcf5', '#99441b']).interpolate(d3.interpolateRgb)

    paths.enter().insert('path', '.country')
      .attr('class', 'country')
      .attr('d', d3.geoPath().projection(d3.geoMercator()))
      .style('stroke', 'steelblue')
      .style('fill', function (d) {
        var val = d.properties.export_val

        if (val) return color(val)
        else return '#fff'
      })
  }

  init(map, [mergeTopoJson, prepMap, loadOecData, plotMap])
}())
