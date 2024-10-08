import { MarkdownCell } from '@jupyterlab/cells';
import { getE2xGraderField, setE2xGraderField } from '../utils/cellUtils';
import ChoiceCell from './ChoiceCell';

export const E2X_MULTIPLECHOICE_CELL_TYPE = 'multiplechoice';

export default class MultipleChoiceCell extends ChoiceCell {
  choice_count_field: string;

  constructor(cell: MarkdownCell, options: object = {}) {
    super(cell, E2X_MULTIPLECHOICE_CELL_TYPE, options);
    this.choice_count_field = 'num_of_choices';
  }

  getChoiceCount(): number {
    return getE2xGraderField(this.cell, this.choice_count_field, '0');
  }

  setChoiceCount(count: number): void {
    setE2xGraderField(this.cell, this.choice_count_field, count);
  }

  addChoice(choice: string): void {
    const choices = this.getChoices();
    const idx = choices.indexOf(choice);
    if (idx !== -1) {
      return;
    }
    choices.push(choice);
    this.setChoices(choices);
  }

  removeChoice(choice: string): void {
    const choices = this.getChoices();
    const idx = choices.indexOf(choice);
    if (idx === -1) {
      return;
    }
    choices.splice(idx, 1);
    this.setChoices(choices);
  }

  createChoiceElement(
    name: string,
    value: string,
    selected: boolean
  ): HTMLInputElement {
    const choice = document.createElement('input');
    choice.type = 'checkbox';
    choice.name = name;
    choice.value = value;
    choice.checked = selected;
    choice.onchange = event => {
      const elem = event.target as HTMLInputElement;
      if (elem.checked) {
        this.addChoice(value);
      } else {
        this.removeChoice(value);
      }
    };
    return choice;
  }

  manipulateHTML(html: Element): void {
    const lists = html.querySelectorAll('ul');

    if (lists.length === 0) {
      return;
    }

    // We only care about the first list
    const list = lists[0];
    const form = document.createElement('form');
    form.className = 'e2xgrader-multiplechoice-form';
    const items = list.querySelectorAll('li');
    const num_of_choices = this.getChoiceCount();
    if (num_of_choices !== items.length) {
      this.setChoiceCount(items.length);
      this.setChoices([]);
    }
    const choices = this.getChoices();
    // Check if any of the choices is larger or equal to the number of items
    if (
      choices.length > items.length ||
      choices.some(c => parseInt(c) >= items.length)
    ) {
      this.setChoices([]);
    }
    items.forEach((item, idx) => {
      const choice = this.createChoiceElement(
        'choice',
        idx.toString(),
        choices.includes(idx.toString())
      );
      const label = document.createElement('label');
      label.innerHTML = item.innerHTML;
      form.appendChild(choice);
      form.appendChild(label);
      form.appendChild(document.createElement('br'));
    });

    list.replaceWith(form);
  }
}
