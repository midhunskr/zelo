export function getConsistentAvatar(userId, size = 'w-12 h-12') {
  const defaultAvatars = [
    '/images/profile1.svg',
    '/images/profile2.svg',
    '/images/profile3.svg',
    '/images/profile4.svg',
    '/images/profile5.svg',
    '/images/profile6.svg',
  ]

  const fallbackColors = [
    '#9A6BED', // purple
    '#F5653C', // orange
    '#56D271', // green
    '#FDBC32', // yellow
    '#37ACF4', // blue
  ]


  // Use numeric userId for ordered color assignment, fallback to hash if not numeric
  let numericId = parseInt(userId, 10)
  if (isNaN(numericId)) {
    // fallback: hash for non-numeric ids
    numericId = String(userId)
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  }

  const avatarIndex = numericId % defaultAvatars.length
  const colorIndex = numericId % fallbackColors.length

  return {
    avatarUrl: defaultAvatars[avatarIndex],
    backgroundColor: fallbackColors[colorIndex],
    sizeClass: size,
  }
}