import { endpointAdapterFactory, schemaMapperFactory } from '@empathyco/x-adapter';
import { platformAdapter } from '@empathyco/x-adapter-platform';
import { SearchRequest, SearchResponse, XComponentsAdapter } from '@empathyco/x-types';
import { getToken } from './authentication';
import SearchForItemParameterObject = SpotifyApi.SearchForItemParameterObject;
import TrackSearchResponse = SpotifyApi.TrackSearchResponse;

const requestMapper = schemaMapperFactory<SearchRequest, SearchForItemParameterObject>({
  q: 'query',
  type: () => 'track',
  limit: 'rows',
  offset: 'start'
});

const responseMapper = schemaMapperFactory<TrackSearchResponse, SearchResponse>({
  totalResults: 'tracks.total',
  results: {
    $path: 'tracks.items',
    $subSchema: {
      modelName: () => 'Result',
      id: 'id',
      name: 'name',
      url: 'external_urls.spotify',
      images: ({ album }) => album.images.map(({ url }) => url)
    }
  }
});

const searchEndpointAdapter = endpointAdapterFactory<SearchRequest, SearchResponse>({
  endpoint: 'https://api.spotify.com/v1/search',
  defaultRequestOptions: {
    properties: {
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  },
  requestMapper,
  responseMapper
});

export const adapter: XComponentsAdapter = {
  ...platformAdapter,
  search: searchEndpointAdapter
};
