import { useColor } from '@/hooks/useColor';
import { useEffect, useState, useMemo } from 'react';
import { LayoutChangeEvent, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

interface ChartConfig {
  width?: number;
  height?: number;
  padding?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
  gradient?: boolean;
  interactive?: boolean;
  showYLabels?: boolean;
  yLabelCount?: number;
  yAxisWidth?: number;
}

export type ChartDataPoint = {
  x: string | number;
  y: number;
  label?: string;
};

export interface ChartDataset {
  data: ChartDataPoint[];
  color?: string;
  label?: string;
}

// Utility functions
const createPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';

  let path = `M${points[0].x},${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];

    // Create smooth curves using quadratic bezier
    const cpx = (prevPoint.x + currentPoint.x) / 2;
    const cpy = prevPoint.y;

    path += ` Q${cpx},${cpy} ${currentPoint.x},${currentPoint.y}`;
  }

  return path;
};

const createAreaPath = (
  points: { x: number; y: number }[],
  height: number
): string => {
  if (points.length === 0) return '';

  let path = createPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  path += ` L${lastPoint.x},${height} L${firstPoint.x},${height} Z`;

  return path;
};

// Helper function to format numbers for display
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
};

// Animated SVG Components
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  data?: ChartDataPoint[];           // For backward compatibility
  datasets?: ChartDataset[];         // For multiple lines/areas
  config?: ChartConfig;
  style?: ViewStyle;
};

export const LineChart = ({ data, datasets, config = {}, style }: Props) => {
  const [containerWidth, setContainerWidth] = useState(300);

  const {
    height = 200,
    padding = 20,
    showGrid = true,
    showLabels = true,
    animated = true,
    duration = 1000,
    gradient = false,
    interactive = false,
    showYLabels = true,
    yLabelCount = 5,
    yAxisWidth = 20,
  } = config;

  // Standardize datasets
  const activeDatasets = useMemo(() => {
    if (datasets && datasets.length > 0) return datasets;
    if (data && data.length > 0) return [{ data, color: undefined }];
    return [];
  }, [datasets, data]);

  // Use measured width or fallback to config width or default
  const chartWidth = containerWidth || config.width || 300;

  const primaryColor = useColor('primary');
  const mutedColor = useColor('mutedForeground');

  const animationProgress = useSharedValue(0);
  const touchX = useSharedValue(0);
  const showTooltip = useSharedValue(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  };

  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, { duration });
    } else {
      animationProgress.value = 1;
    }
  }, [activeDatasets, animated, duration]);

  if (!activeDatasets.length) return null;

  // Global scaling calculation
  const allYValues = activeDatasets.flatMap(ds => ds.data.map(d => d.y));
  const maxValue = Math.max(...allYValues, 1); // Avoid division by zero
  const minValue = Math.min(...allYValues, 0);
  const valueRange = maxValue - minValue || 1;

  // Label data (assume all datasets have same x-axis labels if multiple)
  const xLabels = activeDatasets[0].data;

  // Adjust padding to account for y-axis labels
  const leftPadding = showYLabels ? padding + yAxisWidth : padding;
  const innerChartWidth = chartWidth - leftPadding - padding;
  const chartHeight = height - padding * 2;

  // Convert all datasets to screen coordinates
  const preparedDatasets = useMemo(() => {
    return activeDatasets.map(ds => {
      const points = ds.data.map((point, index) => {
        const xPos = ds.data.length > 1
          ? leftPadding + (index / (ds.data.length - 1)) * innerChartWidth
          : leftPadding + innerChartWidth / 2;

        return {
          x: xPos,
          y: padding + ((maxValue - point.y) / valueRange) * chartHeight,
        };
      });
      return {
        ...ds,
        points,
        path: createPath(points),
        areaPath: createAreaPath(points, height - padding)
      };
    });
  }, [activeDatasets, maxValue, minValue, valueRange, leftPadding, innerChartWidth, chartHeight, height, padding]);

  // Generate y-axis labels
  const yAxisLabels = [];
  if (showYLabels) {
    for (let i = 0; i < yLabelCount; i++) {
      const ratio = i / (yLabelCount - 1);
      const value = maxValue - ratio * valueRange;
      const y = padding + ratio * chartHeight;
      yAxisLabels.push({ value, y });
    }
  }

  const commonAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: animated
      ? `${animationProgress.value * 1000} 1000`
      : undefined,
  }));

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      if (interactive) {
        touchX.value = event.x;
        showTooltip.value = true;
      }
    })
    .onUpdate((event) => {
      if (interactive) touchX.value = event.x;
    })
    .onEnd(() => {
      if (interactive) showTooltip.value = false;
    });

  return (
    <View style={[{ width: '100%', height }, style]} onLayout={handleLayout}>
      <GestureDetector gesture={panGesture}>
        <Animated.View>
          <Svg width={chartWidth} height={height}>
            <Defs>
              {activeDatasets.map((ds, index) => (
                <LinearGradient key={`grad-${index}`} id={`grad-${index}`} x1='0%' y1='0%' x2='0%' y2='100%'>
                  <Stop offset='0%' stopColor={ds.color || primaryColor} stopOpacity='0.3' />
                  <Stop offset='100%' stopColor={ds.color || primaryColor} stopOpacity='0.05' />
                </LinearGradient>
              ))}
            </Defs>

            {/* Grid lines */}
            {showGrid && (
              <G>
                {yAxisLabels.map((label, index) => (
                  <Line key={`h-${index}`} x1={leftPadding} y1={label.y} x2={chartWidth - padding} y2={label.y} stroke={mutedColor} strokeWidth={0.5} opacity={0.3} />
                ))}
                {preparedDatasets[0].points.map((point, index) => (
                  <Line key={`v-${index}`} x1={point.x} y1={padding} x2={point.x} y2={height - padding} stroke={mutedColor} strokeWidth={0.5} opacity={0.2} />
                ))}
              </G>
            )}

            {/* Y-axis labels */}
            {showYLabels && (
              <G>
                {yAxisLabels.map((label, index) => (
                  <SvgText key={`y-${index}`} x={leftPadding - 10} y={label.y + 4} textAnchor='end' fontSize={10} fill={mutedColor}>
                    {formatNumber(label.value)}
                  </SvgText>
                ))}
              </G>
            )}

            {/* Area Fills */}
            {gradient && preparedDatasets.map((ds, index) => (
              <AnimatedPath key={`area-${index}`} d={ds.areaPath} fill={`url(#grad-${index})`} animatedProps={commonAnimatedProps} />
            ))}

            {/* Lines */}
            {preparedDatasets.map((ds, index) => (
              <AnimatedPath key={`line-${index}`} d={ds.path} stroke={ds.color || primaryColor} strokeWidth={2} fill='none' strokeLinecap='round' strokeLinejoin='round' animatedProps={commonAnimatedProps} />
            ))}

            {/* Data Points */}
            {preparedDatasets.map((ds, dsIndex) => ds.points.map((point, index) => {
              const pointAnimatedProps = useAnimatedProps(() => ({ opacity: animationProgress.value }));
              return (
                <AnimatedCircle
                  key={`pt-${dsIndex}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={ds.color || primaryColor}
                  animatedProps={pointAnimatedProps}
                />
              );
            }))}

            {/* X-axis labels */}
            {showLabels && preparedDatasets.length > 0 && (
              <G>
                {xLabels.map((point, index) => {
                  const x = preparedDatasets[0].points[index]?.x || 0;
                  return (
                    <SvgText key={`x-${index}`} x={x} y={height - 5} textAnchor='middle' fontSize={10} fill={mutedColor}>
                      {point.label || point.x?.toString() || ''}
                    </SvgText>
                  );
                })}
              </G>
            )}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
