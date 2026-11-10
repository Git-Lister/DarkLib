import { describe, it, expect } from 'vitest';
import {
  MAP_NODES,
  MAP_EDGES,
  getNodeById,
  findNearestNode,
  findShortestPath
} from '../src/engine/map/MapData.js';

describe('MapData', () => {
  it('every edge references existing nodes', () => {
    const ids = new Set(MAP_NODES.map((node) => node.id));
    for (const edge of MAP_EDGES) {
      expect(ids.has(edge.a)).toBe(true);
      expect(ids.has(edge.b)).toBe(true);
    }
  });

  it('getNodeById returns the correct node', () => {
    expect(getNodeById('library').id).toBe('library');
    expect(getNodeById('library').name).toBe('Dalton Library');
    expect(getNodeById('nonexistent')).toBeUndefined();
  });

  it('MAP_NODES contains exactly 4 nodes', () => {
    expect(MAP_NODES.length).toBe(4);
    const ids = MAP_NODES.map((n) => n.id);
    expect(ids).toContain('library');
    expect(ids).toContain('john-dalton');
    expect(ids).toContain('arts-humanities');
    expect(ids).toContain('all-saints-park');
  });

  it('findNearestNode returns the closest node', () => {
    const nearest = findNearestNode(0, 0);
    expect(nearest.id).toBe('library');
  });

  it('findShortestPath returns a valid path from start to end', () => {
    const path = findShortestPath('library', 'all-saints-park');
    expect(path).not.toBeNull();
    expect(path[0]).toBe('library');
    expect(path[path.length - 1]).toBe('all-saints-park');
  });

  it('findShortestPath returns null for disconnected nodes', () => {
    const path = findShortestPath('library', 'nonexistent');
    expect(path).toBeNull();
  });

  it('findShortestPath returns single-node array for same node', () => {
    const path = findShortestPath('library', 'library');
    expect(path).toEqual(['library']);
  });
});
