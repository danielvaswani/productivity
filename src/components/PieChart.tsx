/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useState } from "react";
import Pie, {
  type ProvidedProps,
  type PieArcDatum,
} from "@visx/shape/lib/shapes/Pie";
import { scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { animated, useTransition, interpolate } from "@react-spring/web";

// accessor functions
// const frequency = (d: LetterFrequency) => d.frequency;
const value = (d: { label: string; value: number }) => Number(d.value);

const defaultMargin = { top: 0, right: 55, bottom: 0, left: 55 };

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
  data: { label: string; value: number }[];
};

export default function PieChart({
  width,
  height,
  margin = defaultMargin,
  animate = true,
  data = [],
}: PieProps) {
  const categorizedData = data.reduce(
    (acc, item) => {
      const existingItem = acc.find((d) => d.label === item.label);
      if (existingItem) {
        existingItem.value += item.value;
      } else {
        acc.push(item);
      }
      return acc;
    },
    [] as { label: string; value: number }[],
  );

  const [selectedlabel, setSelectedlabel] = useState<string | null>(null);

  const getSelectedlabelColor = scaleOrdinal({
    domain: data.map((l) => l.label),
    range: ["#141E61", "#787A91", "#2E236C", "#C8ACD6", "#000000", "#555555"], // Added fuchsia color
  });

  if (width < 10) return null;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  return (
    <svg
      width={width}
      height={height}
      className={`mt-[${margin.top}px] mb-[${margin.bottom}px] -ml-[${margin.left}px] -mr-[${margin.right}px]`}
    >
      <rect
        rx={14}
        width={width}
        height={height}
        fill="url('#visx-pie-gradient')"
      />
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={categorizedData}
          pieValue={value}
          pieSortValues={() => -1}
          outerRadius={radius - donutThickness * 1.3}
        >
          {(pie) => (
            <AnimatedPie<{ label: string; value: number }>
              {...pie}
              animate={animate}
              getKey={({ data: { label } }) => label}
              onClickDatum={({ data: { label } }) =>
                animate &&
                setSelectedlabel(
                  selectedlabel && selectedlabel === label ? null : label,
                )
              }
              getColor={({ data: { label } }) => getSelectedlabelColor(label)}
            />
          )}
        </Pie>
      </Group>
    </svg>
  );
}

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });

  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

    return (
      <g key={key}>
        <animated.path
          // compute interpolated path d attribute from intermediate angle values
          d={interpolate(
            [props.startAngle, props.endAngle],
            (startAngle, endAngle) =>
              path({
                ...arc,
                startAngle,
                endAngle,
              }),
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <rect
              x={centroidX * 1.7 - 10}
              y={centroidY * 1.7 - 15}
              width={getKey(arc).length * 7 + 25}
              height="30"
              fill="white"
              stroke="black"
              strokeWidth="1"
            />
            <text
              fill="currentColor"
              x={centroidX * 1.7}
              y={centroidY * 1.7}
              dy=".33em"
              fontSize={13}
              textAnchor="right"
              pointerEvents="none"
              className="border-teal-800 font-extrabold text-fuchsia-950 shadow-inner"
            >
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    );
  });
}
