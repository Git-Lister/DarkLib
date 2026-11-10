/**
 * PuzzleModal presents a puzzle prompt and collects the player's answer.
 */
export default class PuzzleModal {
  /**
   * Opens the modal with a puzzle definition.
   * @param {Object} puzzle
   * @returns {void}
   */
  open(puzzle) {
    throw new Error('PuzzleModal.open not implemented');
  }

  /**
   * Closes the modal.
   * @returns {void}
   */
  close() {
    throw new Error('PuzzleModal.close not implemented');
  }

  /**
   * Submits the player's answer for validation.
   * @param {any} answer
   * @returns {void}
   */
  submit(answer) {
    throw new Error('PuzzleModal.submit not implemented');
  }
}
