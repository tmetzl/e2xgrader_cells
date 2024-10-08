import { MarkdownCell } from '@jupyterlab/cells';
import { MimeModel } from '@jupyterlab/rendermime';
import { IE2xCell } from './base.interfaces';
import { getHTML } from '../utils/cellUtils';
import {
  E2X_GRADER_SETTINGS_CLASS,
  E2X_UNRENDER_BUTTON_CLASS,
  E2X_BUTTON_CLASS
} from '../../constants';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import Settings from '../../services/Settings';

export default abstract class E2xCell implements IE2xCell {
  cell: MarkdownCell;
  type: string;
  options: object;
  editMode: boolean;

  constructor(cell: MarkdownCell, type: string, options: object = {}) {
    this.cell = cell;
    this.type = type;
    this.options = options;
    // Make sure cells can not be unrendered
    this.cell.showEditorForReadOnly = false;
    this.editMode = true;

    const settings = Settings.getInstance();

    this.onSettingsChanged(settings);
    settings.changed.connect(this.onSettingsChanged, this);
  }

  onSettingsChanged(settings: ISettingRegistry.ISettings): void {
    const newEditMode = settings.get('edit_mode').composite as boolean;
    if (newEditMode !== this.editMode) {
      this.editMode = newEditMode;
      if (this.cell.rendered) {
        this.onCellRendered();
      }
    }
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
        this.render();
      })
      .catch(error => {
        console.error('Error rendering cell', error);
      });
  }

  render(): void {
    getHTML(this.cell).then(html => {
      this.manipulateHTML(html);
      if (this.editMode) {
        this.renderGraderSettings(html);
      }
    });
  }

  abstract manipulateHTML(html: Element): void;

  renderGraderSettings(html: Element): void {
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
