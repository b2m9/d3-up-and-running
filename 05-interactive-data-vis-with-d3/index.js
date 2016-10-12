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

      that.data = that.prepData(res.data.children)
      that.plot()
    })
  }

  rv.prepData = function (data) {
    data.forEach(function (val) {
      val.data.created_utc = parseInt(val.data.created_utc + '000', 10)
    })

    return data
  }

  rv.plot = function () {
    // Plot table
    this.scatterplot.plot(this.container, this.data)
    this.table.plot(this.container, this.data)
  }
}())
