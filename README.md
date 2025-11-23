# Mastodon Comments

Embed Mastodon comments on your website.

*Adapted from the [Bluesky Comments](https://github.com/czue/bluesky-comments) project by Cory Zue.*

## Installation in a Node.js project as a React component

To use this library in a React project, first install the library:

```bash
npm install mastodon-comments
```

Then import it (and the CSS) in your React app/page/component:

```tsx
import 'mastodon-comments/mastodon-comments.css'
import { MastodonComments } from 'mastodon-comments';
```

And use it in any React component like this:

```javascript
function App() {
  return (
    <>
      <div>Comments Will Display Below</div>
      <MastodonComments 
        author="yourusername" 
        instance="https://mastodon.social" 
      />
    </>
  )
}
```

See the [Usage](#usage) section below for details on the options and API.

## Installation on any website via CDN

To add a comments section to any website, follow these steps

### 1. Add an element to your page where you want the comments to show up

Add something like this to your site:

```html
<div id="mastodon-comments"></div>
```

You can use whatever id you want, but it has to match the container id used in the `getElementById` call
in the usage step.

### 2. Add the CSS files

Add the default styles the page `<head>` somewhere in a base template:

```html
<link rel="stylesheet" href="https://unpkg.com/mastodon-comments@<VERSION>/dist/mastodon-comments.css">
```

### 3. Add source maps for React

Add the following importmap to your page anywhere before you use the library:

```
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18",
    "react-dom/client": "https://esm.sh/react-dom@18/client"
  }
}
</script>
```

### 4. Import the library and instantiate the component with React in an ES module script:

```html
<script type="module">
  import { createElement } from 'react';
  import { createRoot } from 'react-dom/client';
  import { MastodonComments } from 'https://unpkg.com/mastodon-comments@<VERSION>/dist/mastodon-comments.es.js';

  const author = 'yourusername';
  const instance = 'https://mastodon.social';
  const container = document.getElementById('mastodon-comments');
  const root = createRoot(container);
  root.render(
    createElement(MastodonComments, {
      "author": author,
      "instance": instance
    })
  );
</script>
```

See the [Usage](#usage) section below for details on the options and API.

## Usage

Examples in this section use the React JSX syntax. If you're installing on a project that doesn't
use JSX or any build tooling (i.e. a regular website), you can instead use the `createElement`
function and pass the react options in.

For example, the following two examples are equivalent:

React JSX:

```javascript
<MastodonComments
  author="username"
  instance="https://mastodon.social"
  uri="https://mastodon.social/@username/123456789"
/>
```

Equivalent without JSX:

```javascript
root.render(
  createElement(MastodonComments, {
    author: "username",
    instance: "https://mastodon.social",
    uri: "https://mastodon.social/@username/123456789",
  })
);
```

### Initializing the library based on the author


```javascript
<MastodonComments 
  author="username" 
  instance="https://mastodon.social" 
/>
```

If you use this mode, the comments section will use the most popular post by that author that links
to the current page.

### Initializing the library based on a post URL

```javascript
<MastodonComments uri="https://mastodon.social/@username/123456789" instance="https://mastodon.social" />
```

If you use this mode, the comments section will use the exact post you specify.
This usually means you have to add the comments section only *after* you've linked to the article.

### (Advanced) Providing custom default empty states

You can pass in a `onEmpty` callback to handle the case where there are no comments rendered
(for example, if no post matching the URL is found or there aren't any comments on it yet):

```javascript
<MastodonComments
    uri="https://mastodon.social/@username/123456789"
    instance="https://mastodon.social"
    onEmpty={
      (details) => {
        console.error('Failed to load comments:', details);
        document.getElementById('mastodon-comments').innerHTML =
          'No comments on this post yet. Details: ' + details.message;
      }
    }
/>
```

### (Advanced) Filtering comments

You can pass in an array of filters to the `commentFilters` option. These are functions that take a comment and return a boolean. If any of the filters return true, the comment will not be shown.

A few default filters utilities are provided:

- `MastodonFilters.NoPins`: Hide comments that are just "📌"
- `MastodonFilters.NoLikes`: Hide comments with no favorites

You can also use the following utilities to create your own filters:

- `MastodonFilters.MinLikeCountFilter`: Hide comments with less than a given number of favorites
- `MastodonFilters.MinCharacterCountFilter`: Hide comments with less than a given number of characters
- `MastodonFilters.TextContainsFilter`: Hide comments that contain specific text (case insensitive)
- `MastodonFilters.ExactMatchFilter`: Hide comments that match text exactly (case insensitive)

Pass filters using the `commentFilters` option:

```javascript
import {MastodonComments, MastodonFilters} from 'mastodon-comments';

<MastodonComments
    // other options here
    instance="https://mastodon.social"
    commentFilters={[
      MastodonFilters.NoPins,  // Hide pinned comments
      MastodonFilters.MinCharacterCountFilter(10), // Hide comments with less than 10 characters
    ]}
/>
```

You can also write your own filters, by returning `true` for comments you want to hide:

```javascript
const NoTwitterLinksFilter = (comment) => {
  // Check if HTML content contains Twitter links
  const div = document.createElement('div');
  div.innerHTML = comment.status.content;
  const textContent = div.textContent || div.innerText || '';
  return (textContent.includes('https://x.com/') || textContent.includes('https://twitter.com/'));
}

<MastodonComments
    // other options here
    instance="https://mastodon.social"
    commentFilters={[
      NoTwitterLinksFilter,
    ]}
/>
```

### (Removed) Legacy installation using `<script>` tags and UMD

Previous versions of this library recommended installing like this:

```html
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/bluesky-comments@<VERSION>/dist/bluesky-comments.umd.js"></script>
```

And initializing the comments in a standard `<script>` tag with an `init` function:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const uri = 'https://bsky.social/coryzue.com/posts/3jxgux';
    if (uri) {
      BlueskyComments.init('bluesky-comments', {uri});

      // Legacy API (still supported but deprecated)
      initBlueskyComments('bluesky-comments', {uri});
    }
  });
</script>
```

This option has been removed in version 0.9.0 and new projects should use the ES module syntax above.


## Development

To develop on this package, you can run:

```
npm install
npm run dev
```

This will set up a local development server with a simple page showing comments, and watch for changes.

You can also run `npm run build` (build once) or `npm run watch` (watch for changes) to copy the built files to the `dist` directory.  From there you can reference the files in your own projects.

-----

#### Project Attribution Notice

This work was created with an even blend of human and AI contributions. AI was used to make content edits, such as changes to scope, information, and ideas. AI was used to make new content, such as text, images, analysis, and ideas. AI was prompted for its contributions, or AI assistance was enabled. AI-generated content was reviewed and approved. The following model(s) or application(s) were used: Anthropic Claude 3.7 Sonnet; Claude Code v1.0.72.

- AIA Human-AI blend, Content edits, New content, Human-initiated, Reviewed, Anthropic Claude 3.7 Sonnet; Claude Code v1.0.72 v1.0  

This Notice generated using the AI Attribution Toolkit:
  <https://aiattribution.github.io>


