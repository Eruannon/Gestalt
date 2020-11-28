const autobahn = require('lib.autobahn');


function start(roomId) {
    let roomMemory = Memory.rooms[roomId];
    let room = Game.rooms[roomId];
    
    if (Memory.rooms[roomId].explore == true) { //First time intel acquisition
        delete Memory.rooms[roomId].explore;
        Memory.rooms[roomId] = {};
        roomMemory.roomType = ''; //Initialize roomType
        roomMemory.lastIntel = 0;
        roomMemory.ownerName = ''; //Reservation/Claimant owner
        roomMemory.reserved = false;
        roomMemory.signIt = false;
        roomMemory.sources = [];
        roomMemory.droppedResources = [];
        roomMemory.distanceToClosestColony = 0;
        roomMemory.closestSector = ''; // Closest own colony
        roomMemory.sources[i] = {};
        
        let sources = room.find(FIND_SOURCES);
        for (let i = 0; i < sources.length; i++) { // for every source
            roomMemory.sources[i].sourceId = sources[i].id; //add id to source list
            roomMemory.sources[i].sourcePos = sources[i].pos;
            roomMemory.sources[i].reserved = false;
            roomMemory.sources[i].reservedSlots = 0;
            
            //COUNT 'SLOTS' AVAILABLE
            var fields = sources[i].room.lookForAtArea(LOOK_TERRAIN, sources[i].pos.y-1, sources[i].pos.x-1, sources[i].pos.y+1, sources[i].pos.x+1, true);
            roomMemory.sources[i].slots = 9-_.countBy( fields , "terrain" ).wall;
        }
    } 
 
    roomMemory.lastIntel = Game.time; //Change last intel time to 'now'
    if (room.controller == undefined) { //Identify room type
        if (roomMemory.sources.length > 0 && roomMemory.roomType == '') { // Core rooms
            var lairs = room.find(FIND_STRUCTURES, {
                filter: (structure) => 
                (structure.structureType == STRUCTURE_KEEPER_LAIR 
            )});
            if (lairs.length > 0) {
                roomMemory.roomType = 'SK ROOM'; //Source Keeper Room
            } else {
                roomMemory.roomType = 'CORE ROOM'; // Central map sector room
            }

        } else { // Highway room; no sources available
            roomMemory.roomType = 'HIGHWAY';
            roomMemory.powerBanks = [];
            roomMemory.deposits = [];
        }

    } else { //Room has controller, identify its status
        if (room.controller.reservation != undefined) { //Room is reserved
            roomMemory.ownerName = room.controller.reservation.username;
        } else if (room.controller.owner != undefined) { //Room is claimed
            roomMemory.ownerName = room.controller.owner.username;
        } else { //Room is not reserved and unclaimed
            roomMemory.ownerName = '';
        }
    }

    let minDistance = 99999;
    let closestSector;

    for (let s = 0; s < Memory.Gestalt.empire.sectors.length; s++) {
        distance = Game.map.getRoomLinearDistance(roomId, Memory.Gestalt.empire.sectors[s], false);
        if (minDistance > distance) {
            minDistance = distance;
            closestSector = Memory.Gestalt.empire.sectors[s];
        }
    }
    
    roomMemory.closestSector = closestSector;

    if (minDistance <= 2) { //Room is in sphere of influence of own sector
        if (roomMemory.sphereOfInfluence == undefined) {
            Memory.rooms[closestSector].sphereOfInfluence.push(roomId);
            roomMemory.sphereOfInfluence = closestSector;
        }
        let closestSectorBase = Memory.rooms[closestSector].basePosition;
        let start = new RoomPosition(closestSectorBase.x, closestSectorBase.y, closestSector);
        sources = room.find(FIND_SOURCES);
        let outpostValue = 0;    //Average distance to sources from sector base
        for (i = 0; i < sources.length; i++) {
            let network = autobahn(start, sources[i], {roomFilter: Memory.rooms[closestSector].sphereOfInfluence});
            outpostValue += network.length;
        }
        roomMemory.outpostValue = outpostValue/sources.length;
    }



    // Get dropped resources
    /*
    let droppedResources = room.find(FIND_DROPPED_RESOURCES, {
        filter: (drop) => {return (drop.resourceType !== RESOURCE_ENERGY)} // We don't care about energy at this point in time
    });

    if (droppedResources.length > 0) {
        for (i = 0; i < droppedResources.length ; i++) {
            roomMemory.droppedResources[0].id = droppedResources[0].id;
            roomMemory.droppedResources[0].reservedAmount = 0;
        }
    }

    for (i = 0; i < roomMemory.droppedResources.length; i++) {
        if (Game.getObjectById(roomMemory.droppedResources[i].id) == null){
            roomMemory.droppedResources.splice(i,1);
            i--;
        }
    }*/

    // Get nearby rooms;
    if (minDistance < 8) {
        //Nearby rooms are at most 8 tiles from our sectors
        let exits = Game.map.describeExits(roomId);
        for (i in exits) {
            if (Game.map.getRoomStatus(exits[i]).status != 'CLOSED' && !Memory.rooms[exits[i]]) { // No data for room and room is not closed; send explore request
                Memory.rooms[exits[i]] = {};
                Memory.rooms[exits[i]].explore = true;
                Memory.rooms[roomMemory.closestSector].scoutingQueue.push(exits[i]);
            }
        }
    }
}

exports.start = start;
