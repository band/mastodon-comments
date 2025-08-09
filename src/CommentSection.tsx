import React, { useState, useEffect, useRef } from 'react';
import { createRestAPIClient } from 'masto';
import styles from './CommentSection.module.css';
import { CommentOptions, MastodonStatus, MastodonThread, MastodonContext } from './types';
import { PostSummary } from './PostSummary';
import { Comment } from './Comment';

// Extract status ID from a Mastodon URL
const getStatusId = (uri: string): string | null => {
  // Match patterns like https://mastodon.social/@username/123456789
  const mastodonMatch = uri.match(/\/(@[\w.-]+)\/(\d+)/);
  if (mastodonMatch) {
    return mastodonMatch[2];
  }
  return uri; // If it's already an ID
};

// Default Mastodon instance if none provided
const DEFAULT_INSTANCE = 'https://hachyderm.io';

export const CommentSection = ({
  uri: propUri,
  author,
  instance = DEFAULT_INSTANCE,
  onEmpty,
  commentFilters,
}: CommentOptions) => {
  const [statusId, setStatusId] = useState<string | null>(null);
  const [thread, setThread] = useState<MastodonThread | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const lastVisibleIndexRef = useRef(0);

  useEffect(() => {
    if (propUri) {
      const id = getStatusId(propUri);
      if (id) {
        setStatusId(id);
      } else {
        setError('Invalid Mastodon post URL');
        onEmpty?.({ code: 'invalid_uri', message: 'Invalid Mastodon post URL' });
      }
      return;
    }

    if (author) {
      const fetchPost = async () => {
        const currentUrl = window.location.href;
        try {
          const masto = createRestAPIClient({
            url: instance,
          });
          
          // Search for statuses by the author that link to the current URL
          const results = await masto.v2.search.list({
            q: currentUrl,
            type: 'statuses',
            limit: 1,
            resolve: true
          });

          if (results.statuses && results.statuses.length > 0) {
            const post = results.statuses[0];
            // Find posts by the specified author
            if (post.account.acct.includes(author) || post.account.username === author) {
              setStatusId(post.id);
            } else {
              setError('No matching post found by the specified author');
              onEmpty?.({ code: 'not_found', message: 'No matching post found by the specified author' });
            }
          } else {
            setError('No matching post found');
            onEmpty?.({ code: 'not_found', message: 'No matching post found' });
          }
        } catch (err) {
          setError('Error fetching post');
          onEmpty?.({ code: 'fetching_error', message: 'Error fetching post' });
        }
      };

      fetchPost();
    }
  }, [propUri, author, instance, onEmpty]);

  useEffect(() => {
    if (statusId) {
      const fetchThreadData = async () => {
        try {
          const thread = await getPostThread(statusId, instance);
          setThread(thread);
        } catch (err) {
          setError('Error loading comments');
          onEmpty?.({
            code: 'comment_loading_error',
            message: 'Error loading comments',
          });
        }
      };

      fetchThreadData();
    }
  }, [statusId, instance, onEmpty]);

  useEffect(() => {
    if (visibleCount > lastVisibleIndexRef.current) {
      const newBlockquotes = document.querySelectorAll(
        `blockquote[data-index="${lastVisibleIndexRef.current + 1}"]`
      );
      if (newBlockquotes.length > 0) {
        const firstNewBlockquote = newBlockquotes[0];
        const link = firstNewBlockquote.querySelector('a');
        if (link) {
          link.focus();
        }
      }
      lastVisibleIndexRef.current = visibleCount;
    }
  }, [visibleCount]);

  const showMore = () => {
    setVisibleCount((prevCount) => {
      const newCount = prevCount + 5;
      // focus on the first new comment
      setTimeout(() => {
        const newBlockquotes = document.querySelectorAll(
          `blockquote[data-index="${prevCount}"]`
        );
        if (newBlockquotes.length > 0) {
          const firstNewBlockquote = newBlockquotes[0];
          const link = firstNewBlockquote.querySelector('a');
          if (link) {
            link.focus();
          }
        }
      }, 0);
      return newCount;
    });
  };

  if (!statusId) return null;

  if (error) {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (!thread) {
    return <p className={styles.loadingText}>Loading comments...</p>;
  }

  const { status, context } = thread;
  const postUrl = status.url;

  if (!context.descendants || context.descendants.length === 0) {
    return (
      <div className={styles.container}>
        <PostSummary postUrl={postUrl || ''} status={status} />
      </div>
    );
  }
  
  const sortedReplies = context.descendants.sort(sortByLikes);

  return (
    <div className={styles.container}>
      <PostSummary postUrl={postUrl || ''} status={status} />
      <hr className={styles.divider} />
      <div className={styles.commentsList}>
        {sortedReplies.slice(0, visibleCount).map((reply: MastodonStatus, index: number) => {
          return (
            <Comment
              key={reply.id}
              status={reply}
              filters={commentFilters}
              dataIndex={index}
              instance={instance}
            />
          );
        })}
        {visibleCount < sortedReplies.length && (
          <button onClick={showMore} className={styles.showMoreButton}>
            Show more comments
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M15.854 7.646a.5.5 0 0 1 .001.707l-5.465 5.484a.55.55 0 0 1-.78 0L4.147 8.353a.5.5 0 1 1 .708-.706L10 12.812l5.147-5.165a.5.5 0 0 1 .707-.001"/></svg>
          </button>
        )}
      </div>
    </div>
  );
};

const getPostThread = async (statusId: string, instance: string): Promise<MastodonThread> => {
  const masto = createRestAPIClient({
    url: instance,
  });

  // Get the status
  const rawStatus = await masto.v1.statuses.$select(statusId).fetch();
  
  // Get the context (replies)
  const rawContext = await masto.v1.statuses.$select(statusId).context.fetch();
  
  // Convert from the API's Status to our simplified MastodonStatus
  const status: MastodonStatus = {
    id: rawStatus.id,
    uri: rawStatus.uri,
    createdAt: rawStatus.createdAt,
    account: {
      id: rawStatus.account.id,
      username: rawStatus.account.username,
      acct: rawStatus.account.acct,
      displayName: rawStatus.account.displayName || rawStatus.account.username,
      avatar: rawStatus.account.avatar,
      url: rawStatus.account.url
    },
    content: rawStatus.content,
    reblogsCount: rawStatus.reblogsCount,
    favouritesCount: rawStatus.favouritesCount,
    repliesCount: rawStatus.repliesCount,
    url: rawStatus.url,
    inReplyToId: rawStatus.inReplyToId,
    inReplyToAccountId: rawStatus.inReplyToAccountId
  };
  
  // Convert contexts
  const context: MastodonContext = {
    ancestors: rawContext.ancestors.map(a => ({
      id: a.id,
      uri: a.uri,
      createdAt: a.createdAt,
      account: {
        id: a.account.id,
        username: a.account.username,
        acct: a.account.acct,
        displayName: a.account.displayName || a.account.username, 
        avatar: a.account.avatar,
        url: a.account.url
      },
      content: a.content,
      reblogsCount: a.reblogsCount,
      favouritesCount: a.favouritesCount,
      repliesCount: a.repliesCount,
      url: a.url,
      inReplyToId: a.inReplyToId,
      inReplyToAccountId: a.inReplyToAccountId
    })),
    descendants: rawContext.descendants.map(d => ({
      id: d.id,
      uri: d.uri,
      createdAt: d.createdAt,
      account: {
        id: d.account.id,
        username: d.account.username,
        acct: d.account.acct, 
        displayName: d.account.displayName || d.account.username,
        avatar: d.account.avatar,
        url: d.account.url
      },
      content: d.content,
      reblogsCount: d.reblogsCount,
      favouritesCount: d.favouritesCount,
      repliesCount: d.repliesCount,
      url: d.url,
      inReplyToId: d.inReplyToId,
      inReplyToAccountId: d.inReplyToAccountId
    }))
  };
  
  return { status, context };
};

const sortByLikes = (a: MastodonStatus, b: MastodonStatus) => {
  return (b.favouritesCount ?? 0) - (a.favouritesCount ?? 0);
};