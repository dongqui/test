export type D3ScaleLinear = d3.ScaleLinear<number, number, never>;

export type D3SVGGElement = d3.Selection<SVGGElement, unknown, null, undefined>;

export interface D3ZoomDatum {
  name: string;
  times: number[];
  values: number[];
}
