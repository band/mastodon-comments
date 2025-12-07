import React from 'react';
import { createRoot } from 'react-dom/client';

import { MastodonComments, MastodonFilters } from '../src/main';

const App = () => (
  <div>
    <h1>Testing Mastodon Comments Component by uri</h1>
    <MastodonComments
      uri="https://hachyderm.io/@band/114977262183830227"
      instance="https://hachyderm.io"
      commentFilters={[
        MastodonFilters.NoPins, // Hide pinned comments
        MastodonFilters.MinCharacterCountFilter(10), // Hide comments with less than 10 characters
      ]}
    />
  </div>
);

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
