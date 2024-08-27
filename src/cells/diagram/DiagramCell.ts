import DiagramEditor from '../../services/DiagramEditor';
import { IDiagramCell, Base64ImageString } from './diagram.interfaces';
import E2xCell from '../base/BaseCell';
import AttachmentModel from '../../models/AttachmentModel';
import { forceRender } from '../../utils';
import { getHTML } from '../utils/cellUtils';
import { E2X_BUTTON_CLASS } from '../../constants';

export const E2X_DIAGRAM_CELL_TYPE = 'diagram';

export default class DiagramCell extends E2xCell implements IDiagramCell {
  diagram_file_name: string;
  model: AttachmentModel;

  constructor(cell: any, options: object = {}) {
    super(cell, E2X_DIAGRAM_CELL_TYPE, options);
    this.diagram_file_name = 'diagram.png';
    this.model = new AttachmentModel(this);
    this.initialize();
  }

  initialize(): void {
    this.model.load();
    if (!this.model.hasAttachment(this.diagram_file_name)) {
      // set the attachment to a base64 encoded blank image
      this.model.setAttachment(
        'diagram.png',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAOElEQVR42mNkYGD4z0ABYIwBf4D8QwX'
      );
    }
  }

  getDiagramImage(): HTMLImageElement | null {
    const html = getHTML(this.cell);
    if (!html) {
      return null;
    }
    return html.querySelector('img[alt="diagram"]');
  }

  updateDiagramAttachment(attachment: Base64ImageString): void {
    this.model.setAttachment(this.diagram_file_name, attachment);
    forceRender(this.cell);
    this.onCellRendered();
  }

  updateDiagram(diagramImage: HTMLImageElement): void {
    const diagramAttachment = this.model.getAttachment(this.diagram_file_name);
    diagramImage.src =
      'data:' + diagramAttachment.type + ';base64,' + diagramAttachment.data;
  }

  createDiagramEditButton(diagramImage: HTMLImageElement): HTMLButtonElement {
    const diagramEditButton = document.createElement('button');
    diagramEditButton.innerHTML = 'Edit Diagram';
    diagramEditButton.className = E2X_BUTTON_CLASS;
    diagramEditButton.onclick = () => {
      const loading = document.createElement('div');
      loading.className = 'e2x_spinner_container';
      const spinner = document.createElement('div');
      spinner.classList.add('jp-SpinnerContent');
      spinner.classList.add('e2x_spinner');
      loading.appendChild(spinner);
      document.body.appendChild(loading);
      DiagramEditor.editDiagram(this, diagramImage, () => {
        loading.remove();
      });
    };
    return diagramEditButton;
  }

  manipulateHTML(): void {
    const html = getHTML(this.cell);
    if (!html) {
      return;
    }
    const attachment_string = `![diagram](attachment:${this.diagram_file_name})`;
    const attachment_comment = '<!-- Display the diagram attachment -->';
    if (
      this.cell.model.sharedModel.getSource().indexOf(attachment_string) === -1
    ) {
      this.cell.model.sharedModel.setSource(
        this.cell.model.sharedModel.getSource() +
          '\n' +
          attachment_string +
          '\n' +
          attachment_comment
      );
    }
    // Find the diagram image in the html which should have the alt text 'diagram'
    const diagramImage: HTMLImageElement | null =
      html.querySelector('img[alt="diagram"]');
    if (!diagramImage) {
      return;
    }
    this.updateDiagram(diagramImage);
    const diagramEditButton = this.createDiagramEditButton(diagramImage);
    html.appendChild(diagramEditButton);
  }
}
