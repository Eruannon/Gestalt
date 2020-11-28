require('lib.traveller');

Creep.prototype.moveOffRoad = function (target, dist) {
    //see if we are offroad
    if (!_.some(this.pos.lookFor(LOOK_STRUCTURES), (s) => s instanceof StructureRoad)) return true
    
    //if not find an offroad post towards the target
    const positions = [];
    //load offset positions that it could move to within the set range
    let offsets = []
    for (let x = -dist; x <= dist; x++) offsets.push(x) //ah, push it
    
    const t = new Room.Terrain(this.room.name) //load up the rooms terrain
    
    //find each valid position around the target that does not have a road
    _.forEach(offsets, (x) => _.forEach(offsets, (y) => {
        //make sure the position is within the room and not an exit tile
        if (this.pos.x + x < 49 && this.pos.y + y < 49 && this.pos.x + x > 0 && this.pos.y + y > 0) {
            
            const p = new RoomPosition(this.pos.x + x, this.pos.y + y, this.pos.roomName); //New room position to check
            
            if (!_.some(p.lookFor(LOOK_STRUCTURES))//move off of all structures
            && !_.some(p.lookFor(LOOK_CONSTRUCTION_SITES))//no construction sites
            && t.get(p.x,p.y) !== TERRAIN_MASK_WALL) positions.push(p); //Push the valid location (no wall terrain)
        }
    }));
    
    //make sure the position is towards the target and there is no creeps
    const validPositions = _.filter(positions, 
        (rp) => rp.getRangeTo(target) <= this.pos.getRangeTo(target) && rp.lookFor(LOOK_CREEPS).length === 0);
        
    if (validPositions.length === 0) return this.travelTo(target); //no positions, move towards the target to make room for people behind them
    let posit = this.pos.findClosestByRange(validPositions) //find the closest position to the creep
    return this.travelTo(posit); //move to that position
}