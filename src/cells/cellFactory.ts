import { MarkdownCell } from '@jupyterlab/cells';
import { IE2xCell } from './base/base.interfaces';
import MultipleChoiceCell from './choice/MultipleChoiceCell';
import SingleChoiceCell from './choice/SingleChoiceCell';
import DiagramCell from './diagram/DiagramCell';
import { E2X_MULTIPLECHOICE_CELL_TYPE } from './choice/MultipleChoiceCell';
import { E2X_SINGLECHOICE_CELL_TYPE } from './choice/SingleChoiceCell';
import { E2X_DIAGRAM_CELL_TYPE } from './diagram/DiagramCell';
import { getE2xGraderCellType } from './utils/cellUtils';

/**
 * Factory object that maps cell types to their corresponding factory functions.
 */
const cellFactory: Record<
  string,
  (cell: MarkdownCell) => IE2xCell | undefined
> = {
  [E2X_MULTIPLECHOICE_CELL_TYPE]: (cell: MarkdownCell) =>
    new MultipleChoiceCell(cell),
  [E2X_SINGLECHOICE_CELL_TYPE]: (cell: MarkdownCell) =>
    new SingleChoiceCell(cell),
  [E2X_DIAGRAM_CELL_TYPE]: (cell: MarkdownCell) => new DiagramCell(cell)
};

/**
 * Creates an e2xgrader cell based on the given Markdown cell.
 * @param cell The Markdown cell to create the e2xgrader cell from.
 * @returns The created e2xgrader cell, or undefined if the cell type is not supported.
 */
export function e2xCellFactory(cell: MarkdownCell): IE2xCell | undefined {
  const cellType = getE2xGraderCellType(cell);
  if (cellType !== undefined && cellType in cellFactory) {
    return cellFactory[cellType](cell);
  }
  return undefined;
}
