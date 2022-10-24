import { endpointAdapterFactory } from '@empathyco/x-adapter';
import { platformAdapter } from '@empathyco/x-adapter-platform';
import { SearchRequest, SearchResponse, XComponentsAdapter } from '@empathyco/x-types';
import { getToken } from './authentication';

const searchEndpointAdapter = endpointAdapterFactory<SearchRequest, SearchResponse>({
  endpoint: 'https://api.spotify.com/v1/search',
  defaultRequestOptions: {
    properties: {
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  },
  requestMapper({ query, start, rows }) {
    return {
      q: query,
      limit: rows,
      offset: start,
      type: 'track'
    };
  }
});

export const adapter: XComponentsAdapter = {
  ...platformAdapter,
  search: searchEndpointAdapter
};
