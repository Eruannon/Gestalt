require('core.updates');
require('prototypes.roomVisual');
require('prototypes.depreciation');
require('prototypes.moveOffRoad');
require('archetype.scout');
const intelUpdate = require('core.intelUpdate');
const operateSector = require('core.sectorOperation');
let version = 0.1;
let revision = 104;
let devMode = true;

const MemHack = {
    _memory: Memory,
    parseTime: -1,
    init() {
        const start = Game.cpu.getUsed();
        this._memory = JSON.parse(RawMemory.get());
        //console.log(`Memhack init cpu cost: ${_.round(Game.cpu.getUsed() - start, 2)}`);
    },
    pretick() {
        if (this._memory) {
            const start = Game.cpu.getUsed();
            delete global.Memory;
            global.Memory = this._memory;
            //console.log(`Memhack pretick cpu cost: ${_.round(Game.cpu.getUsed() - start, 2)}`);
        }
    },
    postTick() {
        RawMemory.set(JSON.stringify(this._memory));
    }
};
MemHack.init();


module.exports.loop = function() {
    MemHack.pretick();
    
    //Update Gestalt Memory to current version
    if (!Memory.Gestalt || !Memory.Gestalt.version || Memory.Gestalt.version != version) {
        console.log('Updating Gestalt System');
        console.log('Gestalt Started At :', Game.time);
        systemUpdate();
        Memory.Gestalt.revision = revision;
        console.log('Gestalt Current Version Revision: ',Memory.Gestalt.revision);
    } 

    if (!Memory.Gestalt || (Memory.Gestalt.revision != revision && devMode == true)) {
        RawMemory.set('');
        for (var i in Game.creeps) {
            Game.creeps[i].suicide();
        }
    }

    if (Memory.Gestalt.droneid > 99999) {
        Memory.Gestalt.droneid = 1;
    }
    
    if (Memory.Gestalt.foundDead == true && Game.time%1000 == 0) {
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }
    
    for (i in Game.rooms) // All rooms with vision
    {
        if (!Memory.rooms[i]) {
            intelUpdate.start(i); //Room is new in database
        } else {
            if (Memory.rooms[i].roomType != undefined && Memory.rooms[i].roomType == 'COLONY') {
                operateSector.run(i); //Run Core Sector
            } else {
                intelUpdate.start(i);//Room has vision; update its data
            }
        }
    }

    for (i in Memory.rooms) {
        if (Memory.rooms[i].lastIntel - Game.time > 10000) { //No vision and data obsolete
            Memory.rooms[Memory.rooms[i].closestSector].scoutQueue.push(i); //Add intel update request to nearest room
        }
    }


    
    if (Memory.bucket >= 9950) {
        Game.cpu.generatePixel();
    }
    
    
    MemHack.postTick();
}