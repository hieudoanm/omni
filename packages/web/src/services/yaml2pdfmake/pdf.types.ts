export type Margin = [number, number, number, number] | [number, number] | number;

export type PdfInlineText =
  | string
  | {
      text: string;
      bold?: boolean;
      italics?: boolean;
      color?: string;
      link?: string;
    };

export interface PdfText {
  text: string | PdfInlineText[];
  style?: string | string[];
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italics?: boolean;
  link?: string;
  margin?: Margin;
}

export interface PdfList {
  ul: PdfContent[];
  margin?: Margin;
}

export interface PdfTable {
  table: {
    widths: Array<string | number>;
    body: PdfContent[][];
  };
  layout?: 'noBorders' | string;
  margin?: Margin;
}

export interface PdfCanvasLine {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lineWidth?: number;
  lineColor?: string;
}

export interface PdfCanvas {
  canvas: PdfCanvasLine[];
  margin?: Margin;
}

export interface PdfNode {
  stack?: PdfContent[];
  text?: PdfText['text'];
  style?: PdfText['style'];
  margin?: Margin;
  link?: string;
  fontSize?: number;
  color?: string;
  svg?: string;
}

export type PdfContent = PdfText | PdfList | PdfTable | PdfCanvas | PdfNode;
