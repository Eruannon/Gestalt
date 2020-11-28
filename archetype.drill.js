require('lib.traveller');

function run(creepID) {
    let creep = Game.getObjectById(creepID);
    let sectorMemory = Memory.rooms[creep.room.name];
    let parser = creep.name.split('-');
    if (creep.memory.initialization == true) {
        delete creep.memory.initialization;
        let sectorMemory = Memory.rooms[parser[0]];
        for (i = 0; i < sectorMemory.sources.length; i++) {
            if (sectorMemory.sources[i].reserved == false) {
                sectorMemory.sources[i].reserved = true;
                creep.memory.target = sectorMemory.sources[i].sourceId;
                if (sectorMemory.sources[i].miningPos == undefined) {
                    creep.memory.targetPos = Game.getObjectById(sectorMemory.sources[i].sourceId).pos;
                } else {
                    creep.memory.targetPos = sectorMemory.sources[i].miningPos;
                }
                if (creep.store.getCapacity() > 0) {
                    creep.memory.deposited = false;
                    let temptarget = Game.getObjectById(sectorMemory.sources[i].sourceId);
                    let POI = temptarget.pos.findInRange(FIND_MY_STRUCTURES);
                    for (let j = 0; j < POI.length; j++) {
                        if (POI.structureType == STRUCTURE_CONTAINER) {
                            creep.memory.containterId = POI.id;
                        } else if (POI.structureType == STRUCTURE_LINK) {
                            creep.memory.linkId = POI.id;
                        }
                    }
                }
                break;
            }
        }   
    }
    let tmp = creep.memory.targetPos;
    let targetPosition = new RoomPosition(tmp.x, tmp.y, parser[0]);
    if (creep.memory.targetPos != undefined && !(creep.pos.isEqualTo(targetPosition))) {
        creep.travelTo(targetPosition);
    }
    let source = Game.getObjectById(creep.memory.target);
    creep.harvest(source);
    
    if (creep.memory.linkId != undefined) {
        let link = Game.getObjectById(creep.memory.linkId);
        if (creep.transfer(link, RESOURCE_ENERGY) == 0) {
            creep.memory.deposited == true;
        }
    }
    
    if (creep.memory.containerId != undefined && creep.memory.deposited == false) {
        let container = Game.getObjectById(creep.memory.containerId);
        creep.transfer(container, RESOURCE_ENERGY);
    }
    
    if (creep.ticksToLive < 2) {
        for (i = 0; i < sectorMemory.sources.length; i++) {
            if (sectorMemory.sources[i].sourceId == creep.memory.target) {
                sectorMemory.sources[i].reserved = false;
                break;
            }
        }   
    }
}

exports.run = run;