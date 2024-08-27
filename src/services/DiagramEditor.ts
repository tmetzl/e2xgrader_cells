import {
  IDiagramEditorOptions,
  InitializedCallback
} from './diagram-editor.interfaces';
import { IDiagramCell } from '../cells/diagram/diagram.interfaces';

const baseOptions: IDiagramEditorOptions = {
  drawDomain: 'https://embed.diagrams.net/',
  drawOrigin: 'https://embed.diagrams.net/',
  libs: []
};

async function fetchBaseOptions() {
  return baseOptions;
}

type DiagramMessageEvent =
  | 'configure'
  | 'init'
  | 'autosave'
  | 'export'
  | 'save'
  | 'exit';

interface IDiagramMessage {
  event: DiagramMessageEvent;
  xml: any;
  data: any;
  modified: any;
  exit: any;
}

export default class DiagramEditor {
  initialized: InitializedCallback;
  cell: IDiagramCell;
  frame: HTMLIFrameElement | null;
  startElement: any;
  format: string;
  xml: any;
  drawDomain: string;
  origin: string;
  frameStyle: string;
  libs: string[];
  data: any;
  previousCursor: any;
  previousOverflow: any;

  constructor(initialized: any, cell: any) {
    this.initialized = initialized || function () {};
    this.cell = cell;
    this.frame = null;
    this.startElement = null;
    this.format = 'xml';
    this.xml = null;
    this.drawDomain = baseOptions.drawDomain || 'https://embed.diagrams.net/';
    this.origin = baseOptions.drawOrigin || 'https://embed.diagrams.net/';
    this.frameStyle =
      'position:absolute;bottom:0;border:0;width:100%;height:100%;';
    this.libs = baseOptions.libs || [];
    // We need to bind handleMessageEvent to this so that it can access the class properties
    this.handleMessageEvent = this.handleMessageEvent.bind(this);
  }

  handleMessageEvent(evt: MessageEvent) {
    if (
      this.frame &&
      evt.source === this.frame.contentWindow &&
      evt.data.length > 0
    ) {
      try {
        const msg = JSON.parse(evt.data);

        if (msg !== null) {
          this.handleMessage(msg);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  static editElement(cell: any, elt: any, initialized: any) {
    if (!elt.diagramEditorStarting) {
      elt.diagramEditorStarting = true;

      return new DiagramEditor(() => {
        console.log('Initialized diagram editor thingy');
        delete elt.diagramEditorStarting;
        initialized();
      }, cell).editElement(elt);
    }
  }

  static async editDiagram(cell: any, elt: any, initialized: any) {
    fetchBaseOptions().then(() => {
      return this.editElement(cell, elt, initialized);
    });
  }

  editElement(elem: any) {
    const src = this.getElementData(elem);
    this.startElement = elem;
    let fmt = this.format;

    if (src.substring(0, 15) === 'data:image/png;') {
      fmt = 'xmlpng';
    } else if (
      src.substring(0, 19) === 'data:image/svg+xml;' ||
      elem.nodeName.toLowerCase() === 'svg'
    ) {
      fmt = 'xmlsvg';
    }

    this.startEditing(src, fmt, null);

    return this;
  }

  getElementData(elem: any) {
    const name = elem.nodeName.toLowerCase();

    let attribute = '';
    if (name === 'svg') {
      attribute = 'content';
    } else if (name === 'img') {
      attribute = 'src';
    } else {
      attribute = 'data';
    }

    return elem.getAttribute(attribute);
  }

  setElementData(elem: any, data: any) {
    const name = elem.nodeName.toLowerCase();

    if (name === 'svg') {
      elem.outerHTML = atob(data.substring(data.indexOf(',') + 1));
    } else {
      elem.setAttribute(name === 'img' ? 'src' : 'data', data);
    }

    return elem;
  }

  startEditing(data: any, format: any, title: any) {
    if (this.frame === null || this.frame === undefined) {
      window.addEventListener('message', this.handleMessageEvent);
      this.format = format || this.format;
      this.data = data;

      this.frame = this.createFrame(this.getFrameUrl(), this.getFrameStyle());
      document.body.appendChild(this.frame);
      this.setWaiting(true);
    }
  }

  setWaiting(waiting: any) {
    if (this.startElement && this.frame) {
      let elt = this.startElement;
      const name = elt.nodeName.toLowerCase();

      if (name === 'svg' || name === 'object') {
        elt = elt.parentNode;
      }

      if (elt) {
        if (waiting) {
          this.frame.style.pointerEvents = 'none';
          this.previousCursor = elt.style.cursor;
          elt.style.cursor = 'wait';
        } else {
          elt.style.cursor = this.previousCursor;
          this.frame.style.pointerEvents = '';
        }
      }
    }
  }

  setActive(active: any) {
    if (active) {
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = this.previousOverflow;
    }
  }

  stopEditing() {
    if (this.frame !== null) {
      window.removeEventListener('message', this.handleMessageEvent);
      document.body.removeChild(this.frame);
      this.setActive(false);
      this.frame = null;
    }
  }

  postMessage(msg: any) {
    if (this.frame && this.frame.contentWindow) {
      this.frame.contentWindow.postMessage(JSON.stringify(msg), this.origin);
    }
  }

  getData() {
    return this.data;
  }

  getFrameStyle() {
    const header = document.getElementById('header');
    const headerOffsetHeight = header ? header.offsetHeight : 0;
    return (
      this.frameStyle +
      ';left:' +
      document.body.scrollLeft +
      'px;top:' +
      document.body.scrollTop +
      headerOffsetHeight +
      'px;'
    );
  }

  getFrameUrl() {
    const url = new URL(this.drawDomain);
    url.searchParams.append('proto', 'json');
    url.searchParams.append('spin', '1');

    if (this.libs.length > 0) {
      url.searchParams.append('libs', this.libs.join(';'));
    }

    return url.href;
  }

  createFrame(url: string, style: string) {
    const frame = document.createElement('iframe');
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('style', style);
    frame.setAttribute('src', url);

    return frame;
  }

  setStatus(messageKey: string, modified: boolean) {
    this.postMessage({
      action: 'status',
      messageKey: messageKey,
      modified: modified
    });
  }

  handleMessage(msg: IDiagramMessage) {
    console.log('Received message', msg);
    if (msg.event === 'configure') {
      this.configureEditor();
    } else if (msg.event === 'init') {
      this.initializeEditor();
    } else if (msg.event === 'autosave') {
      this.save(msg.xml, true, this.startElement);
    } else if (msg.event === 'export') {
      this.cell.updateDiagramAttachment(msg.data);
      this.setElementData(this.startElement, msg.data);
      this.stopEditing();
      this.xml = null;
    } else if (msg.event === 'save') {
      this.save(msg.xml, false, this.startElement);
      this.xml = msg.xml;

      if (msg.exit) {
        msg.event = 'exit';
      } else {
        this.setStatus('allChangesSaved', false);
      }
    }

    if (msg.event === 'exit') {
      this.handleExitMessage(msg);
    }
  }

  handleExitMessage(msg: IDiagramMessage) {
    if (this.format !== 'xml') {
      if (this.xml !== null) {
        this.postMessage({
          action: 'export',
          format: this.format,
          xml: this.xml,
          spinKey: 'export'
        });
      } else {
        this.stopEditing();
      }
    } else {
      if (msg.modified === null || msg.modified) {
        this.save(msg.xml, false, this.startElement);
      }
      this.stopEditing();
    }
  }

  configureEditor() {
    this.postMessage({ action: 'configure' });
  }

  initializeEditor() {
    this.postMessage({
      action: 'load',
      autosave: 1,
      saveAndExit: '1',
      modified: 'unsavedChanges',
      xml: this.getData()
    });
    this.setWaiting(false);
    this.setActive(true);
    this.initialized();
  }

  save(data: any, draft: any, elt: any) {
    this.done(data, draft, elt);
  }

  done(data: any, draft: any, elt: any) {
    console.log('Calling done', data, draft, elt);
  }
}
