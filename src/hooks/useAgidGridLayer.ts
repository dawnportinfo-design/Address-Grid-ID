import maplibregl from 'maplibre-gl';
import React from 'react';

import { type AGIDResult } from '../lib/agid';
import {
W3W_STYLE_GRID_MIN_ZOOM,
getCloseDistanceGridFade,
getEffectiveGridOpacityLevel,
normalizeLongitude,
shouldShowDisplayGrid,
} from '../lib/gridDisplay';
import {
findContainingGridCellPolygon,
getGridHighlightFrame,
gridCellsCoverBounds,
resolveGridHighlightPolygons,
shouldDisplayGridResponse,
shouldRefreshGridForViewport,
type GridRenderFrame,
} from '../lib/gridGeometry';
import {
getAgidGridCellFillPaint,
getAgidGridFocusFillPaint,
getAgidGridLinePaint,
getAgidSelectionFillPaint,
} from '../lib/gridPaint';
import { shouldShowGridForViewport } from '../lib/gridViewport';
import {
getMapViewportPoints,
getPaddedGridBounds,
getVisibleGridBounds,
shouldHidePartialGridForViewport,
} from '../lib/gridViewportController';

type EnsureSourceAndLayer = (
  id: string,
  type: string,
  data: any,
  paint: any,
  layout?: any,
  filter?: any,
  beforeId?: string,
) => void;

type UseAgidGridLayerOptions = {
  map: React.RefObject<maplibregl.Map | null>;
  gridWorker: React.RefObject<Worker | null>;
  lat: number;
  lng: number;
  zoom: number;
  mapPitch: number;
  mapStyle: string;
  isGridVisible: boolean;
  gridOpacityLevel: number;
  ensureSourceAndLayer: EnsureSourceAndLayer;
  setIsGridRegenerating: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useAgidGridLayer({
  map,
  gridWorker,
  lat,
  lng,
  zoom,
  mapPitch,
  mapStyle,
  isGridVisible,
  gridOpacityLevel,
  ensureSourceAndLayer,
  setIsGridRegenerating,
}: UseAgidGridLayerOptions) {
  const renderedGridFrameRef = React.useRef<GridRenderFrame | null>(null);
  const renderedGridCellsRef = React.useRef<any[]>([]);
  const pendingGridBoundsRef = React.useRef<[[number, number], [number, number]] | null>(null);
  const latestGridRequestIdRef = React.useRef(0);
  const gridRecoveryAttemptsRef = React.useRef(0);
  const updateGridRef = React.useRef<((activeResult?: AGIDResult, selectedResult?: AGIDResult, gridSize?: number, refreshGrid?: boolean) => void) | null>(null);

  const updateGrid = React.useCallback((activeResult?: AGIDResult, selectedResult?: AGIDResult, gridSize: number = 4, refreshGrid: boolean = true) => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const center = map.current.getCenter();
    const liveZoom = Number(map.current.getZoom().toFixed(2));
    const gridLat = Number.isFinite(center.lat) ? center.lat : lat;
    const gridLon = Number.isFinite(center.lng) ? normalizeLongitude(center.lng) : lng;
    const gridZoom = Number.isFinite(liveZoom) ? liveZoom : zoom;
    const effectiveGridSize = gridZoom >= 15 ? 4 : gridSize;

    const sourceId = 'agid-grid';
    const activeSourceId = 'active-cell';
    const selectedSourceId = 'selected-cell';
    const getCurrentViewportPoints = () => getMapViewportPoints(map.current);
    const viewportPoints = getCurrentViewportPoints();

    const effectiveGridOpacityLevel = getEffectiveGridOpacityLevel({ zoom: gridZoom, isGridVisible, gridOpacityLevel });
    const shouldShow = shouldShowDisplayGrid({ zoom: gridZoom, isGridVisible, gridOpacityLevel }) && shouldShowGridForViewport(viewportPoints);
    const shouldShowHighlight = shouldShow;

    const isSatellite = mapStyle === 'satellite';
    const isDark = mapStyle.includes('dark');
    const isSeaGrid = activeResult?.isSea && gridZoom < 15;
    const currentGridFrame = { anchorLat: gridLat, zoom: gridZoom };

    const clearGridLayers = (options: { preservePendingBounds?: boolean } = {}) => {
      const emptyData = { type: 'FeatureCollection', features: [] };
      ensureSourceAndLayer(sourceId, 'line', emptyData, {});
      ensureSourceAndLayer('grid-cells', 'fill', emptyData, {});
      ensureSourceAndLayer('grid-cells-focus', 'fill', emptyData, {});
      renderedGridCellsRef.current = [];
      renderedGridFrameRef.current = null;
      if (!options.preservePendingBounds) pendingGridBoundsRef.current = null;
    };

    const syncHighlightLayers = (frame: GridRenderFrame, showHighlight: boolean = shouldShowHighlight) => {
      const { activePolygon, selectedPolygon } = resolveGridHighlightPolygons(
        activeResult,
        selectedResult,
        frame.zoom,
        frame.anchorLat,
      );
      const renderedActivePolygon = findContainingGridCellPolygon(renderedGridCellsRef.current, activeResult) || activePolygon;
      const renderedSelectedPolygon = findContainingGridCellPolygon(renderedGridCellsRef.current, selectedResult) || selectedPolygon;

      const activeData: any = (showHighlight && renderedActivePolygon) ? {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [renderedActivePolygon] },
        properties: {},
      } : { type: 'FeatureCollection', features: [] };

      ensureSourceAndLayer(activeSourceId, 'fill', activeData, {
        'fill-color': isSeaGrid ? '#ffffff' : '#ef4444',
        'fill-opacity': isSeaGrid ? 0.35 : 0.4,
        'fill-outline-color': isSeaGrid ? '#cbd5e1' : '#dc2626',
      }, {}, undefined, `${sourceId}-layer`);

      const selectedData: any = (showHighlight && renderedSelectedPolygon) ? {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [renderedSelectedPolygon] },
        properties: {},
      } : { type: 'FeatureCollection', features: [] };

      ensureSourceAndLayer(selectedSourceId, 'fill', selectedData, getAgidSelectionFillPaint(), {}, undefined, `${sourceId}-layer`);
      ensureSourceAndLayer(`${selectedSourceId}-outline`, 'line', (showHighlight && renderedSelectedPolygon) ? {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: renderedSelectedPolygon },
        properties: {},
      } : { type: 'FeatureCollection', features: [] }, {
        'line-color': '#dc2626',
        'line-width': 3,
        'line-opacity': 0.9,
      }, {}, undefined, `${sourceId}-layer`);

      const selectionPointData: any = (showHighlight && selectedResult) ? {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [selectedResult.lon, selectedResult.lat] },
        properties: { title: selectedResult.id },
      } : { type: 'FeatureCollection', features: [] };

      ensureSourceAndLayer('selection-point-glow', 'circle', selectionPointData, {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 4, 20, 12],
        'circle-color': '#ef4444',
        'circle-opacity': 0.5,
        'circle-blur': 0.8,
      });

      ensureSourceAndLayer('selection-label', 'symbol', selectionPointData, {
        'text-color': '#dc2626',
        'text-halo-color': 'rgba(255, 255, 255, 0.9)',
        'text-halo-width': 2,
      }, {
        'text-field': ['get', 'title'],
        'text-font': ['Open Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 15, 9, 18, 12],
        'text-offset': [0, -2],
        'text-anchor': 'bottom',
        'text-letter-spacing': 0.1,
      });
    };

    const visibleBounds = getVisibleGridBounds(viewportPoints);
    const renderBounds = getPaddedGridBounds(viewportPoints, mapPitch);
    const shouldRefreshGrid = shouldRefreshGridForViewport(refreshGrid, renderedGridCellsRef.current, visibleBounds, pendingGridBoundsRef.current);
    const highlightFrame = getGridHighlightFrame(currentGridFrame, renderedGridFrameRef.current, refreshGrid);

    if (!shouldShow) {
      syncHighlightLayers(currentGridFrame, false);
      clearGridLayers();
      return;
    }

    const shouldHidePartialGrid = shouldHidePartialGridForViewport(renderedGridCellsRef.current, visibleBounds);
    if (shouldHidePartialGrid) {
      clearGridLayers({ preservePendingBounds: Boolean(pendingGridBoundsRef.current) });
      syncHighlightLayers(currentGridFrame, false);
    }

    if (!shouldRefreshGrid) {
      if (!shouldHidePartialGrid) syncHighlightLayers(highlightFrame);
      return;
    }

    if (!shouldHidePartialGrid) {
      syncHighlightLayers(highlightFrame);
    }

    const opacityMultiplier = (effectiveGridOpacityLevel / 3) * getCloseDistanceGridFade(gridZoom);
    const gridLinePaint = getAgidGridLinePaint({
      isSatelliteOrDark: isSatellite || isDark,
      isCloseDistanceGrid: gridZoom >= W3W_STYLE_GRID_MIN_ZOOM,
    });
    const dynamicGridOpacity = ['interpolate', ['linear'], ['zoom'], 1, 0.3 * opacityMultiplier, 8, 0.4 * opacityMultiplier, 14, 0.5 * opacityMultiplier, 18, 0.7 * opacityMultiplier, 20, 0.8 * opacityMultiplier];
    const dynamicGridWidth = ['interpolate', ['linear'], ['zoom'], 1, 0.2, 10, 0.4, 15, 0.6, 18, 0.8, 20, 1.2];

    if (!gridWorker.current) return;

    setIsGridRegenerating(true);
    const isLargeGrid = effectiveGridSize >= 1000;
    const requestId = latestGridRequestIdRef.current + 1;
    latestGridRequestIdRef.current = requestId;
    const requestedGridFrame = currentGridFrame;

    gridWorker.current.onmessage = (e) => {
      const { gridLines, gridCells, requestId: responseRequestId } = e.data;
      if (responseRequestId !== undefined && responseRequestId !== latestGridRequestIdRef.current) {
        const currentViewportBounds = getVisibleGridBounds(getCurrentViewportPoints());
        if (!gridCellsCoverBounds(renderedGridCellsRef.current, currentViewportBounds)) {
          clearGridLayers();
          syncHighlightLayers(currentGridFrame, false);
        }
        return;
      }
      pendingGridBoundsRef.current = null;

      if (!gridLines || gridLines.length === 0) {
        clearGridLayers();
        syncHighlightLayers(requestedGridFrame, false);
        setIsGridRegenerating(false);
        return;
      }

      const currentViewportBounds = getVisibleGridBounds(getCurrentViewportPoints());
      if (!shouldDisplayGridResponse(gridCells, currentViewportBounds)) {
        clearGridLayers();
        syncHighlightLayers(requestedGridFrame, false);
        setIsGridRegenerating(false);
        if (gridRecoveryAttemptsRef.current < 2) {
          gridRecoveryAttemptsRef.current += 1;
          requestAnimationFrame(() => {
            updateGridRef.current?.(activeResult, selectedResult, gridSize, true);
          });
        }
        return;
      }

      ensureSourceAndLayer(sourceId, 'line', {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'MultiLineString', coordinates: gridLines },
          properties: {},
        }],
      }, {
        ...gridLinePaint,
        'line-width': dynamicGridWidth,
        'line-opacity': dynamicGridOpacity,
      });

      const cellsData = { type: 'FeatureCollection', features: gridCells };
      renderedGridCellsRef.current = gridCells;

      ensureSourceAndLayer('grid-cells', 'fill', cellsData, getAgidGridCellFillPaint({
        isSatelliteOrDark: isSatellite || isDark,
        opacityMultiplier,
      }), {}, ['!=', ['get', 'isFocus'], true], `${activeSourceId}-layer`);

      ensureSourceAndLayer('grid-cells-focus', 'fill', cellsData, getAgidGridFocusFillPaint({
        isSatelliteOrDark: isSatellite || isDark,
        opacityMultiplier,
      }), {}, ['==', ['get', 'isFocus'], true], `${activeSourceId}-layer`);

      renderedGridFrameRef.current = requestedGridFrame;
      gridRecoveryAttemptsRef.current = 0;
      syncHighlightLayers(requestedGridFrame);
      setIsGridRegenerating(false);
    };

    gridWorker.current.postMessage({
      requestId,
      lat: gridLat,
      lon: gridLon,
      zoom: gridZoom,
      isLargeGrid,
      bounds: renderBounds,
    });
    pendingGridBoundsRef.current = renderBounds;
  }, [lat, lng, zoom, mapPitch, mapStyle, isGridVisible, gridOpacityLevel, ensureSourceAndLayer, map, gridWorker, setIsGridRegenerating]);

  React.useEffect(() => {
    updateGridRef.current = updateGrid;
  }, [updateGrid]);

  return updateGrid;
}
