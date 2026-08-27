export const normalizeWheelDelta = (input: { deltaY: number; deltaMode: number; rootHeight: number }) => {
  if (input.deltaMode === 1) return input.deltaY * 40
  if (input.deltaMode === 2) return input.deltaY * input.rootHeight
  return input.deltaY
}

export const shouldMarkBoundaryGesture = (input: {
  delta: number
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}) => {
  const max = input.scrollHeight - input.clientHeight
  if (max <= 1) return true
  if (!input.delta) return false

  if (input.delta < 0) return input.scrollTop + input.delta <= 0

  const remaining = max - input.scrollTop
  return input.delta > remaining
}

export const isTimelineRowAbove = (input: {
  rowTop?: number
  viewportTop: number
  rowIndex?: number
  firstVisibleIndex?: number
}) => {
  if (input.rowTop !== undefined) return input.rowTop < input.viewportTop - 1
  return (
    input.rowIndex !== undefined && input.firstVisibleIndex !== undefined && input.rowIndex < input.firstVisibleIndex
  )
}
