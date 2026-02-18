import { LineChart, ChartDataPoint, ChartDataset } from '@/components/charts/line-chart';
import { ViewStyle } from 'react-native';

interface ChartConfig {
    width?: number;
    height?: number;
    padding?: number;
    showGrid?: boolean;
    showLabels?: boolean;
    animated?: boolean;
    duration?: number;
    interactive?: boolean;
    showYLabels?: boolean;
    yLabelCount?: number;
    yAxisWidth?: number;
}

type Props = {
    data?: ChartDataPoint[];
    datasets?: ChartDataset[];
    config?: ChartConfig;
    style?: ViewStyle;
};

export const AreaChart = ({ data, datasets, config = {}, style }: Props) => {
    return (
        <LineChart
            data={data}
            datasets={datasets}
            config={{ ...config, gradient: true }}
            style={style}
        />
    );
};