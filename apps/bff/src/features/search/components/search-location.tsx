'use client';

import { useMutation } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { FIT_BOUNDS_OPTIONS, toLngLatBounds } from '@/features/map/lib/geometry';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { useAppForm } from '@/lib/form/use-app-form';
import { fa } from '@/messages/fa';
import { searchPlacesAction } from '../actions/search-places.action';
import { looksLikeCoordinates, parseCoordinates } from '../lib/parse-coordinates';
import { searchQuerySchema } from '../schemas/search-query.schema';
import type { Place } from '../types';

/** Header search box: place names / addresses (geocoded) or raw `lat, lon` coordinates. */
export function SearchLocation() {
  const { current: map } = useMap();
  const [results, setResults] = useState<Place[] | null>(null);

  const search = useMutation({
    mutationFn: async (query: string) => unwrapActionResult(await searchPlacesAction({ query })),
    onSuccess: (places) => (places.length === 1 ? goTo(places[0]) : setResults(places)),
    onError: () => setResults(null),
  });

  const goTo = (place: Pick<Place, 'lon' | 'lat' | 'bbox'>) => {
    setResults(null);
    if (place.bbox) map?.fitBounds(toLngLatBounds(place.bbox), FIT_BOUNDS_OPTIONS);
    else map?.flyTo({ center: [place.lon, place.lat], zoom: 16 });
  };

  const form = useAppForm({
    defaultValues: { query: '' },
    validators: { onChange: searchQuerySchema },
    onSubmit: ({ value }) => {
      const query = value.query.trim();
      const coordinates = parseCoordinates(query);
      if (coordinates) return goTo({ lon: coordinates[0], lat: coordinates[1], bbox: null });
      if (looksLikeCoordinates(query)) return void toast.error(fa.search.failed);
      search.mutate(query);
    },
  });

  return (
    <form
      role="search"
      className="relative flex max-w-md min-w-60 flex-1 items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="query">
        {(field) => (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-2.5 size-4 text-white/60" />
            <Input
              dir="auto"
              autoComplete="off"
              value={field.state.value}
              placeholder={fa.search.placeholder}
              aria-label={fa.search.placeholder}
              onChange={(event) => field.handleChange(event.target.value)}
              className="border-white/20 bg-white/10 ps-9 text-white placeholder:text-white/60"
            />
          </div>
        )}
      </form.Field>
      <form.AppForm>
        <form.SubmitButton>{fa.search.submit}</form.SubmitButton>
      </form.AppForm>

      {results && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-line bg-white p-1 text-ink shadow-xl">
          {results.length === 0 && <li className="px-3 py-2 text-ink-soft">{fa.search.noResults}</li>}
          {results.map((place) => (
            <li key={`${place.lat},${place.lon}`}>
              <button type="button" className="w-full rounded-md px-3 py-2 text-start hover:bg-panel" onClick={() => goTo(place)}>
                {place.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
