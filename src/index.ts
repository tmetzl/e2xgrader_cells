import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { INotebookTracker } from '@jupyterlab/notebook';
import { hasE2xGraderCellTypeChanged } from './utils';

import { MarkdownCell } from '@jupyterlab/cells';
import { forceRender } from './utils';

import { e2xCellFactory } from './cells/cellFactory';

import { PLUGIN_ID } from './constants';
import Settings from './services/Settings';

function listenToMetadataChanges(cell: MarkdownCell) {
  const model = cell.model;
  // Problem: This does not seem to be triggered when a metadata key is removed via the metadata editor
  // However, it is triggered when the metadata is changed via deleteMetadata
  model.metadataChanged.connect((_: any, args: any) => {
    console.log(
      'Did the e2xgrader cell type change?',
      hasE2xGraderCellTypeChanged(args)
    );
    if (hasE2xGraderCellTypeChanged(args)) {
      forceRender(cell);
    }
  });
}

function listenToRenderChanges(cell: MarkdownCell) {
  cell.renderedChanged.connect((_: any, isRendered: boolean) => {
    // Skip if the cell is not rendered
    if (!isRendered) {
      return;
    }
    const e2xCell = e2xCellFactory(cell);
    if (e2xCell) {
      e2xCell.onCellRendered();
    }
  });
  forceRender(cell);
}

/**
 * Initialization data for the e2xgrader_cells extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description: 'A JupyterLab for displaying custom e2xgrader cells',
  autoStart: true,
  requires: [INotebookTracker, ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    notebooks: INotebookTracker,
    settings: ISettingRegistry
  ) => {
    console.log('JupyterLab extension e2xgrader_cells is activated!');

    Settings.initialize(settings);

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

          const markdownCellWidget = cellWidget as MarkdownCell;

          listenToMetadataChanges(markdownCellWidget);
          listenToRenderChanges(markdownCellWidget);

          // Rerender e2xgrader cells
          forceRender(markdownCellWidget);
        }
      });
    });
  }
};

export default plugin;
