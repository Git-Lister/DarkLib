/**
 * DarkPlace campaign typewriter intro text. Displayed by TypewriterIntro
 * before the map loads.
 */
export const intro = `DarkLib boot sequence initiated.

Welcome to Dark Place.

Locate the Library. Solve the catalogue puzzle. Do not lose all three lives.

Press any key to continue.`;

/**
 * Returns the campaign intro text.
 * @returns {string}
 */
export function getIntro() {
  throw new Error('narrative.intro.getIntro not implemented');
}

export default { intro, getIntro };
