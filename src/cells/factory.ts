import { IE2xCell } from './base';
import { MarkdownCell } from '@jupyterlab/cells';
import { getE2xGraderCellType } from './utils';
import {
  E2X_MULTIPLECHOICE_CELL_TYPE,
  E2X_SINGLECHOICE_CELL_TYPE,
  MultipleChoiceCell,
  SingleChoiceCell
} from './choice';

/**
 * Factory object that maps cell types to their corresponding factory functions.
 */
const cellFactory: Record<
  string,
  (cell: MarkdownCell, type: string) => IE2xCell | undefined
> = {
  [E2X_MULTIPLECHOICE_CELL_TYPE]: (cell: MarkdownCell, type: string) =>
    new MultipleChoiceCell(cell),
  [E2X_SINGLECHOICE_CELL_TYPE]: (cell: MarkdownCell, type: string) =>
    new SingleChoiceCell(cell)
};

/**
 * Creates an e2xgrader cell based on the given Markdown cell.
 * @param cell The Markdown cell to create the e2xgrader cell from.
 * @returns The created e2xgrader cell, or undefined if the cell type is not supported.
 */
export function e2xCellFactory(cell: MarkdownCell): IE2xCell | undefined {
  const cellType = getE2xGraderCellType(cell);
  if (cellType !== undefined && cellType in cellFactory) {
    return cellFactory[cellType](cell, cellType);
  }
  return undefined;
}
