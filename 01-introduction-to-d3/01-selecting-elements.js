/* global d3 */
(function () {
  // Update
  var p = d3.select('body').selectAll('p')
    .data([1, 2, 3, 4, 8])
      .text(function (d) { return 'Update: I am ' + d })

  // Enter
  p.enter().append('p')
    .transition()
      .duration(750)
      .style('background-color', 'red')
    .text(function (d) { return 'Enter: I am ' + d })

  // Exit
  p.exit().remove()
}())
