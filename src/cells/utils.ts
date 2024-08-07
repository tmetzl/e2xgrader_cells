import { MarkdownCell } from '@jupyterlab/cells';

export const E2X_METADATA_KEY = 'extended_cell';

export interface IE2xGraderMetadata {
  type: string;
  [key: string]: any;
}

/**
 * Retrieves the E2xGrader metadata from a Markdown cell.
 * @param cell - The Markdown cell to retrieve the metadata from.
 * @returns The E2xGrader metadata object.
 */
export function getE2xGraderMetadata(cell: MarkdownCell): IE2xGraderMetadata {
  return cell.model?.getMetadata(E2X_METADATA_KEY) || {};
}

/**
 * Checks if a given Markdown cell is an e2x grader cell.
 * @param cell - The Markdown cell to check.
 * @returns `true` if the cell is an e2x grader cell, `false` otherwise.
 */
export function isE2xGraderCell(cell: MarkdownCell): boolean {
  return getE2xGraderMetadata(cell).type !== undefined;
}

/**
 * Retrieves the E2xGrader cell type from the given Markdown cell.
 * @param cell The Markdown cell to retrieve the cell type from.
 * @returns The E2xGrader cell type, or undefined if not found.
 */
export function getE2xGraderCellType(cell: MarkdownCell): string | undefined {
  return getE2xGraderMetadata(cell).type;
}

/**
 * Retrieves the value of a specific field from the e2x grader metadata of a Markdown cell.
 * If the cell is not an e2x grader cell or the field does not exist, it returns the defaultValue.
 *
 * @param cell - The Markdown cell to retrieve the field value from.
 * @param field - The name of the field to retrieve.
 * @param defaultValue - The default value to return if the field is not found.
 * @returns The value of the specified field from the e2x grader metadata, or the defaultValue if the field is not found.
 */
export function getE2xGraderField(
  cell: MarkdownCell,
  field: string,
  defaultValue: any = {}
): any {
  if (!isE2xGraderCell(cell)) {
    return defaultValue;
  }
  const metadata = getE2xGraderMetadata(cell);
  return metadata[field] || defaultValue;
}

/**
 * Sets the value of a specific field in the E2xGrader metadata of a Markdown cell.
 *
 * @param cell - The Markdown cell to update.
 * @param field - The name of the field to set.
 * @param value - The value to set for the field.
 */
export function setE2xGraderField(
  cell: MarkdownCell,
  field: string,
  value: any
): void {
  const metadata = getE2xGraderMetadata(cell);
  metadata[field] = value;
  cell.model?.setMetadata(E2X_METADATA_KEY, metadata);
}

/**
 * Retrieves the HTML element containing the rendered markdown content of a MarkdownCell.
 *
 * @param cell - The MarkdownCell to retrieve the HTML element from.
 * @returns The HTML element containing the rendered markdown content, or undefined if not found.
 */
export function getHTML(cell: MarkdownCell): Element | undefined {
  const renderContent = cell.node.getElementsByClassName('jp-RenderedMarkdown');
  if (renderContent.length < 1) {
    return undefined;
  }
  return renderContent[0];
}
