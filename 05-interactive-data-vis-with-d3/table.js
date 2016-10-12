/* global d3 */
(function () {
  'use strict'

  var rv = window.redditVis = window.redditVis || {}
  var table = rv.table = {}

  // Create table content
  table.plot = function (container, data) {
    if (window.document.getElementsByTagName('table').length === 0) {
      this.create(container)
    }

    var rows = container.select('table').selectAll('tr.data').data(data)
    var cells = rows.enter().append('tr').attr('class', 'data')

    cells.append('td')
      .attr('class', 'td-score')
      .text(function (d) { return d.data.score })
    cells.append('td')
      .attr('class', 'td-img')
      .classed('reddit-self', function (d) {
        if (d.data.thumbnail === 'self' || d.data.thumbnail === 'default') {
          return true
        } else {
          return false
        }
      }).append('img')
        .attr('src', function (d) {
          if (d.data.thumbnail === 'self' || d.data.thumbnail === 'default') {
            return ''
          } else {
            return d.data.thumbnail
          }
        })
    cells.append('td').append('a')
      .attr('class', 'td-link')
      .attr('href', function (d) { return d.data.url })
      .text(function (d) { return d.data.title })
    cells.append('td')
      .attr('class', 'td-comments')
      .text(function (d) { return d.data.num_comments })
    cells.append('td')
      .attr('class', 'td-date')
      .text(function (d) { return rv.timeFormat(d.data.created_utc + '000') })
  }

  // Create hard-coded table head
  table.create = function (dom) {
    var row = dom.append('table').append('tr')
      .attr('class', 'header')

    row.append('th')
      .text('Score')
    row.append('th')
      .text('Image')
    row.append('th')
      .text('Link')
    row.append('th')
      .text('Comments')
    row.append('th')
      .text('Date Created')
  }
}())
