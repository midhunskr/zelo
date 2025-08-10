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

  const hash = String(userId)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  const avatarIndex = hash % defaultAvatars.length
  const colorIndex = hash % fallbackColors.length

  return {
    avatarUrl: defaultAvatars[avatarIndex],
    backgroundColor: fallbackColors[colorIndex],
    sizeClass: size,
  }
}