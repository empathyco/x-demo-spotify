import { endpointAdapterFactory, schemaMapperFactory } from '@empathyco/x-adapter';
import { platformAdapter } from '@empathyco/x-adapter-platform';
import { SearchRequest, SearchResponse, XComponentsAdapter } from '@empathyco/x-types';
import { getToken } from './authentication';
import SearchForItemParameterObject = SpotifyApi.SearchForItemParameterObject;

const requestMapper = schemaMapperFactory<SearchRequest, SearchForItemParameterObject>({
  q: 'query',
  type: () => 'track',
  limit: 'rows',
  offset: 'start'
});

const searchEndpointAdapter = endpointAdapterFactory<SearchRequest, SearchResponse>({
  endpoint: 'https://api.spotify.com/v1/search',
  defaultRequestOptions: {
    properties: {
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  },
  requestMapper
});

export const adapter: XComponentsAdapter = {
  ...platformAdapter,
  search: searchEndpointAdapter
};
