/*
 * Find a solution to the closed travelling salesman problem for a series of points.
 *
 * The optimiser begins with a "depot" and a list of provided tasks as {pos, range} pairs.
 * The initial route begins at the depot, goes through the tasks in their original order,
 * and returns to the depot.
 *
 * This uses simulated annealing and three mutation types to improve this initial route:
 *  (1) Changing which point/side a task or the depot is accessed from.
 *  (2) Reversing the order a randomly selected series of tasks is walked.
 *  (3) Transplanting a list of one to three tasks to a random other point in the sequence.
 *
 * Paths are found using the pathfinder, and all path costs are cached, ignoring the paths themselves.
 * Maximum total storage required is proportionate to the number of access points squared.
 * Re-evaluation of distances is minimised - only the distances affected by each operation are calculated.
 *
 * The steps() function returns an iterator, and returns the best solution at each step. This may be ignored,
 * used with stopping criteria, or updates could be interleaved with other activities.
 *
 * The best solution may be accessed between steps, and is fully usable.
 * Iterating the solution provides a list of objects with the following keys:
 *  task: The task chosen to be executed at this stage, in order.
 *  pos: The access position used to calculate total cost. This may be significant to cost.
 */

class Solution {
  constructor(problem, order, depotAccess, taskAccess, distances) {
    this.problem = problem;
    this.order = order;
    this.depotAccess = depotAccess;
    this.taskAccess = taskAccess;
    this.distances = distances;
  }

  clone() {
    return new Solution(this.problem, this.order, this.depotAccess, this.taskAccess, this.distances);
  }

  get cost() {
    return _.sum(this.distances);
  }

  get valid() {
    return this.depotAccess !== null && !_.any(this.taskAccess, (d) => (d === null)) && !_.any(this.distances, (d) => (d === null))
  }

  calculateDistance(leg) {
    var from, to;

    if (leg == 0) {
      from = this.depotAccess;
    } else {
      from = this.taskAccess[leg-1];
    }

    if (leg == this.order.length) {
      to = this.depotAccess;
    } else {
      to = this.taskAccess[leg];
    }

    return this.problem.pathCost(from, to);
  }

  setDepotAccess(point) {
    this.depotAccess = point;
    this.distances = Array.from(this.distances);

    this.distances[0] = this.calculateDistance(0);
    this.distances[this.order.length] = this.calculateDistance(this.order.length);
  }

  setTaskAccess(i, point) {
    this.taskAccess = Array.from(this.taskAccess);
    this.taskAccess[i] = point;

    this.distances = Array.from(this.distances);
    this.distances[i] = this.calculateDistance(i);
    this.distances[i+1] = this.calculateDistance(i+1);
  }

  reverseSequence(i, j) {
    var newOrder = Array.from(this.order);
    var newAccess = Array.from(this.taskAccess);
    var newDistances = Array.from(this.distances);

    for (var k = 0; k <= j - i; k++) {
      newOrder[i+k] = this.order[j-k];
      newAccess[i+k] = this.taskAccess[j-k];
      newDistances[i+k+1] = this.distances[j-k];
    }

    this.order = newOrder;
    this.taskAccess = newAccess;
    this.distances = newDistances;
    this.distances[i] = this.calculateDistance(i);
    this.distances[j+1] = this.calculateDistance(j+1);
  }

  moveTasks(i, j, l) {
    this.order = Array.from(this.order);
    this.taskAccess = Array.from(this.taskAccess);
    this.distances = Array.from(this.distances);

    var task = this.order.slice(i, i+l);
    var access = this.taskAccess.slice(i, i+l);
    var distances = this.taskAccess.slice(i, i+l);

    this.order.splice(i, l);
    this.taskAccess.splice(i, l);
    this.distances.splice(i, l);

    this.distances[i] = this.calculateDistance(i);

    this.order.splice(j, 0, ...task);
    this.taskAccess.splice(j, 0, ...access);
    this.distances.splice(j, 0, ...distances);

    this.distances[j] = this.calculateDistance(j);
    this.distances[j+1] = this.calculateDistance(j+1);
    this.distances[j+l] = this.calculateDistance(j+l);
  }

  checkDistances() {
    for (var i = 0; i < this.distances.length; i++) {
      if (this.distances[i] != this.calculateDistance(i)) {
        throw new Error(`Distance mismatch at index ${i}`);
      }
    }
  }

  *[Symbol.iterator]() {
    var tasks = this.order;
    var access = this.taskAccess;

    for (var i = 0; i < tasks.length; i++) {
      yield {pos: access[i], task: tasks[i]};
    }
  }

  *circuit() {
    var depot = this.depotAccess;
    var access = this.taskAccess;

    yield depot;
    for (var i = 0; i < access.length; i++) {
      yield access[i];
    }
    yield depot;
  }
}

Solution.initial = function(problem) {
  var order = problem.tasks;
  var depotAccess = _.sample(problem.depot.accessPoints);
  var taskAccess = [];
  var p = depotAccess;
  for (var task of order) {
    var tgt = problem.initialAccessPoint(p, task);
    taskAccess.push(tgt);
    if (tgt) {
      p = tgt;
    }
  }
  var distances = [];
  var solution = new Solution(problem, order, depotAccess, taskAccess, distances);
  for (var i = 0; i <= problem.tasks.length; i++) {
    solution.distances[i] = solution.calculateDistance(i);
  }
  return solution;
}

class TSP {
  constructor(depot, tasks, matrixCallback, temperature, maxSteps) {
    this.depot = depot;
    this.tasks = tasks;
    this.matrixCallback = matrixCallback;
    this.temperature = temperature;
    this.decay = Math.pow(0.1/temperature, 1.0/maxSteps);
    this.maxSteps = maxSteps;

    this.costMatrices = {};
    this.pathCosts = {};
    this.precalculate();
    this.current = Solution.initial(this);
    this.best = this.current.clone();
  }

  precalculate() {
    var problem = this;
    function findAccessPositions(task) {
      var {pos, range} = task;
      if (typeof(range) === 'undefined') {
        range = 1;
      }
      var access = problem.costMatrix(pos.roomName);
      task.accessPoints = [];
      for (var y = pos.y - range; y <= pos.y + range; y++) {
        for (var x = pos.x - range; x <= pos.x + range; x++) {
          if (x > 0 && x < 49 && y > 0 && y < 49) {
            if (access.get(x, y) < 255) {
              var ap = new RoomPosition(x, y, pos.roomName);
              task.accessPoints.push(ap);
            }
          }
        }
      }
    }

    findAccessPositions(this.depot);
    for (var task of this.tasks) {
      findAccessPositions(task);
    }
  }

  pathCost(from, to) {
    var alt = `${to}-${from}`;
    if (this.pathCosts.hasOwnProperty(alt)) {
      return this.pathCosts[alt];
    }

    var k = `${from}-${to}`;
    if (!this.pathCosts.hasOwnProperty(k)) {
      var {cost, incomplete} = PathFinder.search(from, {pos: to, range: to.isEqualTo(this.depot.pos) ? 1 : 0}, {roomCallback: (roomName) => this.costMatrix(roomName)});
      if (incomplete) {
        this.pathCosts[k] = null;
      } else {
        // Split cost of access points between arrival and departure - makes costs symmetrical
        cost += this.costMatrix(from.roomName).get(from.x, from.y) / 2.0;
        cost -= this.costMatrix(to.roomName).get(to.x, to.y) / 2.0;

        this.pathCosts[k] =  cost;
      }
    }

    return this.pathCosts[k];
  }

  initialAccessPoint(from, goal) {
    var {cost, incomplete, path} = PathFinder.search(from, goal, {roomCallback: (roomName) => this.costMatrix(roomName)});
    if (incomplete) {
      return null;
    } else {
      if (path.length == 0) {
        return from;
      } else {
        return path[path.length - 1];
      }
    }
  }

  *steps() {
    for (var step = 0; step < this.maxSteps; step++) {
      var backup = this.current.clone();

      var t = Math.random();

      if (t < 0.5) {
        // Switch access points
        var i = Math.floor(Math.random() * (this.tasks.length + 1));
        if (i == this.tasks.length) {
          this.current.setDepotAccess(_.sample(this.depot.accessPoints));
        } else {
          this.current.setTaskAccess(i, _.sample(this.current.order[i].accessPoints));
        }
      } else if (t < 0.75) {
        var l = 1 + Math.floor(Math.random() * 3);
        var i = Math.floor(Math.random() * (this.tasks.length - l + 1));
        var j = Math.floor(Math.random() * (this.tasks.length - l));
        if (j >= i) {
          // Not equal
          j += 1;
        }
        this.current.moveTasks(i, j, l);
      } else {
        // Invert a range
        var l = 2 + Math.floor(Math.random() * (this.current.order.length - 2));

        var i = Math.floor(Math.random() * (this.current.order.length - l));
        var j = i + l - 1;
        this.current.reverseSequence(i, j);
      }


      if (this.current.valid && this.shouldTransition(backup.cost, this.current.cost)) {
        if (this.current.cost < this.best.cost) {
          this.best = this.current.clone();
        }
      } else {
        this.current = backup;
      }
      this.temperature = this.temperature * this.decay;

      yield this.best;
    }
  }

  shouldTransition(fromCost, toCost) {
    if (toCost <= fromCost) {
      return true;
    } else {
      var chance = Math.exp((fromCost - toCost) / this.temperature);
      return Math.random() < chance;
    }
  }

  costMatrix(roomName) {
    if (!this.costMatrices.hasOwnProperty(roomName)) {
      this.costMatrices[roomName] = this.matrixCallback(roomName);
    }
    return this.costMatrices[roomName];
  }
}

/* BEGIN example use */

function costMatrixCallback(roomName) {
  var matrix = new PathFinder.CostMatrix();
  var terrain = new Room.Terrain(roomName);

  for (var y = 0; y < 50; y++) {
    for (var x = 0; x < 50; x++) {
      if (terrain.get(x, y) & TERRAIN_MASK_WALL) {
        matrix.set(x, y, 255);
      } else if (terrain.get(x, y) & TERRAIN_MASK_SWAMP) {
        matrix.set(x, y, 10);
      } else {
        matrix.set(x, y, 2);
      }
    }
  }

  if (Game.rooms[roomName]) {
    for (var structure of Game.rooms[roomName].find(FIND_STRUCTURES)) {
      if (structure.structureType == STRUCTURE_ROAD) {
        matrix.set(structure.pos.x, structure.pos.y, 1);
      }
    }

    for (var structure of Game.rooms[roomName].find(FIND_STRUCTURES)) {
      if (OBSTACLE_OBJECT_TYPES.indexOf(structure.STRUCTURE_TYPE) >= 0) {
        matrix.set(structure.pos.x, structure.pos.y, 255);
      }
    }
  }

  return matrix;
}

TSP.example = function(roomName) {
  var extensions = _.filter(Game.rooms[roomName].find(FIND_STRUCTURES), (s) => s.structureType == STRUCTURE_EXTENSION);
  var depot = {pos: Game.rooms[roomName].storage.pos, range: 1};
  var tasks = _.map(extensions, (s) => ({pos: s.pos, range: 1}));
  
  var p = new TSP(
    depot,
    tasks,
    costMatrixCallback,
    100, // Temperature has the same units as cost. Initial value should be large but not impossible.
    10000 // Number of iterations to optimise
  );

  var st = Game.cpu.getUsed();
  console.log(`Initial cost: ${p.best.cost}`)

  var lastPos = null;
  var vis = new RoomVisual(roomName);
  var i = 0;
  for (var {pos, task} of p.best) {
    if (lastPos) {
      vis.line(lastPos, pos, {color: 'yellow', strokeWidth: 0.2});
    }
    i += 1;
    lastPos = pos;
  }

  for (var best of p.steps()) {}
  console.log(`Final cost: ${p.best.cost}`)
  var used = Game.cpu.getUsed() - st;
  console.log(`Used ${used} CPU.`);

  var lastPos = null;
  var i = 0;
  for (var {pos, task} of p.best) {
    vis.text(i.toString(), task.pos);
    if (lastPos) {
      vis.line(lastPos, pos, {color: 'green', strokeWidth: 0.2});
    }
    i += 1;
    lastPos = pos;
  }
}

/* END example use */

module.exports = TSP;