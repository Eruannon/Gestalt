

global.operateSpawns = function(roomName) {
    let room = Game.rooms[roomName];
    let roomMemory = Memory.rooms[roomName];

    // Go through all spawns
    for (i = 0; i < roomMemory.spawns.length; i++){
        let spawn = Game.getObjectById(roomMemory.spawns[i].spawnId);
        let spawnMemory = roomMemory.spawns[i]
        if (spawn.spawning != null && spawnMemory.initializeCreep == true) { // spawn in question is busy
            let creepname = spawn.spawning.name;
            let creepid = Game.creeps[creepname].id;
            let parser = creepname.split('-');
            switch (parser[1]) {
                
                case 'P': // Pioneer
                roomMemory.pioneers.push(creepid);
                spawnMemory.initializeCreep = false;
                roomMemory.spawnQueueByType['Pioneer'] -= 1;
                break;
                
                case 'BD': // Basic Drill
                roomMemory.drills.push(creepid);
                Game.creeps[creepname].memory.initialization = true;
                roomMemory.spawnQueueByType['Basic Drill'] -= 1;
                spawnMemory.initializeCreep = false;
                
                break;
                
                case 'D': // Drill
                roomMemory.drills.push(creepid);
                Game.creeps[creepname].memory.initialization = true;
                roomMemory.spawnQueueByType['Drill'] -= 1;
                spawnMemory.initializeCreep = false;
                break;
                
                case 'F': // Freighter/Transporter
                roomMemory.transporters.push(creepid);
                Game.creeps[creepname].memory.initialization = true;
                roomMemory.spawnQueueByType['Freighter'] -= 1;
                spawnMemory.initializeCreep = false;
                break;
                
                case 'W': // Worker
                roomMemory.workers.push(creepid);
                Game.creeps[creepname].memory.initialization = true;
                roomMemory.spawnQueueByType['Worker'] -= 1;
                spawnMemory.initializeCreep = false;
                break;
                
                case 'S': // Scout
                roomMemory.scouts.push(creepid);
                roomMemory.spawnQueueByType['Scout'] -= 1;
                spawnMemory.initializeCreep = false;
                break;
                
                case 'U': // Upgraders
                roomMemory.upgraders.push(creepid);
                Game.creeps[creepname].memory.initialization = true;
                roomMemory.spawnQueueByType['Upgrader'] -= 1;
                spawnMemory.initializeCreep = false;
                break;

                case 'C': // Crane
                roomMemory.manager.push(creepid);
                roomMemory.spawnQueueByType['Crane'] -= 1;
                spawnMemory.initializeCreep = false;                
                break;
            }
        } else if (roomMemory.spawnQueue.length > 0  && roomMemory.recoveryMode == false && spawn.spawning == null) { // Spawn can spawn
            // Scout priority
            if (spawn.room.energyAvailable >= 50 && roomMemory.spawnQueue[0] == 'Scout' && spawnMemory.initializeCreep == false) { // Scout is next in queue
                let creepType = roomMemory.spawnQueue.shift();
                result = spawn.createScout(spawn.room.energyAvailable, spawn.room.name);
                if (result < 0) {
                    
                    roomMemory.spawnQueue.unshift(creepType);
                } else {
                    spawnMemory.initializeCreep = true;
                }
            }

            if (spawn.room.energyAvailable >= 600 && roomMemory.spawnQueue[0] == 'Drill' && spawnMemory.initializeCreep == false) { // Standard drill is next in queue
                let creepType = roomMemory.spawnQueue.shift();
                result = spawn.createDrill(spawn.room.energyAvailable);
                if (result < 0) {
                    roomMemory.spawnQueue.unshift(creepType);
                } else {
                    spawnMemory.initializeCreep = true;
                }
            }

            if (spawn.room.energyAvailable >= 1000 && roomMemory.spawnQueue[0] == 'Crane' && (spawn.pos.x-1 == roomMemory.basePos.x && spawn.pos.y+1 == roomMemory.basePos.y) && spawnMemory.initializeCreep == false) { // Standard drill is next in queue
                let creepType = roomMemory.spawnQueue.shift();
                result = spawn.createCrane(spawn.room.energyAvailable);
                if (result < 0) {
                    roomMemory.spawnQueue.unshift(creepType);
                } else {
                    spawnMemory.initializeCreep = true;
                }
            }

            if (spawn.room.energyAvailable == spawn.room.energyCapacityAvailable && roomMemory.spawnQueue[0] != 'Scout' && roomMemory.spawnQueue[0] != 'Drill' && roomMemory.spawnQueue[0] != 'Crane' && spawnMemory.initializeCreep == false) { // spawn has energy to spawn dynamic
                let creepType = roomMemory.spawnQueue.shift();
                var result;
                switch (creepType) {
                    
                    case 'Pioneer':
                    result = spawn.createPioneer(spawn.room.energyAvailable);
                    if (result < 0) {
                        roomMemory.spawnQueue.unshift(creepType);
                    } else {
                        spawnMemory.initializeCreep = true;
                    }
                    break;
                    
                    case 'Basic Drill':
                    result = spawn.createBasicDrill(spawn.room.energyAvailable);
                    if (result < 0) {
                        roomMemory.spawnQueue.unshift(creepType);
                    } else {
                        spawnMemory.initializeCreep = true;
                    }
                    break;
                    
                    case 'Upgrader':
                    let workcap = 15;
                    if (sector.controller.level == 8) {
                        workcap = 15;
                    } 
                    result = spawn.createBasicDrill(spawn.room.energyAvailable, workcap);
                    if (result < 0) {
                        roomMemory.spawnQueue.unshift(creepType);
                    } else {
                        spawnMemory.initializeCreep = true;
                    }
                    break;
                }
            } 
            



        } //Add outpost queue operation
        
                
        if (spawn.room.energyAvailable >= 300 && roomMemory.recoveryMode == true && spawn.spawning == null) {
            let result = spawn.createPioneer(spawn.room.energyAvailable, spawn.room.name);
            if (!(result < 0)) {
                spawnMemory.initializeCreep = true;
                roomMemory.recoveryMode = false;
            } else {
                console.log('Error in spawning during recovery mode :', result);
            }
        }
        
    }

}
