export interface HistogramBin {
  label: string
  count: number
}

export function computeHistogram(values: number[], binCount = 20): HistogramBin[] {
  if (values.length === 0) return []

  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) {
    return [{ label: min.toFixed(0), count: values.length }]
  }

  const binWidth = (max - min) / binCount
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    label: (min + i * binWidth).toFixed(0),
    count: 0,
  }))

  for (const value of values) {
    const index = Math.min(binCount - 1, Math.floor((value - min) / binWidth))
    bins[index].count += 1
  }

  return bins
}
