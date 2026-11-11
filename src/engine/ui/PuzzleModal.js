/**
 * PuzzleModal presents a puzzle prompt and collects the player's answer.
 */

/**
 * @typedef {import('../events/EventBus.js').default} EventBus
 */

export default class PuzzleModal {
  /**
   * @param {EventBus} eventBus
   */
  constructor(eventBus) {
    /** @type {EventBus} */
    this.eventBus = eventBus;
    /** @type {HTMLElement|null} */
    this.element = null;
    /** @type {HTMLInputElement|null} */
    this.input = null;
    /** @type {HTMLElement|null} */
    this.submitButton = null;
    /** @type {HTMLElement|null} */
    this.failText = null;
    /** @type {Object|null} */
    this.currentPuzzle = null;
    /** @type {(answer: string) => void|null} */
    this.onSubmit = null;
    this._onPuzzleFailed = this._onPuzzleFailed.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onSubmitClick = this._onSubmitClick.bind(this);
  }

  /**
   * Opens the modal with a puzzle definition.
   * @param {Object} puzzle
   * @returns {void}
   */
  open(puzzle) {
    this.close();

    const root = document.getElementById('ui-root') || document.body;

    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.inset = '0';
    element.style.zIndex = '150';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.pointerEvents = 'auto';

    const backdrop = document.createElement('div');
    backdrop.style.position = 'absolute';
    backdrop.style.inset = '0';
    backdrop.style.background = 'rgba(0, 0, 0, 0.6)';
    element.appendChild(backdrop);

    const panel = document.createElement('div');
    panel.style.position = 'relative';
    panel.style.background = '#e0e0e0';
    panel.style.color = '#000000';
    panel.style.border = '2px solid #000000';
    panel.style.padding = '24px 28px';
    panel.style.maxWidth = '90vw';
    panel.style.width = '440px';
    panel.style.pointerEvents = 'auto';
    panel.style.fontFamily = 'Courier New, Courier, monospace';
    panel.style.lineHeight = '1.5';

    const title = document.createElement('h2');
    title.textContent = puzzle.title || '';
    title.style.margin = '0 0 12px 0';
    panel.appendChild(title);

    const prompt = document.createElement('p');
    prompt.textContent = puzzle.prompt || '';
    prompt.style.margin = '0 0 16px 0';
    panel.appendChild(prompt);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Answer';
    input.style.width = '100%';
    input.style.padding = '6px 8px';
    input.style.font = 'inherit';
    panel.appendChild(input);

    const failText = document.createElement('div');
    failText.style.color = '#b00020';
    failText.style.marginTop = '10px';
    failText.style.display = 'none';
    panel.appendChild(failText);

    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.textContent = 'Submit';
    submitButton.style.marginTop = '14px';
    submitButton.style.padding = '8px 16px';
    submitButton.style.font = 'inherit';
    submitButton.style.cursor = 'pointer';
    panel.appendChild(submitButton);

    element.appendChild(panel);
    root.appendChild(element);

    this.element = element;
    this.input = input;
    this.submitButton = submitButton;
    this.failText = failText;
    this.currentPuzzle = puzzle;

    input.focus();
    submitButton.addEventListener('click', this._onSubmitClick);
    input.addEventListener('keydown', this._onKeyDown);
    this.eventBus.on('puzzleFailed', this._onPuzzleFailed);
  }

  /**
   * Closes the modal.
   * @returns {void}
   */
  close() {
    if (this.element) {
      if (this.submitButton) {
        this.submitButton.removeEventListener('click', this._onSubmitClick);
      }
      if (this.input) {
        this.input.removeEventListener('keydown', this._onKeyDown);
      }
      this.element.remove();
      this.element = null;
    }
    this.submitButton = null;
    this.input = null;
    this.failText = null;
    this.currentPuzzle = null;
    this.eventBus.off('puzzleFailed', this._onPuzzleFailed);
  }

  /**
   * Submits the player's answer for validation.
   * @param {any} answer
   * @returns {void}
   */
  submit(answer) {
    if (this.onSubmit) {
      this.onSubmit(answer);
    }
  }

  _onSubmitClick() {
    this._submit();
  }

  _onKeyDown(event) {
    if (event.key === 'Enter') {
      this._submit();
    }
  }

  _submit() {
    const answer = this.input ? this.input.value : '';
    if (this.onSubmit) {
      this.onSubmit(answer);
    }
  }

  _onPuzzleFailed(payload) {
    if (!this.element || !this.currentPuzzle || !this.failText) return;
    if (payload.puzzleId && payload.puzzleId !== this.currentPuzzle.id) return;
    this.failText.textContent = payload.failText ?? '';
    this.failText.style.display = 'block';
  }
}
