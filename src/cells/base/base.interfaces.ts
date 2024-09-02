import { MarkdownCell } from '@jupyterlab/cells';

export interface IE2xCell {
  cell: MarkdownCell;
  type: string;
  options: object;
  onCellRendered: () => void;
  manipulateHTML: (html: Element) => void;
  renderGraderSettings: (html: Element) => void;
}
