import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';
import { hasE2xgraderCellTypeChanged } from './utils';

function cellMetadataChanged(change: any, cellWidget: any) {
  if (change.key !== 'extended_cell') {
    return;
  }

  if (change.type === 'remove') {
    console.log(
      'The e2xgrader cell type has been removed',
      cellWidget.model.toJSON()
    );
  }

  // check if the new value has a key 'type'
  if (!change.newValue?.type) {
    return;
  }
  // check if the key 'type' was deleted

  // check if there is an old value and if it has a key 'type' and if it is different from the new value
  if (change.oldValue?.type && change.oldValue.type === change.newValue.type) {
    return;
  }
  console.log(
    'The e2xgrader cell type has changed',
    cellWidget.model.toJSON(),
    change.newValue.type
  );
}

/**
 * Initialization data for the e2xgrader_cells extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'e2xgrader_cells:plugin',
  description: 'A JupyterLab for displaying custom e2xgrader cells',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebooks: INotebookTracker) => {
    console.log('JupyterLab extension e2xgrader_cells is activated!');

    notebooks.widgetAdded.connect((_, notebookPanel) => {
      console.log('A notebook has been added1');
      const notebook = notebookPanel.content;
      console.log('In process Cells, Notebook', notebook);

      if (!notebook?.model) {
        return;
      }

      notebook.model.cells.changed.connect((_, args) => {
        console.log('Cells changed', args);

        // Check if the change is an addition of a cell
        if (args.type !== 'add') {
          return;
        }

        const notebook = notebookPanel.content;
        console.log('In process Cells, Notebook', notebook);

        for (let cell of args.newValues) {
          // Find the widget by matching ids
          const cellWidget = notebook.widgets.find(
            widget => widget.model.id === cell.id
          );
          if (!cellWidget) {
            console.error('Cell widget not found');
            continue;
          }
          console.log('New cell', cell.toJSON());
          console.log('New cell widget', cellWidget.model.toJSON(), cellWidget);

          // Problem: This does not seem to be triggered when a metadata key is removed via the metadata editor
          // However, it is triggered when the metadata is changed via deleteMetadata
          cell.metadataChanged.connect((_, args) => {
            console.log(
              'Widget of cell with metadata changed',
              cellWidget.model.toJSON()
            );

            console.log('Cell metadata changed', cell.toJSON(), args);

            cellMetadataChanged(args, cellWidget);

            console.log(
              'Did the e2xgrader cell type change?',
              hasE2xgraderCellTypeChanged(args)
            );
          });
        }
      });
    });
  }
};

export default plugin;
