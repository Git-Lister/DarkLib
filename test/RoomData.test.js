import { describe, it, expect } from 'vitest';
import RoomData from '../src/engine/interior/RoomData.js';

describe('RoomData', () => {
  it('contains an entrance and stacks room', () => {
    const roomData = new RoomData();
    const ids = roomData.getRooms().map((room) => room.id);
    expect(ids).toContain('entrance');
    expect(ids).toContain('stacks');
  });

  it('getRoomById returns the correct room', () => {
    const roomData = new RoomData();
    expect(roomData.getRoomById('entrance').id).toBe('entrance');
    expect(roomData.getRoomById('stacks').id).toBe('stacks');
    expect(roomData.getRoomById('nonexistent')).toBeUndefined();
  });

  it('every door references valid room ids', () => {
    const roomData = new RoomData();
    const roomIds = new Set(roomData.getRooms().map((room) => room.id));
    for (const door of roomData.getDoors()) {
      expect(roomIds.has(door.from)).toBe(true);
      expect(roomIds.has(door.to)).toBe(true);
    }
  });

  it('doors connect entrance and stacks bidirectionally', () => {
    const roomData = new RoomData();
    const doors = roomData.getDoors();
    expect(doors.length).toBe(2);
    const pairs = doors.map((d) => `${d.from}->${d.to}`);
    expect(pairs).toContain('entrance->stacks');
    expect(pairs).toContain('stacks->entrance');
  });
});
