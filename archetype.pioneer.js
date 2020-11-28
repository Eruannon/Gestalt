require('lib.traveller');


function getEnergyTarget(creep) {
    let sectorMemory = Memory.rooms[creep.room.name];
    let sector = Game.rooms[creep.room.name];
    
    if (creep.memory.task != undefined) {
        delete creep.memory.task;
    }
    
    if (sectorMemory.storage != undefined && sectorMemory.pioneerColony == false) {
        let roomStorage = Game.getObjectById(sectorMemory.storage.storageId);
        if ((roomStorage.store[RESOURCE_ENERGY] - sectorMemory.storage.reservedEnergy) > 0) {
            creep.memory.target = sectorMemory.storage.storageId;
            creep.memory.task = 'WITHDRAW FROM STORAGE';
        }
    }
    
    if (sectorMemory.terminalId != undefined && creep.memory.task == undefined) { // RCL 6+ 
        // Code for terminal recovery
    }
    
    if (creep.memory.task == undefined) {
        for(i = 0; i < sectorMemory.sourceContainers.length; i++) { // check source containers for energy
            let container = sectorMemory.sourceContainers[i];
            if ((Game.getObjectById(container.contid).store[RESOURCE_ENERGY] - container.reservedEnergy) > creep.store.getCapacity()) {
                creep.memory.target = container.contid;
                container.reservedEnergy += creep.store.getCapacity();
                creep.memory.task = 'WITHDRAW FROM CONTAINER';
            }
        }
    }
        
    if (creep.memory.task == undefined && sectorMemory.droppedEnergy.length > 0) { // can grab resources [TO RECODING]
        for (i = 0; i < sectorMemory.droppedEnergy.length; i++) {
            let resource = Game.getObjectById(sectorMemory.droppedEnergy[i].id);
            if (resource == null) {
                resource.slice(i,1);
                i--;
            } else if ((resource.energy - sectorMemory.droppedEnergy[i].reservedAmount) > 0) {
                sectorMemory.droppedEnergy[i].reservedAmount += creep.store.getCapacity();
                creep.memory.target = sectorMemory.droppedEnergy[i].id;
                creep.memory.task = "GET DROPPED ENERGY";
                break;
            }
        }
    }

    if (creep.memory.task == undefined) {
        for (i = 0; i < sectorMemory.sources.length; i++) {
            if (sectorMemory.sources[i].reservedSlots < sectorMemory.sources[i].slots && sectorMemory.sources[i].reserved == false) {
                sectorMemory.sources[i].reservedSlots++;
                creep.memory.target = sectorMemory.sources[i].sourceId;
                creep.memory.task = 'MINE SOURCE';
                break;
            }
        }   
    }   
}


function run(creepID) {
    let creep = Game.getObjectById(creepID);
    let sectorMemory = Memory.rooms[creep.room.name];
    if (creep.memory.task == undefined) { // It's a new pioneer that failed initialization
        getEnergyTarget(creep);
    }
    
    if (creep.memory.task == "GET DROPPED ENERGY") {
        let energyTarget = Game.getObjectById(creep.memory.target);
        if (energyTarget != null) {
            let result = creep.pickup(energyTarget)
            if ( result == ERR_NOT_IN_RANGE) {
            creep.travelTo(energyTarget);
            } 
            if (result != ERR_NOT_IN_RANGE || creep.ticksToLive == 1) {
                for (i = 0; i < sectorMemory.droppedEnergy.length; i++){
                    if (creep.memory.target == sectorMemory.droppedEnergy[i].id) {
                        sectorMemory.droppedEnergy[i].reservedAmount -= creep.store.getCapacity();
                        break;
                    }
                }
                delete creep.memory.target;
                creep.memory.task = 'REFILL';
            }
        } else {
            getEnergyTarget(creep);
        }
        
    }
    
    if (creep.memory.task == 'COLONIZE') {
        if (creep.room.name == creep.memory.target) { // creep arrived to correct room
            getEnergyTarget(creep);
        } else {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
        }
    }

    if (creep.memory.task == 'WITHDRAW FROM CONTAINER') {
        let container = Game.getObjectById(creep.memory.target);
        let result = creep.withdraw(container, RESOURCE_ENERGY)
        if ( result == ERR_NOT_IN_RANGE) {
            creep.travelTo(container);
        }
        if (result != ERR_NOT_IN_RANGE || creep.ticksToLive == 1){
            for (i = 0; i < sectorMemory.sourceContainers.length; i++) {
                if (sectorMemory.sourceContainers[i].contid == creep.memory.task) {
                    sectorMemory.sourceContainers[i].reservedEnergy -= creep.store.getCapacity();
                }
            }
            delete creep.memory.target;
            creep.memory.task = 'REFILL';
        }
    }

    if (creep.memory.task == 'MINE SOURCE') {
        let source = Game.getObjectById(creep.memory.target);
       
        if (creep.ticksToLive == 1) {
            for (let i = 0; Memory.rooms[source.room.name].sources.length; i++) {
                if (Memory.rooms[source.room.name].sources[i].sourceId == creep.memory.target) {
                    Memory.rooms[source.room.name].sources[i].reservedSlots -= 1;
                    break;
                }
            }
        }
       
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            // if not in range, move towards the controller
            creep.travelTo(source);
        }
        
        if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) { // Energy is full
            creep.memory.task = 'REFILL';
            for (let i = 0; Memory.rooms[source.room.name].sources.length; i++) {
                if (Memory.rooms[source.room.name].sources[i].sourceId == creep.memory.target) {
                    Memory.rooms[source.room.name].sources[i].reservedSlots -= 1;
                    break;
                }
            }
            
            delete creep.memory.target;
        }  
    }
    

    if (creep.memory.task == 'REFILL') {

        let structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) || (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] < 2500 && sectorMemory.constructionSites.length == 0);
            }
        });
        
        if (sectorMemory.upperRefillContainer != undefined && Game.getObjectById(sectorMemory.upperRefillContainer).store.getFreeCapacity(RESOURCE_ENERGY)>0){
            structure = Game.getObjectById(sectorMemory.upperRefillContainer);
        }

        if (sectorMemory.lowerRefillContainer != undefined && Game.getObjectById(sectorMemory.lowerRefillContainer).store.getFreeCapacity(RESOURCE_ENERGY)>0){
            structure = Game.getObjectById(sectorMemory.lowerRefillContainer);
        }

        if (structure != undefined) {
            let result = creep.transfer(structure, RESOURCE_ENERGY);
            if (result == ERR_NOT_IN_RANGE) {
                creep.travelTo(structure);
            } else if (creep.store[RESOURCE_ENERGY] > 0){
                let moreFill = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }});
                
                if (moreFill.length > 0) {
                    while (moreFill.length > 0 && creep.store[RESOURCE_ENERGY] > 0)
                    {
                       creep.transfer(moreFill[0], RESOURCE_ENERGY);
                       moreFill.shift();
                    }
                }
            };
                
        } else {
            creep.memory.task = 'BUILD';
        }
        if (creep.store[RESOURCE_ENERGY] == 0) { // No more energy to use
            getEnergyTarget(creep);
        }
    }
    
    if (creep.memory.task == 'BUILD') {
        if (Memory.rooms[creep.room.name].constructionSites.length > 0) {
            let constructionSite = Game.getObjectById(Memory.rooms[creep.room.name].constructionSites[0]);
            if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                creep.travelTo(constructionSite);
            } else {
                if (constructionSite == null || (constructionSite.progress >= constructionSite.progressTotal) || constructionSite == undefined){
                    Memory.rooms[creep.room.name].constructionSites.shift();
                }
            }
        } else {
            creep.memory.task = 'UPGRADE';
        }
        if (creep.store[RESOURCE_ENERGY] == 0) { // No more energy to use
            getEnergyTarget(creep);
        }
    }
    
    if (creep.memory.task == 'UPGRADE') {
        if (sectorMemory.upgradeContainer != undefined) {
            let uCont = Game.getObjectById(sectorMemory.upgradeContainer);
            if (uCont != undefined && uCont != null && uCont.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                if (creep.transfer(uCont, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(uCont);
                } 
            } else {    
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(creep.room.controller);
                }
            }
        } else {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.controller);
            }
        }

        
        if (creep.store[RESOURCE_ENERGY] == 0) { // No more energy to use
            getEnergyTarget(creep);
        }
    }

    if (creep.memory.task == undefined && creep.store[RESOURCE_ENERGY] > 0) { // Pioneer with energy but no other task
        creep.memory.task = 'REFILL';
    }
    if (creep.memory.task == undefined) {
        creep.moveOffRoad(creep.room.controller, 7); // Out of roads
    }
    
    
}

exports.run = run;