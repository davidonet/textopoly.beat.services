export function getL(t) {
  if (t === undefined) return 'l0'
  const l = t.length
  if (l < 1) return 'l0'
  if (l < 4) return 'l4'
  if (l < 15) return 'l15'
  if (l < 50) return 'l50'
  if (l < 150) return 'l150'
  if (l < 300) return 'l300'
  return 'l600'
}

export function getStepX(z) {
  switch (z) {
    case 1:
      return 240
    case 2:
      return 120
    case 4:
      return 60
    case 10:
      return 24
    case 20:
      return 12
    case 40:
      return 6
  }
}

export function getStepY(z) {
  switch (z) {
    case 1:
      return 160
    case 2:
      return 80
    case 4:
      return 40
    case 10:
      return 16
    case 20:
      return 8
    case 40:
      return 4
  }
}
