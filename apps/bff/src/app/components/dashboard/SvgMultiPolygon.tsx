export type Position = [longitude: number, latitude: number];

export interface IMultiPolygon {
  type: 'MultiPolygon';
  coordinates: Position[][][];
}

interface SvgPolygonProps {
  multiPolygon: IMultiPolygon;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  width?: string;
  height?: string;
}

export function SvgPolygon({
  multiPolygon,
  fill = 'rgba(34, 197, 94, 0.4)',
  stroke = '#16a34a',
  strokeWidth = 1,
  ...opt
}: SvgPolygonProps): React.JSX.Element {
  const positions = multiPolygon.coordinates.flat(2);

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
  const width = Math.max(maxX - minX, 0.000001);
  const height = Math.max(maxY - minY, 0.000001);

  const paths = multiPolygon.coordinates.map((polygon) =>
    polygon
      .map((ring) =>
        ring
          .map(([lng, lat], index) => {
            const x = lng - minX;
            const y = maxY - lat;

            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ') + ' Z',
      )
      .join(' '),
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={opt.width ?? "100%"}
      height={opt.height?? "100%"}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {paths.map((d, index) => (
        <path
          key={index}
          d={d}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          fillRule="evenodd"
        />
      ))}
    </svg>
  );
}