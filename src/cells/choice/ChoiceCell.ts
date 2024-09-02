import E2xCell from '../base/BaseCell';
import { MarkdownCell } from '@jupyterlab/cells';
import { getE2xGraderField, setE2xGraderField } from '../utils/cellUtils';
import { IChoiceCell } from './choice.interfaces';

export default abstract class ChoiceCell
  extends E2xCell
  implements IChoiceCell
{
  choice_field: string;

  constructor(cell: MarkdownCell, type: string, options: object = {}) {
    super(cell, type, options);
    this.choice_field = 'choice';
  }

  getChoices(): string[] {
    return getE2xGraderField(this.cell, this.choice_field, []);
  }

  setChoices(choices: any): void {
    setE2xGraderField(this.cell, this.choice_field, choices);
  }
}
