import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the e2xgrader_cells extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'e2xgrader_cells:plugin',
  description: 'A JupyterLab for displaying custom e2xgrader cells',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension e2xgrader_cells is activated!');
  }
};

export default plugin;
