

Creep.prototype.scout = function(sectorId) {
    let sectorMemory = Memory.rooms[sectorId];
    let localMemory = Memory.rooms[this.room.name];
    
    if (this.memory.task == undefined) {// No room as target memory
        if (sectorMemory.scoutingQueue.length > 0){ // Get New Task
            this.memory.target = sectorMemory.scoutingQueue.shift();
            this.memory.task = 'SCOUT';
            let reservation = {};
            reservation.target = this.memory.target;
            reservation.actor = this.id;
            sectorMemory.scoutingReservations.push(reservation);
        }
    }   

    if (this.memory.task == 'SCOUT') { // Get to target room
        let centerPos = new RoomPosition (25,25,this.memory.target);
        if (this.room.name != this.memory.target) { // Not in target room
            if (Game.rooms[this.memory.target] == undefined) { //No vision to room
                this.travelTo(centerPos);
            } else {
                this.travelTo(centerPos);
            }
        } else { // In target room
            this.travelTo(centerPos); // Get closer to inside of room
            this.memory.task = 'SIGN' //Change to sign management
            console.log('Removing reservation'); // Release scouting reservation
            for (i = 0; i < sectorMemory.scoutingReservations.length; i++) {
                let reserved = sectorMemory.scoutingReservations;
                if (reserved[i].target == this.room.name){
                    reserved.splice(i, 1);
                    i--;
                }
            }
        }
        
    }

    if (this.memory.task == 'SIGN' && localMemory.signIt == true) { //Sign colonies and outposts
        if (localMemory.roomType == "COLONY") {
            if(this.signController(this.room.controller, "🈺 Gestalt is now open for Business. Gestalt welcomes you!") == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            } else {
                localMemory.signIt = false;
                delete this.memory.task;
            }
        } else if (localMemory.roomType == 'OUTPOST') {
            if(this.signController(this.room.controller, "🈯 Room Reserved for Economic Purposes. Gestalt welcomes you!") == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            } else {
                localMemory.signIt = false;
                delete this.memory.task;
            }
        } else {
            if(this.signController(this.room.controller, '') == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            } else {
                localMemory.signIt = false;
                delete this.memory.task;
            }
        }
    }
    

}