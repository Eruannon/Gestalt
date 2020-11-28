require('lib.traveller');

function run(creepID) {
    let sectorMemory = Memory.rooms[creep.room.name];
    let creep = Game.getObjectById(creepID);
    
    if (creep.memory.mode == undefined){
        creep.memory.mode = 'REFILL';
    }
    
    if (creep.memory.mode == 'REFILL') {
        let container = Game.getObjectById(sectorMemory.upgradeContainer);
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
           creep.travelTo(container);
        } else {
            creep.memory.mode = 'UPGRADE';
        }
    }
    
    if (creep.memory.mode == 'UPGRADE') {
        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller);
        }
        
        if (creep.store[RESOURCE_ENERGY] == 0) { // No more energy to use
            creep.memory.mode = 'REFILL';
        }
    }
}


exports.run = run;