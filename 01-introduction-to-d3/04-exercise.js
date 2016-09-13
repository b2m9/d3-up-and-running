/* global d3 */
(function () {
  'use strict'

  var s = d3.select('body').append('svg')
    .attr('width', 400).attr('height', 250)

  // First circle
  s.append('circle')
    .attr('cx', 150).attr('cy', 150)
    .attr('r', 60)
    .attr('fill', 'blue')

  // Second circle
  s.append('circle')
    .attr('cx', 85).attr('cy', 50)
    .attr('r', 25)
    .attr('fill', 'red')

  // Third circle
  s.append('circle')
    .attr('cx', 215).attr('cy', 50)
    .attr('r', 25)
    .attr('fill', 'red')
}())
