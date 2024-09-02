import { MarkdownCell } from '@jupyterlab/cells';
import { MimeModel } from '@jupyterlab/rendermime';

/**
 * Forces the rendering of a Markdown cell.
 *
 * @param cell - The Markdown cell to render.
 */
export function forceRender(cell: MarkdownCell): void {
  const text =
    cell.model?.sharedModel.getSource() || 'Type Markdown and LaTeX: $ a^2 $';
  const readOnly = cell.readOnly;
  cell.readOnly = false;
  cell.rendered = false;
  cell.renderer
    .renderModel(new MimeModel({ data: { 'text/markdown': text } }))
    .then(() => {
      cell.rendered = true;
      cell.readOnly = readOnly;
    });
}

/**
 * Checks if the E2x grader cell type has changed based on the given change object.
 * @param change - The change object to check.
 * @returns A boolean indicating whether the E2xGrader cell type has changed.
 */
export function hasE2xGraderCellTypeChanged(change: any): boolean {
  if (change.key !== 'extended_cell') {
    return false;
  }

  if (change.type === 'remove') {
    return true;
  }

  // check if the new value has a key 'type'
  if (!change.newValue?.type) {
    return false;
  }

  // check if there is an old value and if it has a key 'type' and if it is different from the new value
  if (change.oldValue?.type && change.oldValue.type === change.newValue.type) {
    return false;
  }

  return true;
}
