/**
 * MapData defines the static campus map graph: nodes (buildings/landmarks)
 * and edges (paths between them). Staff can edit this data without touching
 * engine code.
 */

export const MAP_NODES = [
  { id: 'library', x: 0, z: 0, name: 'Dalton Library' },
  { id: 'john-dalton', x: -10, z: 5, name: 'John Dalton Building' },
  { id: 'arts-humanities', x: 10, z: -5, name: 'Arts & Humanities' },
  { id: 'all-saints-park', x: 15, z: 10, name: "All Saints' Park" }
];

export const MAP_EDGES = [
  { a: 'library', b: 'john-dalton' },
  { a: 'library', b: 'arts-humanities' },
  { a: 'john-dalton', b: 'all-saints-park' },
  { a: 'arts-humanities', b: 'all-saints-park' }
];

/**
 * Returns a node by its id.
 * @param {string} id
 * @returns {{id: string, x: number, z: number, name: string}|undefined}
 */
export function getNodeById(id) {
  return MAP_NODES.find((node) => node.id === id);
}

/**
 * Returns the world position of a node.
 * @param {string} id
 * @returns {{x: number, z: number}|null}
 */
export function getNodePosition(id) {
  const node = getNodeById(id);
  if (!node) return null;
  return { x: node.x, z: node.z };
}

/**
 * Returns the node closest to the given world x/z position.
 * @param {number} x
 * @param {number} z
 * @returns {{id: string, x: number, z: number, name: string}|null}
 */
export function findNearestNode(x, z) {
  let nearest = null;
  let minDist = Infinity;
  for (const node of MAP_NODES) {
    const dx = node.x - x;
    const dz = node.z - z;
    const dist = dx * dx + dz * dz;
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }
  return nearest;
}

/**
 * Returns the shortest path of node ids from `fromId` to `toId` along MAP_EDGES
 * using BFS. Returns null if no path exists.
 * @param {string} fromId
 * @param {string} toId
 * @returns {string[]|null}
 */
export function findShortestPath(fromId, toId) {
  if (fromId === toId) return [fromId];

  const adj = {};
  for (const node of MAP_NODES) {
    adj[node.id] = [];
  }
  for (const edge of MAP_EDGES) {
    adj[edge.a].push(edge.b);
    adj[edge.b].push(edge.a);
  }

  const queue = [[fromId]];
  const visited = new Set([fromId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    for (const neighbor of adj[current] || []) {
      if (visited.has(neighbor)) continue;
      const newPath = [...path, neighbor];
      if (neighbor === toId) return newPath;
      visited.add(neighbor);
      queue.push(newPath);
    }
  }

  return null;
}
