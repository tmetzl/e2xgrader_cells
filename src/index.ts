import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';
import { hasE2xGraderCellTypeChanged } from './utils';

import { MarkdownCell } from '@jupyterlab/cells';
import { forceRender } from './utils';

import { e2xCellFactory } from './cells/cellFactory';

function listenToMetadataChanges(cellWidget: any) {
  // Skip non markdown cells
  if (!cellWidget.model.type || cellWidget.model.type !== 'markdown') {
    return;
  }
  const markdownCellWidget = cellWidget as MarkdownCell;
  const cell = markdownCellWidget.model;
  // Problem: This does not seem to be triggered when a metadata key is removed via the metadata editor
  // However, it is triggered when the metadata is changed via deleteMetadata
  cell.metadataChanged.connect((_: any, args: any) => {
    //console.log('Cell metadata changed', cell.toJSON(), args);

    //cellMetadataChanged(args, markdownCellWidget);

    console.log(
      'Did the e2xgrader cell type change?',
      hasE2xGraderCellTypeChanged(args)
    );
    if (hasE2xGraderCellTypeChanged(args)) {
      forceRender(markdownCellWidget);
    }
  });
}

function listenToRenderChanges(cellWidget: any) {
  // Skip non markdown cells
  if (!cellWidget.model.type || cellWidget.model.type !== 'markdown') {
    return;
  }
  const markdownCellWidget = cellWidget as MarkdownCell;
  console.log('markdownCellWidget', markdownCellWidget);
  markdownCellWidget.renderedChanged.connect((_: any, isRendered: boolean) => {
    // Skip if the cell is not rendered
    if (!isRendered) {
      return;
    }
    const e2xCell = e2xCellFactory(markdownCellWidget);
    if (e2xCell) {
      e2xCell.onCellRendered();
    }
  });
  forceRender(markdownCellWidget);
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
      const notebook = notebookPanel.content;

      if (!notebook?.model) {
        return;
      }

      notebook.model.cells.changed.connect((_, args) => {
        // Skip if the cell is not being added
        if (args.type !== 'add') {
          return;
        }

        for (const cell of args.newValues) {
          // Skip non markdown cells
          if (!cell.type || cell.type !== 'markdown') {
            continue;
          }
          // Find the widget by matching ids
          const cellWidget = notebook.widgets.find(
            widget => widget.model.id === cell.id
          );
          if (!cellWidget) {
            console.error('Cell widget not found');
            continue;
          }

          //console.log('New cell', cell.toJSON(), cell);
          //console.log('New cell widget', cellWidget.model.toJSON(), cellWidget);
          //console.log('E2xGrader cell type', getE2xGraderCellType(cell));

          listenToMetadataChanges(cellWidget);
          listenToRenderChanges(cellWidget);

          // Rerender e2xgrader cells
          forceRender(cellWidget as MarkdownCell);
        }
      });
    });
  }
};

export default plugin;
