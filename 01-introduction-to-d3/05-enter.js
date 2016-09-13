/* global d3 */
(function () {
  'use strict'

  // Create SVG
  var s = d3.select('body').append('svg')
    .attr('height', 200)
    .attr('width', 500)

  // Create circles
  s.selectAll('circle')
    .data([5, 10, 7, 18])
    .enter().append('circle')
      .attr('cx', function (d, i) {
        return (i * 35) + 20
      })
      .attr('cy', 100)
      .attr('r', function (d) {
        return d
      })
      .attr('fill', 'blue')
      .style('opacity', 0)
    .transition()
      .duration(750)
      .style('opacity', 1)

  // Create rectangles
  s.selectAll('rect')
    .data([
      { w: 10, h: 20 },
      { w: 20, h: 10 },
      { w: 25, h: 25 }
    ])
    .enter().append('rect')
      .attr('x', function (d, i) {
        return (i * 35) + 170
      })
      .attr('y', 90)
      .attr('width', function (d) {
        return d.w
      })
      .attr('height', function (d) {
        return d.h
      })
      .attr('fill', 'red')
}())
