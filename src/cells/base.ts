import { MarkdownCell } from '@jupyterlab/cells';
import { MimeModel } from '@jupyterlab/rendermime';
import { getHTML } from './utils';

export interface IE2xCell {
  cell: MarkdownCell;
  type: string;
  options: object;
  onCellRendered: () => void;
  renderGraderSettings: () => void;
}

const E2X_GRADER_SETTINGS_CLASS = 'e2x_grader_options';
const E2X_UNRENDER_BUTTON_CLASS = 'e2x_unrender';
export const E2X_BUTTON_CLASS = 'e2x_btn';

export class E2xCell implements IE2xCell {
  cell: MarkdownCell;
  type: string;
  options: object;

  constructor(cell: MarkdownCell, type: string, options: object = {}) {
    this.cell = cell;
    this.type = type;
    this.options = options;
    // Make sure cells can not be unrendered
    this.cell.showEditorForReadOnly = false;
  }

  onCellRendered() {
    this.cell.readOnly = true;
    // Force a clean render of the cell.
    // This is necessary because the cell will not be rendered again if the source is the same.
    this.cell.renderer
      .renderModel(
        new MimeModel({
          data: { 'text/markdown': this.cell.model.sharedModel.getSource() }
        })
      )
      .then(() => {
        this.manipulateHTML();
        this.renderGraderSettings();
      });
  }

  manipulateHTML() {
    return;
  }

  renderGraderSettings() {
    const html = getHTML(this.cell);
    if (!html) {
      return;
    }
    const container = document.createElement('div');
    container.className = E2X_GRADER_SETTINGS_CLASS;
    const unrenderButton = document.createElement('button');
    unrenderButton.className =
      E2X_UNRENDER_BUTTON_CLASS + ' ' + E2X_BUTTON_CLASS;
    unrenderButton.textContent = 'Edit Cell';
    unrenderButton.onclick = () => {
      this.cell.readOnly = false;
      this.cell.rendered = false;
    };
    container.appendChild(document.createElement('hr'));
    container.appendChild(unrenderButton);
    html.appendChild(container);
  }
}
