//update system for memory


global.initializeSector = function(roomName, basepos, spawnid){
    let gestalt = Memory.Gestalt;
    let sectorMemory = Memory.rooms[roomName];
    let sector = Game.rooms[roomName];
    //Core Economy Memory
    sectorMemory.roomType = 'COLONY';
    sectorMemory.lastIntel = 0;
    sectorMemory.sources = [];
    sectorMemory.outposts = [];
    sectorMemory.sphereOfInfluence = [];
    sectorMemory.droppedEnergy = [];
    sectorMemory.droppedResources = [];
    sectorMemory.spawns = [];
    sectorMemory.turrets = [];
    sectorMemory.links = [];
    sectorMemory.spawnQueue = [];
    sectorMemory.sourceContainers = [];
    sectorMemory.constructionSites = [];
        
    // BUNKER CHECK LOGS
    sectorMemory.checkData = {};
    sectorMemory.checkData.rcl = 0;
    sectorMemory.checkData.currentCheck = 'Energy';
    sectorMemory.checkData.holdCheck == false;
    
    // - spawns and energy
    sectorMemory.checkData['Energy'] = {}
    sectorMemory.checkData['Energy'].lastCheck = 0;
    sectorMemory.checkData['Energy'].rcl = 0;
    sectorMemory.checkData['Energy'].phase = 'Construction';
    sectorMemory.checkData['Turrets'] = {}
    sectorMemory.checkData['Turrets'].lastCheck = 0;
    sectorMemory.checkData['Turrets'].rcl = 0;
    sectorMemory.checkData['Turrets'].phase = 'Construction';
    sectorMemory.checkData['Utility'] = {}
    sectorMemory.checkData['Utility'].lastCheck = 0;
    sectorMemory.checkData['Utility'].rcl = 0;
    sectorMemory.checkData['Utility'].phase = 'Construction';
    sectorMemory.checkData['Bunker Roads'] = {}
    sectorMemory.checkData['Bunker Roads'].lastCheck = 0;
    sectorMemory.checkData['Bunker Roads'].rcl = 0;
    sectorMemory.checkData['Bunker Roads'].phase = 'Construction';
    sectorMemory.checkData['Road Network'] = {}
    sectorMemory.checkData['Road Network'].lastCheck = 0;
    sectorMemory.checkData['Road Network'].rcl = 0;
    sectorMemory.checkData['Road Network'].phase = 'Construction';
    sectorMemory.checkData['Links'] = {}
    sectorMemory.checkData['Links'].lastCheck = 0;
    sectorMemory.checkData['Links'].rcl = 0;
    sectorMemory.checkData['Links'].phase = 'Construction';
    sectorMemory.checkData['Labs'] = {}
    sectorMemory.checkData['Labs'].lastCheck = 0;
    sectorMemory.checkData['Labs'].rcl = 0;
    sectorMemory.checkData['Labs'].phase = 'Construction';
    sectorMemory.checkData['Walls'] = {}
    sectorMemory.checkData['Walls'].lastCheck = 0;
    sectorMemory.checkData['Walls'].rcl = 0;
    sectorMemory.checkData['Walls'].phase = 'Construction';
    

    sectorMemory.pioneerColony = true;    
    sectorMemory.spawnQueueByType = {};
    sectorMemory.spawnQueueByType['Pioneer'] = 0;
    sectorMemory.spawnQueueByType['Basic Drill'] = 0;
    sectorMemory.spawnQueueByType['Drill'] = 0;
    sectorMemory.spawnQueueByType['Scout'] = 0;
    sectorMemory.spawnQueueByType['Transporter'] = 0;
    sectorMemory.spawnQueueByType['Worker'] = 0;
    sectorMemory.spawnQueueByType['Upgrader'] = 0;
    sectorMemory.spawnQueueByType['Crane'] = 0;
    sectorMemory.basePosition = basepos;

    //Creep memory
    sectorMemory.pioneers = [];
    sectorMemory.drills = [];
    sectorMemory.workers = [];
    sectorMemory.scouts = [];
    sectorMemory.refillers = [];
    sectorMemory.upgraders = [];
    sectorMemory.transporters = [];
    sectorMemory.managers = [];
    sectorMemory.transportTasks = [];
    
    //Add room neighbourhood
    sectorMemory.scoutingQueue = [];
    sectorMemory.scoutingReservations = [];
    sectorMemory.signIt = true;
    

    //Get neighbouring rooms and queue scout to them:
    let exits = Game.map.describeExits(roomName);
    sectorMemory.scoutingQueue.push(roomName); // Sign own room
    for (i in exits){
        if (!Memory.rooms[exits[i]]){
            Memory.rooms[exits[i]] = {};
            Memory.rooms[exits[i]].explore = true;
        }
        sectorMemory.scoutingQueue.push(exits[i]);
    }

    //Turn OFF recovery mode by default
    sectorMemory.recoveryMode = false; 
    sectorMemory.turrets = [];
    gestalt.empire.sectors.push(roomName);
    let tmp = sector.find(FIND_SOURCES);
    let sources = _.sortBy(tmp, s => Game.spawns[spawnid].pos.getRangeTo(s));
    for (let i = 0; i < sources.length; i++) { // for every source
        sectorMemory.sources[i] = {};
        sectorMemory.sources[i].sourceId = sources[i].id; //add id to source list
        sectorMemory.sources[i].reserved = false;
        sectorMemory.sources[i].reservedSlots = 0;
        
        //COUNT 'SLOTS' AVAILABLE
        var fields = sources[i].room.lookForAtArea(LOOK_TERRAIN, sources[i].pos.y-1, sources[i].pos.x-1, sources[i].pos.y+1, sources[i].pos.x+1, true);
        sectorMemory.sources[i].slots = 9-_.countBy( fields , "terrain" ).wall;
        
    }
    console.log('Sector core ',roomName,' is now initialized in memory.')
}

global.systemUpdate = function () {
    // No previous version found
    // Initialize 
    let gestalt = Memory.Gestalt;
    let rooms = Memory.rooms;
    if (!gestalt || gestalt.version < 0.1 || !gestalt.version){
        Memory.Gestalt = {};
        
        // Private server patch
        if (Memory.rooms == undefined) {
            Memory.rooms = {};
            rooms = Memory.rooms;
        }
        if (Memory.creeps == undefined) {
            Memory.creeps = {};
        }
        if (Memory.flags == undefined) {
            Memory.flags = {};
        }
        if (Memory.spawns == undefined) {
            Memory.spawns = {};
        }
        
        gestalt = Memory.Gestalt;
        gestalt.version = 0.1;  // current version
        gestalt.foundDead = false;
        gestalt.empire = {}; //initialize empire
        gestalt.droneid = 1;
        gestalt.army = []; // Military organization core
        
        // Simplified intel/diplomatic information core
        gestalt.diplomacy = {};
        gestalt.diplomacy.knownPlayers = {}; //simplified Diplomatic code
        gestalt.diplomacy.loansLedger = {};
        gestalt.diplomacy.knownPlayers['olo'] = {};
        gestalt.diplomacy.knownPlayers['olo'].ally = true; // Alliance - try to support
        gestalt.diplomacy.knownPlayers['olo'].nap = true; // NAP - Non-Aggression - ignore for most part
        gestalt.diplomacy.knownPlayers['olo'].kos = false; // KOS - Kill On Sight - attempt to remove As soon as possible
        gestalt.diplomacy.knownPlayers['olo'].embargo = false; // Embargo - actively ignore market orders
        
        // Recreate sector list
        gestalt.empire.sectors = [];  // list of sectors
        for(const i in Game.spawns) { // find all spawns and create sectors for each room
            let basepos = Game.spawns[i].pos;
            var roomname = Game.spawns[i].room.name;
            if (!rooms[roomname]){
                rooms[roomname] = {};
                if (rooms[roomname].storage != undefined) { // RCL <= 4
                    basepos = rooms[roomname].storage.pos;
                    basepos.x += 1;
                } else {
                    basepos.x -= 4;
                }
                var roomname = Game.spawns[i].room.name;
                initializeSector(roomname, basepos, i);
            }
            let newId = rooms[roomname].spawns.length;
            rooms[roomname].spawns[newId] = {};
            rooms[roomname].spawns[newId].spawnId = Game.spawns[i].id;
            rooms[roomname].spawns[newId].initializeCreep = false;
        }
        if (gestalt.empire.sectors.length == 1 && Game.rooms[gestalt.empire.sectors[0]].controller.level == 1) { // Only 1 sector on level 1
            Memory.rooms[gestalt.empire.sectors[0]].startup = true;
        }
        console.log('Gestalt - Version 0.1  applied');
    }
    
}