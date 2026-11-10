/**
 * RoomData describes the static layout of an interior: rooms, door portals,
 * and which puzzle (if any) belongs to each room.
 */
export default class RoomData {
  constructor() {
    /** @type {Array<{id: string, name: string, puzzleId: string|null}>} */
    this.rooms = [];
    /** @type {Array<{from: string, to: string, doorId: string}>} */
    this.doors = [];
  }

  /**
   * Returns all rooms.
   * @returns {Array<{id: string, name: string, puzzleId: string|null}>}
   */
  getRooms() {
    throw new Error('RoomData.getRooms not implemented');
  }

  /**
   * Returns a single room by id.
   * @param {string} roomId
   * @returns {{id: string, name: string, puzzleId: string|null}|undefined}
   */
  getRoomById(roomId) {
    throw new Error('RoomData.getRoomById not implemented');
  }

  /**
   * Returns all door portals between rooms.
   * @returns {Array<{from: string, to: string, doorId: string}>}
   */
  getDoors() {
    throw new Error('RoomData.getDoors not implemented');
  }
}
