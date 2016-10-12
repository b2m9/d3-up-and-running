/* global d3 */
(function () {
  'use strict'

  var rv = window.redditVis = window.redditVis || {}

  rv.url = 'https://www.reddit.com/top/.json?t=all'
  rv.localUrl = 'reddit.json'


  rv.timeFormat = d3.timeFormat("%d %b '%y")

  rv.load = function (selector) {
    this.container = d3.select(selector)
    this.loadJSON(this.url)
  }

  rv.loadJSON = function (url) {
    var that = this

    d3.json(url, function (err, res) {
      if (err) throw err

      that.data = res.data.children
      that.plot()
    })
  }

  rv.plot = function () {
    // Plot table
    this.table.plot(this.container, this.data)
  }
}())
