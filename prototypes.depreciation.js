global.isRoomAvailable = function (roomname) {
    
    let spawnNames = Object.keys(Game.spawns);
    if (spawnNames.length === 0) {
        return true;
    }
    let homestat = Game.map.getRoomStatus(Game.spawns[spawnNames[0]].room.name);
    return (Game.map.getRoomStatus(roomname).status == homestat);
    
    //boolean
}

global.getTerrainAt = function (arg,y,roomname) {
    //console.log(arg,y,roomname);
    if (y == undefined){
        y = arg.y;
        roomname = arg.roomName;
        x = arg.x;
    } else
    {
        x = arg;
    }
    let terrain = Game.map.getRoomTerrain(roomname);
    switch(terrain.get(x, y)) {
    case TERRAIN_MASK_WALL:
        return 'wall';
    case TERRAIN_MASK_SWAMP:
        return 'swamp';
    case 0:
        return 'plain';
    }
}