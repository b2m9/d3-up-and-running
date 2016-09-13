/* global d3 */
(function () {
  // Create SVG
  var s = d3.select('body').append('svg')
    .attr('height', 200)
    .attr('width', 500)

  // Append line
  s.append('line')
    .attr('x1', 10).attr('y1', 10)
    .attr('x2', 190).attr('y2', 190)
    .attr('stroke', 'teal')
    .attr('stroke-width', 2)

  // Append another line
  s.append('line')
    .attr('x1', 190).attr('y1', 190)
    .attr('x2', 400).attr('y2', 0)
    .attr('stroke', 'orange')
    .attr('stroke-width', 2)

  // Append rectangle
  s.append('rect')
    .attr('x', 200).attr('y', 10)
    .attr('width', 100)
    .attr('height', 100)
    .attr('fill', 'salmon')

  // Append circle
  s.append('circle')
    .attr('cx', 300).attr('cy', 140)
    .attr('r', 50)
    .attr('fill', 'magenta')

  // Append text
  s.append('text')
    .attr('x', 250).attr('y', 100)
    .attr('fill', 'charcoal')
    .attr('font-size', 36).attr('font-weight', 'bold')
    .text('Blurb.')
}())
