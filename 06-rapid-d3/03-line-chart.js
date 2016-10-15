/* global d3 */
(function () {
  'use strict'

  var path = 'eng2-2013-14.json'

  // Dimensions
  var dim = {
    w: 700,
    h: 350
  }
  var offset = {
    left: 50,
    top: 20,
    right: 20,
    bottom: 20
  }

  var svg = init(dim, offset)
  var data = []

  // Let's load all teams!
  d3.json(path, function (err, res) {
    if (err) throw err

    data = prepareData(res)

    debugger
    plot(svg, data, dim, offset)
  })

  function plot (ctx, data, dim, offset) {
    var scaleX = calcXScale(data, dim, offset)
    var scaleY = calcYScale(data, dim, offset)

    plotAxes(ctx, scaleX, scaleY)
    plotChart(ctx.select('.chart'), data, scaleX, scaleY)
  }

  function plotChart (ctx, data, x, y) {

  }

  function plotAxes (ctx, x, y) {

  }

  function calcXScale (data, dim, offset) {

  }

  function calcYScale (data, dim, offset) {

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

    return map
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
