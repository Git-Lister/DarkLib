/**
 * RoomData describes the static layout of an interior: rooms, door portals,
 * and which puzzle (if any) belongs to each room.
 */

export const ROOMS = [
  { id: 'entrance', name: 'Entrance', x: 0, z: 0, w: 10, d: 10 },
  { id: 'stacks', name: 'Stacks', x: 0, z: -15, w: 20, d: 20 }
];

export const DOORS = [
  { from: 'entrance', to: 'stacks', doorId: 'door-entrance-stacks' },
  { from: 'stacks', to: 'entrance', doorId: 'door-stacks-entrance' }
];

export default class RoomData {
  constructor() {
    this.rooms = ROOMS.map((room) => ({ ...room }));
    this.doors = DOORS.map((door) => ({ ...door }));
  }

  /**
   * Returns all rooms.
   * @returns {Array<{id: string, name: string, x: number, z: number, w: number, d: number}>}
   */
  getRooms() {
    return this.rooms;
  }

  /**
   * Returns a single room by id.
   * @param {string} roomId
   * @returns {{id: string, name: string, x: number, z: number, w: number, d: number}|undefined}
   */
  getRoomById(roomId) {
    return this.rooms.find((room) => room.id === roomId);
  }

  /**
   * Returns all door portals between rooms.
   * @returns {Array<{from: string, to: string, doorId: string}>}
   */
  getDoors() {
    return this.doors;
  }
}
