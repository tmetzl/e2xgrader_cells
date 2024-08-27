export interface IDiagramEditorOptions {
  drawDomain?: string;
  drawOrigin?: string;
  libs?: string[];
}

export type InitializedCallback = () => void;
