type Position = [longitude: number, latitude: number];

type PolygonGeometry = {
  type: 'Polygon';
  coordinates: Position[][];
};

interface SvgPolygonProps {
  polygon: PolygonGeometry;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  width?: string;
  height?: string;
}

export function SvgPolygon({
  polygon,
  fill = 'rgba(34, 197, 94, 0.4)',
  stroke = '#16a34a',
  strokeWidth = 1,
  ...opt
}: SvgPolygonProps): React.JSX.Element {
  const positions = polygon.coordinates.flat();

  if (!positions.length) {
    return <svg />;
  }

  const longitudes = positions.map(([lng]) => lng);
  const latitudes = positions.map(([, lat]) => lat);

  const minX = Math.min(...longitudes);
  const maxX = Math.max(...longitudes);
  const minY = Math.min(...latitudes);
  const maxY = Math.max(...latitudes);

  // Avoid zero-sized viewBox dimensions.
  const viewWidth = Math.max(maxX - minX, 0.000001);
  const viewHeight = Math.max(maxY - minY, 0.000001);

  const paths = polygon.coordinates.map(
    (ring) =>
      ring
        .map(([lng, lat], index) => {
          const x = lng - minX;
          const y = maxY - lat;

          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ') + ' Z',
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width={opt.width ?? '100%'}
      height={opt.height ?? '100%'}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d={paths.join(' ')}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        fillRule="evenodd"
      />
    </svg>
  );
}
