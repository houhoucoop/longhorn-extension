export interface ChartData {
  title: string;
  labels: string[];
  datasets: Array<{ data: number[]; backgroundColor: string[] }>;
  suffix?: string;
  resourceNameKey?: string;
}