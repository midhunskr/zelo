export function getConsistentAvatar(userId) {
    const defaultAvatars = [
        '/images/profile1.svg',
        '/images/profile2.svg',
        '/images/profile3.svg',
        '/images/profile4.svg',
        '/images/profile5.svg',
        '/images/profile6.svg',
        '/images/profile7.svg',
        '/images/profile8.svg',
        '/images/profile9.svg',
    ]
    const index = userId
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0) % defaultAvatars.length
    return defaultAvatars[index]
}