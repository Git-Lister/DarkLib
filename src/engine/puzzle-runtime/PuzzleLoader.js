/**
 * PuzzleLoader reads puzzle definitions from YAML files authored by staff.
 */
import catalogueRaw from '../../campaigns/darkplace/puzzles/library-card-catalogue.yaml?raw';
import yaml from 'js-yaml';

export default class PuzzleLoader {
  /**
   * Loads all puzzle definitions and returns an object mapping puzzle IDs to
   * their definitions.
   * @returns {Promise<Object>}
   */
  async loadPuzzles() {
    const puzzles = {};
    const parsed = yaml.load(catalogueRaw);
    if (parsed && parsed.id) {
      puzzles[parsed.id] = parsed;
    }
    return puzzles;
  }
}
