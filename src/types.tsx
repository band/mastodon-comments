// Define our own types based on the Mastodon API
export interface CommentEmptyDetails {
  code: string;
  message: string;
}

export interface CommentOptions {
  uri?: string;
  author?: string;
  instance?: string; // Mastodon instance URL
  commentFilters?: Array<(arg: any) => boolean>;
  onEmpty?: (details: CommentEmptyDetails) => void;
}

// Mastodon Status interface based on masto's Status
export interface MastodonStatus {
  id: string;
  uri: string;
  createdAt: string;
  account: {
    id: string;
    username: string;
    acct: string;
    displayName: string;
    avatar: string;
    url: string;
  };
  content: string;
  reblogsCount: number;
  favouritesCount: number;
  repliesCount: number;
  url?: string | null;
  inReplyToId?: string | null;
  inReplyToAccountId?: string | null;
}

// Define context type for threads
export interface MastodonContext {
  ancestors: MastodonStatus[];
  descendants: MastodonStatus[];
}

export interface MastodonThread {
  status: MastodonStatus;
  context: MastodonContext;
}
