/**
 * Half-open interval overlap: [start, end)
 * Touching endpoints do not overlap (end === other.start is OK).
 */
function overlapsIso(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

module.exports = { overlapsIso };
