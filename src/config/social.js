export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/mxintech/',
  linkedin: 'https://www.linkedin.com/company/mxintech/',
  youtube: 'https://www.youtube.com/mexicointech',
  x: 'https://x.com/mxintech',
  tiktok: 'https://www.tiktok.com/mxintech',
  twitch: 'https://www.twitch.tv/mxintech',
  meetup: 'https://www.meetup.com/aws-user-group-tlaxcala/',
};

export const youtubeThumbnail = (videoId, quality = 'maxresdefault') =>
  `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;

export const youtubeLiveUrl = (videoId) => `https://youtube.com/live/${videoId}`;
