/* global d3 */
(function () {
  'use strict'

  // var pathAfcw = 'afcw-roster.tsv'
  var pathEng2 = 'eng2-rosters.tsv'
  var data = []
  var positions = {
    G: 'Goalkeeper',
    D: 'Defender',
    M: 'Midfielder',
    F: 'Forward'
  }
  var columns = ['No', 'Name', 'Pos']
  var currentTeamID = ''
  var teams = []
  var table = {}
  var thead = {}
  var tbody = {}

  // Let's load all teams!
  d3.tsv(pathEng2, function (err, res) {
    if (err) throw err

    var teamIDs = []
    var teamObjs = {}

    data = res.map(function (val) {
      val.Pos = positions[val.Pos]

      // Extract team ids and team names
      if (teamIDs.indexOf(val['TeamID']) < 0) {
        teamIDs.push(val['TeamID'])
        teamObjs[val['TeamID']] = val['Team']
      }

      return val
    })

    // Merge team ids and team names
    teamIDs.forEach(function (val) {
      teams.push({
        Team: teamObjs[val],
        TeamID: val
      })
    })

    // Sort teams alphabetically
    teams.sort(function (a, b) {
      if (a.TeamID < b.TeamID) return -1
      if (a.TeamID > b.TeamID) return 1
      return 0
    })

    fillForm(d3.select('select'), teams)
  })

  function plot (head, body, data, dataHead) {
    var th = head.selectAll('th')
      .data(dataHead)

    th.enter().append('th')
      .on('click', function (attr) {
        body.selectAll('tr').sort(function (a, b) {
          // Convert 'No' to numbers while handling empty strings
          return (attr === 'No')
            ? d3.ascending(+a[attr], +b[attr])
            : d3.ascending(a[attr], b[attr])
        })
      })
      .text(function (d) { return d })
    th.exit().remove()

    var rows = body.selectAll('tr').data(data)

    rows.enter().append('tr')
    rows.exit().remove()

    var cells = body.selectAll('tr').selectAll('td').data(function (row) {
      var ret = []

      columns.forEach(function (d) { ret.push(row[d]) })
      return ret
    })

    cells.enter().append('td')
      .merge(cells)
        .text(function (d) { return d })
    cells.exit().remove()
  }

  function fillForm (form, data) {
    form.selectAll('option').data(data)
      .enter().append('option')
        .attr('value', function (d) { return d.TeamID })
        .text(function (d) { return d.Team })

    form.on('change', update)

    // Init HTML containers
    init()

    // ...and update!
    update()
  }

  function update () {
    var form = document.getElementById('teams')
    currentTeamID = form.value
    d3.select('h1')
      .text(teams[form.selectedIndex].Team)

    plot(thead, tbody, data.filter(function (d) {
      return d.TeamID === currentTeamID
    }).sort(function (a, b) {
      // Convert 'No' to numbers while handling empty strings
      return d3.ascending(+a['No'], +b['No'])
    }), columns)
  }

  function init () {
    d3.select('body').append('h1')
    d3.select('body').append('div').attr('class', 'wrapper')

    table = d3.select('.wrapper').append('table')
      .attr('id', 'roster')
      .attr('class', 'table table-striped')

    thead = table.append('thead').append('tr')

    tbody = table.append('tbody')
  }
}())
