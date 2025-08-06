import { MastodonStatus } from './types';

type MastodonComment = { status: MastodonStatus };

const MinLikeCountFilter = (
  min: number
): ((comment: MastodonComment) => boolean) => {
  return (comment: MastodonComment) => {
    return (comment.status.favouritesCount ?? 0) < min;
  };
};

const MinCharacterCountFilter = (
  min: number
): ((comment: MastodonComment) => boolean) => {
  return (comment: MastodonComment) => {
    // Extract text length from HTML content (simplified approach)
    const div = document.createElement('div');
    div.innerHTML = comment.status.content;
    const textContent = div.textContent || div.innerText || '';
    return textContent.length < min;
  };
};

const TextContainsFilter = (
  text: string
): ((comment: MastodonComment) => boolean) => {
  return (comment: MastodonComment) => {
    // Check if HTML content contains the text
    const div = document.createElement('div');
    div.innerHTML = comment.status.content;
    const textContent = div.textContent || div.innerText || '';
    return textContent.toLowerCase().includes(text.toLowerCase());
  };
};

const ExactMatchFilter = (
  text: string
): ((comment: MastodonComment) => boolean) => {
  return (comment: MastodonComment) => {
    // Check if HTML content matches exactly
    const div = document.createElement('div');
    div.innerHTML = comment.status.content;
    const textContent = div.textContent || div.innerText || '';
    return textContent.toLowerCase() === text.toLowerCase();
  };
};

export const Filters = {
  MinLikeCountFilter,
  MinCharacterCountFilter,
  TextContainsFilter,
  ExactMatchFilter,
  NoLikes: MinLikeCountFilter(0),
  NoPins: ExactMatchFilter('📌'),
};

export default Filters;
