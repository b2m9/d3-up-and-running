/* global d3, topojson */
(function () {
  'use strict'

  var map = {
    width: 960,
    height: 600,
    product: getHash('product') || '0901',
    products: {},
    year: getHash('year') || 2012,
    topoUrl: 'topo_countries.json',
    oecUrlBase: 'http://atlas.media.mit.edu/hs07/export/',
    oecUrlPath: '/show/all/',
    oecUrlSuffix: '/',
    metaURL: 'http://atlas.media.mit.edu/attr/hs07/',
    activeNode: null,
    legend: d3.select('#legend').append('ul')
  }

  d3.select('#update').on('click', function () {
    map.year = document.getElementById('year').value
    map.product = document.getElementById('product').value

    setHash('year', document.getElementById('year').value, getHash())
    setHash('product', document.getElementById('product').value, getHash())

    prepMap(map, [loadOecData, plotMap])
    d3.event.preventDefault()
  })

  document.getElementById('year').value = map.year

  getProducts(map, appendProducts)
  init(map, [mergeTopoJson, prepMap, loadOecData, plotMap])

  function init (map, cb) {
    map.svg = d3.select('#svg-container').append('svg')
      .attr('width', map.width)
      .attr('height', map.height)
      .append('g')
        .attr('transform', 'translate(0,50)')
        .attr('class', 'vis')
        .append('g')
          .attr('class', 'zoom')

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

      map.countries.forEach(function (geo) {
        if (countryId === geo.id.toLowerCase()) {
          geo.properties.export_val = val
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

    map.path = d3.geoPath().projection(d3.geoMercator())

    var color = d3.scaleQuantize().domain(d3.extent(map.countries,
      function (d) { return d.properties.export_val }))
      .range(['#f6eff7', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0',
        '#02818a', '#016450'])

    var keys = d3.select('ul').selectAll('li')
      .data(color.range().map(function (val) {
        return {
          color: val,
          val: color.invertExtent(val)
        }
      }))

    keys.enter().append('li')
      .attr('class', 'key')
      .style('border-left-color', function (d) { return d.color })
      .text(function (d) {
        return d3.format('$,.0f')(d.val[0]) + ' - ' +
          d3.format('$,.0f')(d.val[1])
      })

    keys.text(function (d) {
      return d3.format('$,.0f')(d.val[0]) + ' - ' +
        d3.format('$,.0f')(d.val[1])
    })

    paths.enter().insert('path', '.country')
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('class', 'country')
      .attr('d', map.path)
      .style('stroke', 'steelblue')
      .style('fill', function (d) {
        var val = d.properties.export_val

        if (val) return color(val)
        else return '#fff'
      })
      .on('click', function (d) { zoom.call(d3.select(this), map, d) })
      .on('mouseover', function (d) { hoverIn(map, d) })
      .on('mouseout', hoverOut)

    paths.transition().duration(750).style('fill', function (d) {
      var val = d.properties.export_val

      if (val) return color(val)
      else return '#fff'
    })
  }

  // Credits to Mike Bostock: http://bl.ocks.org/mbostock/4699541
  function zoom (map, d) {
    if (map.activeNode && map.activeNode.node() === this.node()) {
      return reset(map)
    }

    map.activeNode = this.classed('active', true)

    var bounds = map.path.bounds(d)
    var dx = bounds[1][0] - bounds[0][0]
    var dy = bounds[1][1] - bounds[0][1]
    var x = (bounds[0][0] + bounds[1][0]) / 2
    var y = (bounds[0][1] + bounds[1][1]) / 2
    var scale = 0.9 / Math.max(dx / map.width, dy / map.height)
    var translate = [map.width / 2 - scale * x, map.height / 2 - scale * y]

    d3.select('g.zoom').transition().duration(750)
      .attr('transform', 'translate(' + translate + ')scale(' + scale + ')')
  }

  function reset (map) {
    map.activeNode.classed('active', false)
    map.activeNode = d3.select(null)

    d3.select('g.zoom').transition().duration(750)
      .attr('transform', '')
  }

  function getProducts (map, cb) {
    d3.json(map.metaURL, function (err, res) {
      if (err) throw err

      if (typeof cb === 'function') cb(map, res)
      else if (typeof cb[0] === 'function') {
        cb.splice(0, 1)[0](map, res, cb)
      }
    })
  }

  function hoverIn (map, d) {
    d3.select('.tooltip-header').text(d.properties.name)
    d3.select('.tooltip-subtitle').text(d.id.toUpperCase())
    d3.select('.tooltip-year').text(map.year)
    d3.select('.tooltip-val').text(d3.format('$,.0f')(d.properties.export_val))

    d3.select('#tooltip')
      .style('top', d3.event.clientY + 'px')
      .style('left', d3.event.clientX + 'px')
      .classed('hidden', false)
  }

  function hoverOut () {
    d3.select('#tooltip').classed('hidden', true)
  }

  function appendProducts (map, res) {
    res.data.forEach(function (product) {
      var id = product.display_id

      // TODO: Kill the person who changed the OEC API to HS07 classification
      if (id && id.length === 4) {
        map.products[id] = {
          id: id,
          name: product.name.substr(0, d3.min([
            product.name.indexOf('.'),
            product.name.indexOf(', '),
            product.name.indexOf(';'),
            product.name.indexOf(' (')
          ].filter(function (val) { return val > -1 })))
        }

        if (map.products[id].name.length > 50) {
          map.products[ id ].name = map.products[ id ].name.substr(0, 50) + '...'
        }
      }
    })

    d3.select('#product').selectAll('option').data(d3.values(map.products))
      .enter().append('option')
      .attr('value', function (d) { return d.id })
      .text(function (d) { return d.name })

    d3.select('option[value="' + map.product + '"]')
      .attr('selected', 'selected')
  }

  function getHash (key) {
    var hash = {}

    window.location.hash.substr(1).split('&').forEach(function (pair) {
      var split = pair.split('=')

      hash[split[0]] = split[1]
    })

    if (key) return hash[key]
    else return hash
  }

  function setHash (key, value, hash) {
    var str = ''
    var keys
    var l

    hash[key] = value
    keys = Object.keys(hash)
    l = keys.length

    for (var i = 0; i < l; i++) {
      if (keys[i] !== '') {
        str += keys[i] + '=' + hash[keys[i]]

        if (keys[i + 1] && keys[i + 1] !== '') str += '&'
      }
    }

    window.location.hash = '#' + str
  }
}())
