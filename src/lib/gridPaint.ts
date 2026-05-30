type FillPaint = {
  'fill-color': string;
  'fill-opacity': number;
};

type GridFillPaintOptions = {
  isSatelliteOrDark: boolean;
  opacityMultiplier: number;
};

type GridLinePaintOptions = {
  isSatelliteOrDark: boolean;
  isCloseDistanceGrid: boolean;
};

const gridFillColor = (isSatelliteOrDark: boolean) => (isSatelliteOrDark ? '#94a3b8' : '#475569');

export const getAgidGridCellFillPaint = ({ isSatelliteOrDark }: GridFillPaintOptions): FillPaint => ({
  'fill-color': gridFillColor(isSatelliteOrDark),
  'fill-opacity': 0,
});

export const getAgidGridFocusFillPaint = ({ isSatelliteOrDark }: GridFillPaintOptions): FillPaint => ({
  'fill-color': gridFillColor(isSatelliteOrDark),
  'fill-opacity': 0,
});

export const getAgidSelectionFillPaint = (): FillPaint => ({
  'fill-color': '#ef4444',
  'fill-opacity': 0.45,
});

export const getAgidGridLinePaint = ({ isSatelliteOrDark, isCloseDistanceGrid }: GridLinePaintOptions) => ({
  'line-color': isSatelliteOrDark ? '#94a3b8' : (isCloseDistanceGrid ? '#111827' : '#475569'),
});
