//Civilian Archetypes

StructureSpawn.prototype.createBasicDrill = function(energylimit, roomname) {
    var numberOfParts = Math.max(Math.floor((energylimit-50)/100),5);
    var body = [];
    body.push(MOVE);
    for (i = 0; i<numberOfParts; i++) {
        body.push(WORK);
    }
    body.reverse();
    var newName = this.room.name + '-BD-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

global.calculateTransport = function(energylimit) {
    let template = [MOVE, CARRY, CARRY, CARRY]
    let currentPart = 0;
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        if (energyleft < 50) {
            body.push(TOUGH);
            energyleft -= 10;
        }
        if (template[currentPart%template.length] == WORK) {
            if (energyleft >= 100) {
                body.push(WORK);
                energyleft -= 100;
            }
            currentPart++;
        } else {
            body.push(template[currentPart%template.length]);
            energyleft -= 50;
            currentPart++;
        }
    }
    console.log(body);
}

StructureSpawn.prototype.createDrill = function(energylimit) {
    var numberOfParts = Math.min(Math.floor((energylimit-100)/100),6);
    var body = [];
    body.push(MOVE);
    body.push(CARRY);
    for (i = 0; i<numberOfParts; i++) {
        body.push(WORK);
    }
    body.reverse();
    var newName = this.room.name + '-D-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

StructureSpawn.prototype.createPioneer = function(energylimit) {
    let template = [MOVE, WORK, CARRY, CARRY];
    let templateMinCost = 99999;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let currentPart = 0; 
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.reverse();
    var newName = this.room.name + '-P-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

StructureSpawn.prototype.createScout = function() {
    var body = [];
    body.push(MOVE);
    var newName = this.room.name + '-S-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}


StructureSpawn.prototype.createWorker = function(energylimit) {
    let template = [MOVE, WORK, CARRY]
    let templateMinCost = 6000;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let currentPart = 0; // 1 is initial offset, will start at 'MOVE' part
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.reverse();
    var newName = this.room.name + '-W-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

StructureSpawn.prototype.createCrane = function(energylimit) { // RCL 7+, when second spawn is available
    var numberOfParts = Math.min(Math.floor(energylimit/50),20);
    var body = [];
    for (i = 0; i<numberOfParts; i++){
        body.push(CARRY);
    }
    var newName = this.room.name + '-C-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName, { directions: [BOTTOM_LEFT]});
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

StructureSpawn.prototype.createTruck = function(energylimit) {
    let template = [MOVE, CARRY]
    let templateMinCost = 6000;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let currentPart = 0; // 1 is initial offset, will start at 'MOVE' part
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.reverse();
    var newName = this.room.name + '-F-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}


StructureSpawn.prototype.createFreighter = function(energylimit) {
    let template = [MOVE, CARRY, CARRY, CARRY]
    let templateMinCost = 6000;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let currentPart = 0; // 1 is initial offset, will start at 'MOVE' part
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.reverse();
    var newName = this.room.name + '-F-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

StructureSpawn.prototype.createUpgrader = function(energylimit, workCap) {
    let template = [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK];
    let currentPart = 0; // 1 is initial offset, will start at 'MOVE' part
    let body = [];
    body.push('CARRY');
    let templateMinCost = 6000;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.reverse();
    var newName = this.room.name + '-U-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

// GESTALT LEVEL CREEPS
StructureSpawn.prototype.createFastTruck = function(energylimit) { // OFF-Road transport
    let template = [MOVE, MOVE, CARRY]
    let templateMinCost = 6000;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let currentPart = 0; // 1 is initial offset, will start at 'MOVE' part
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.sort();
    body.reverse();
    var newName = 'Gestalt' + '-FT-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

StructureSpawn.prototype.createClaimer = function(energylimit) { // OFF-Road transport
    var body = [];
    body.push(MOVE);
    body.push(CLAIM);
    var newName = 'Gestalt' + '-CL-' + Memory.Gestalt.droneid;  
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

StructureSpawn.prototype.createSettler = function(energylimit) { // OFF-Road transport
    let template = [MOVE, WORK, CARRY, CARRY];
    let templateMinCost = 6000;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let currentPart = 0; // 1 is initial offset, will start at 'MOVE' part
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.reverse();
    var newName = 'Gestalt' + '-GS-' + Memory.Gestalt.droneid;  
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

// COMBAT ARCHETYPES

StructureSpawn.prototype.createGuard = function(energylimit) { // OFF-Road transport
    let template = [MOVE, CARRY]
    let templateMinCost = 6000;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let currentPart = 0; // 1 is initial offset, will start at 'MOVE' part
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.sort();
    body.reverse();
    var newName = 'Gestalt' + '-T-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}


StructureSpawn.prototype.createBatteringRam = function(energylimit) { // OFF-Road transport
    let template = [MOVE, WORK]
    let templateMinCost = 6000;
    for (i = 0; i < template.length; i++){
        if (templateMinCost > BODYPART_COST[template[i]]) {
            BODYPART_COST[template[i]];
            templateMinCost = BODYPART_COST[template[i]];
        }
    }
    let currentPart = 0; // 1 is initial offset, will start at 'MOVE' part
    let body = [];
    let energyleft = energylimit;
    while (energyleft > 0 && body.length < 50) {
        let part = template[currentPart%template.length];
        let partCost = BODYPART_COST[part];
        if (energyleft >= partCost) {
            body.push(part);
            energyleft -= partCost;
            currentPart++;
        } else {
            energyleft -= partCost;
            currentPart++;
        }
        if (energyleft < templateMinCost){
            energyleft -= partCost;
        }
    }
    body.sort();
    body.reverse();
    var newName = 'Gestalt' + '-BR-' + Memory.Gestalt.droneid;
    var result = this.spawnCreep(body, newName)
    if(result == 0){
        Memory.Gestalt.droneid++;
        return newName;
    } else {
        return result; 
    }
}

