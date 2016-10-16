/* global d3 */
(function () {
  'use strict'

  var path = 'eng2-2013-14.json'

  // Dimensions
  var dim = {
    w: 800,
    h: 550
  }
  var offset = {
    left: 50,
    top: 20,
    right: 20,
    bottom: 50
  }

  var svg = init(dim, offset)
  var data = []

  // Let's load all teams!
  d3.json(path, function (err, res) {
    if (err) throw err

    data = prepareData(res)

    plot(svg, data, dim, offset)
  })

  function plot (ctx, data, dim, offset) {
    var scaleX = calcXScale(data, dim, offset)
    var scaleY = calcYScale(data, dim, offset)

    // We need 24 distinct colours for our league
    var c24 = d3.schemeCategory20
    c24.push(d3.schemeCategory20b[0])
    c24.push(d3.schemeCategory20b[3])
    c24.push(d3.schemeCategory20b[4])
    c24.push(d3.schemeCategory20b[7])

    plotAxes(ctx, scaleX, scaleY)
    plotChart(ctx.select('.chart'), data, scaleX, scaleY, c24)
  }

  function plotChart (ctx, data, x, y, c) {
    var line = d3.line()
      .x(function (d) { return x(d['date']) })
      .y(function (d) { return y(d['leaguePoints']) })
      .curve(d3.curveStepAfter)

    var lines = ctx.selectAll('.lines').data(data).enter()
      .append('g')
        .attr('class', 'lines')

    lines.append('path')
      .datum(function (d) { return d })
      .attr('d', line)
      .attr('stroke', function (d, i) { return c[i] })
      .on('mouseover', hoverIn)
      .on('mouseout', hoverOut)
  }

  function plotAxes (ctx, x, y) {
    var bottomAxis = d3.axisBottom(x).ticks(d3.timeSaturday.every(1))
      .tickFormat(d3.timeFormat('%d %b'))
    var leftAxis = d3.axisLeft(y)

    ctx.select('.x.axis')
      .call(bottomAxis)
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', -6)
        .attr('dy', 6)
        .attr('transform', 'rotate(-45)')
        .attr('opacity', 0)
        .transition().duration(750)
          .attr('opacity', 1)

    ctx.select('.y.axis')
      .transition().duration(750)
        .call(leftAxis)
  }

  function calcXScale (data, dim, offset) {
    return d3.scaleTime().domain([
      d3.min(data, function (d) { return d[0]['date'] }),
      d3.max(data, function (d) { return d[d.length - 1]['date'] })
    ]).range([0, dim.w - offset.left - offset.right])
  }

  function calcYScale (data, dim, offset) {
    return d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d[d.length - 1]['leaguePoints']
    })]).range([dim.h - offset.top - offset.bottom, 0])
  }

  function hoverIn () {
    d3.select(this).classed('active', true)
  }

  function hoverOut () {
    d3.select(this).classed('active', false)
  }

  function prepareData (data) {
    var map = d3.map()

    // Merge all matches into one big array
    data = d3.merge(data.map(function (dates) {
      // Add each date into respective array of matches
      dates['Games'].forEach(function (matches) {
        matches['Date'] = dates['Date']
      })

      return dates['Games']
    }))

    // Group by teams; away and home
    d3.merge([
      d3.nest().key(function (d) { return d['Away'] }).entries(data),
      d3.nest().key(function (d) { return d['Home'] }).entries(data)
    ]).forEach(function (d) {
      // If team already exists in map...
      if (map.has(d['key'])) {
        // ...merge and sort by date
        map.set(d['key'], d3.merge([ map.get(d['key']), d.values ])
          .sort(function (a, b) { return d3.ascending(a['Date'], b['Date']) }))
      } else {
        // Set team with name as key in map if it doesn't exist
        map.set(d['key'], d.values)
      }
    })

    // We still need the accumulated points for each team after each match...
    map.entries().forEach(function (d) {
      var matches = []
      var key = d['key']
      var values = d['value']

      // Calculate match outcome and construct our final object
      values.forEach(function (match) {
        matches.push(calcMatchOutcome(key, match, matches))
      })

      // Replace the corresponding values
      map.set(key, matches)
    })

    return map.values().sort(function (a, b) {
      return d3.descending(a[a.length - 1]['leaguePoints'],
        b[b.length - 1]['leaguePoints'])
    })
  }

  function calcMatchOutcome (team, match, matches) {
    var isAway = (match['Away'] === team)
    var scored = (isAway) ? +match['AwayScore'] : +match['HomeScore']
    var allowed = (isAway) ? +match['HomeScore'] : +match['AwayScore']
    var pts = (scored > allowed) ? 3 : (scored < allowed) ? 0 : 1
    var decision = (pts === 3) ? 'win' : (pts === 0) ? 'loss' : 'draw'

    // ...and finally compile our final beautiful object
    return {
      date: d3.timeParse('%Y-%m-%d')(match['Date']),
      team: team,
      align: (isAway) ? 'away' : 'home',
      opponent: (isAway) ? match['Home'] : match['Away'],
      scored: scored,
      allowed: allowed,
      venue: match['Venue'],
      decision: decision,
      points: pts,
      leaguePoints: d3.sum(matches, function (d) { return d['points'] }) + pts
    }
  }

  function init (dim, offset) {
    d3.select('body').append('h1').text('England League 2: Season 2013/14')
    d3.select('body').append('div').attr('class', 'wrapper')

    var svg = d3.select('.wrapper').append('svg')
      .attr('id', 'bar-chart')
      .attr('class', 'bar-chart')
      .attr('width', dim.w)
      .attr('height', dim.h)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + offset.left + ',' + offset.top + ')')

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
