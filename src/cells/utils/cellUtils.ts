import { MarkdownCell } from '@jupyterlab/cells';
import { IE2xGraderMetadata } from './cell-utils.interfaces';

export const E2X_METADATA_KEY = 'extended_cell';

/**
 * Retrieves the e2xgrader metadata from a Markdown cell.
 * @param cell - The Markdown cell to retrieve the metadata from.
 * @returns The e2xgrader metadata object.
 */
export function getE2xGraderMetadata(cell: MarkdownCell): IE2xGraderMetadata {
  return cell.model?.getMetadata(E2X_METADATA_KEY) || {};
}

/**
 * Checks if a given Markdown cell is an e2xgrader cell.
 * @param cell - The Markdown cell to check.
 * @returns `true` if the cell is an e2xgrader cell, `false` otherwise.
 */
export function isE2xGraderCell(cell: MarkdownCell): boolean {
  return getE2xGraderMetadata(cell).type !== undefined;
}

/**
 * Retrieves the e2xgrader cell type from the given Markdown cell.
 * @param cell The Markdown cell to retrieve the cell type from.
 * @returns The E2xGrader cell type, or undefined if not found.
 */
export function getE2xGraderCellType(cell: MarkdownCell): string | undefined {
  return getE2xGraderMetadata(cell).type;
}

/**
 * Retrieves the value of a specific field from the e2xgrader metadata of a Markdown cell.
 * If the cell is not an e2xgrader cell or the field does not exist, it returns the defaultValue.
 *
 * @param cell - The Markdown cell to retrieve the field value from.
 * @param field - The name of the field to retrieve.
 * @param defaultValue - The default value to return if the field is not found.
 * @returns The value of the specified field from the e2xgrader metadata, or the defaultValue if the field is not found.
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
 * Sets the value of a specific field in the e2xgrader metadata of a Markdown cell.
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
 * Waits until the HTML is available or a timeout is reached.
 *
 * @param cell - The MarkdownCell to retrieve the HTML element from.
 * @param interval - The interval in milliseconds to check for the HTML. Default is 100ms.
 * @param timeout - The timeout in milliseconds to stop checking for the HTML. Default is 5000ms.
 * @returns A promise that resolves with the HTML element or rejects if not found within the timeout.
 */
export async function getHTML(
  cell: MarkdownCell,
  interval: number = 100,
  timeout: number = 5000
): Promise<Element> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkHTML = () => {
      const html = cell.node.getElementsByClassName('jp-RenderedMarkdown');
      if (html.length > 0) {
        resolve(html[0]);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error('HTML not found within the timeout period'));
      } else {
        setTimeout(checkHTML, interval);
      }
    };

    checkHTML();
  });
}
