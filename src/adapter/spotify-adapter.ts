import { endpointAdapterFactory, schemaMapperFactory } from '@empathyco/x-adapter';
import { platformAdapter } from '@empathyco/x-adapter-platform';
import { SearchRequest, SearchResponse, SimpleFacet, XComponentsAdapter } from '@empathyco/x-types';
import { getToken } from './authentication';
import SearchForItemParameterObject = SpotifyApi.SearchForItemParameterObject;
import TrackSearchResponse = SpotifyApi.TrackSearchResponse;

const requestMapper = schemaMapperFactory<SearchRequest, SearchForItemParameterObject>({
  q: 'query',
  type: ({ filters }) =>
    filters && Object.values(filters).length
      ? Object.values(filters)
          .flat()
          .map(filter => filter.id)
          .join(',')
      : 'track',
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
  },
  facets: (): SimpleFacet[] => [
    {
      modelName: 'SimpleFacet',
      id: 'type',
      label: 'Type',
      filters: [
        {
          modelName: 'SimpleFilter',
          id: 'track',
          label: 'track',
          selected: false,
          facetId: 'type'
        },
        {
          modelName: 'SimpleFilter',
          id: 'album',
          label: 'album',
          selected: false,
          facetId: 'type'
        },
        {
          modelName: 'SimpleFilter',
          id: 'artist',
          label: 'artist',
          selected: false,
          facetId: 'type'
        }
      ]
    }
  ]
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
