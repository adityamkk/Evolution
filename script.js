'use strict'

/*
  CONSTANTS AND VARIABLES
*/
const canvas = document.querySelector(".myCanvas"); // canvas object
const width = canvas.width = window.innerWidth;     // width of the window
const height = canvas.height = window.innerHeight;  // height of the window
const ctx = canvas.getContext('2d');                // canvas context

let entities = [];  // List of all entities on the canvas
const normEnergy = 10000;   // Default amount of energy, in Joules
const eatRadius = 10;            // Default eating radius, in meters

/*
  HELPER FUNCTIONS
*/

// Converts an angle from degrees to radians
function degToRad(angle) {
    return angle * Math.PI / 180;
}

// Converts an angle from radians to degrees
function radToDeg(angle) {
    return angle * 180 / Math.PI;
}

// Generates a random integer x between 0 and max
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomRange(margin) {
    return 2*margin*Math.random()-margin;
}

// Returns the distance between two points (x1, y1) and (x2, y2)
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
}

// Returns toral distance based on points (x1, y1) and (x2, y2), and a type of distance
/*
    Toral Distance Types:
    d1 : normal distance
    d2 : x is rectangular, y wraps
    d3 : y is rectangular, x wraps
    d4 : both x and y wrap
*/
function toralDistance(x1, y1, x2, y2, dType = 1) {
    switch(dType) {
        case 2: return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(height-y1+y2,2)) < Math.sqrt(Math.pow(x1-x2,2) + Math.pow(height+y1-y2,2)) ? Math.sqrt(Math.pow(x1-x2,2) + Math.pow(height-y1+y2,2)) : Math.sqrt(Math.pow(x1-x2,2) + Math.pow(height+y1-y2,2));
        case 3: return Math.sqrt(Math.pow(width-x1+x2,2) + Math.pow(y1-y2,2)) < Math.sqrt(Math.pow(width+x1-x2,2) + Math.pow(y1-y2,2)) ? Math.sqrt(Math.pow(width-x1+x2,2) + Math.pow(y1-y2,2)) : Math.sqrt(Math.pow(width+x1-x2,2) + Math.pow(y1-y2,2));
        case 4: return Math.sqrt(Math.pow(width-x1+x2,2) + Math.pow(height-y1+y2,2)) < Math.sqrt(Math.pow(width+x1-x2,2) + Math.pow(height+y1-y2,2)) ? Math.sqrt(Math.pow(width-x1+x2,2) + Math.pow(height-y1+y2,2)) : Math.sqrt(Math.pow(width+x1-x2,2) + Math.pow(height+y1-y2,2));        default: return distance(x1,y1,x2,y2);
    }
}

// Returns the angle XAB, where X is the line horizontal to A, A(x1, y1), and B(x2, y2)
function angle(x1, y1, x2, y2) {
    let a = 0;
    try {
        a = Math.atan(Math.abs(y2-y1)/Math.abs(x2-x1));
        if(y2 - y1 < 0) {
            a = 2*Math.PI - a;
        }
        if(x2 - x1 < 0) {
            a = Math.PI - a;
        }
    }
    catch(error) {
        if(y2 - y1 > 0) {
            a = Math.PI/2;
        } else {
            a = 3*Math.PI/2;
        }
    }
    /*const minDistance = Math.min(toralDistance(x1,y1,x2,y2,1),toralDistance(x1,y1,x2,y2,2),toralDistance(x1,y1,x2,y2,3),toralDistance(x1,y1,x2,y2,4));
    switch(minDistance) {
        case toralDistance(x1,y1,x2,y2,2): a = 2*Math.PI - a; break;
        case toralDistance(x1,x2,y1,y2,3): 
    }
    */
    return a;
}

// Gets rgb fillstyle string from values
function getFillStyle(r, g, b) {
    return `rgb(${r},${g},${b})`;
}

/*
  CLASSES AND OBJECTS
*/

// "Entity" is the base class for all objects in the simulation
// One step is assumed to be one second
class Entity {

    // Constructor
    constructor(TYPE, RCOLOR, GCOLOR, BCOLOR, EATABLES, TIER, SPEED, BURST, RSPEED, ENERGY, MASS, VISION) {

        // Non-mutable Genetic Traits
        this.TYPE = TYPE;     // Type of entity (class name)
        this.RCOLOR = RCOLOR;    // Red Value
        this.GCOLOR = GCOLOR;    // Green Value
        this.BCOLOR = BCOLOR;    // Blue Value
        this.EATABLES = EATABLES; // List of Eatable Entities
        this.ENERGY = MASS*ENERGY;    // Initial total potential energy, in Joules
        this.TIER = TIER;       // Tier value for food hierarchy

        // Mutable Genetic Traits
        this.SPEED = SPEED;     // Base speed, in ms^-1
        this.BURST = BURST;     // Base burst speed, in ms^-1
        this.RSPEED = RSPEED;    // Base reduced speed, in ms^-1
        this.MASS = MASS;      // Base mass, in kg (used as energy reduction rate)
        this.VISION = VISION;    // Vision radius, in meters

        // Current Status
        this.x = getRandomInt(width-100) + 50;         // Current x-coordinate, in meters
        this.y = getRandomInt(height-100) + 50;         // Current y-coordinate, in meters
        this.speed = this.SPEED;     // Current speed, in ms^-1
        this.direction = degToRad(getRandomInt(359)); // Current direction, in radians
        this.energy = this.ENERGY;    // Current potential energy, in Joules
        this.living = 1;    // Current status as alive, dead, or eaten (ALIVE: 1, DEAD: 0, EATEN: -1)
    }

    // Accessors & Mutators
    getTYPE() { return this.TYPE; }
    getRCOLOR() { return this.RCOLOR; }
    getGCOLOR() { return this.GCOLOR; }
    getBCOLOR() { return this.BCOLOR; }
    setRGB(r,g,b) {
        this.RCOLOR = r;
        this.GCOLOR = g;
        this.BCOLOR = b;
    }
    getEATABLES() { return this.EATABLES; }
    getENERGY() { return this.ENERGY; }
    getTIER() { return this.TIER; }

    getSPEED() { return this.SPEED; }
    setSPEED(speed) { this.SPEED = speed; }
    getBURST() { return this.BURST; }
    setBURST(burst) { this.BURST = burst; }
    getRSPEED() { return this.RSPEED; }
    setRSPEED(rspeed) { this.RSPEED = rspeed; }
    getMASS() { return this.MASS; }
    setMASS(mass) { this.MASS = mass; }
    getVISION() { return this.VISION; }
    setVISION(vision) { this.VISION = vision; }

    getX() { return this.x; }
    setX(x) { this.x = x; }
    getY() { return this.y; }
    setY(y) { this.y = y; }
    getSpeed() { return this.speed; }
    setSpeed(speed) { this.speed = speed; }
    getDirection() { return this.direction; }
    setDirection(direction) { 
        while(direction >= 2*Math.PI || direction < 0) {
            if(direction >= 2*Math.PI) {
                direction -= 2*Math.PI;
            } else {
                direction += 2*Math.PI;
            }
        }
        this.direction = direction; 
    }
    getEnergy() { return this.energy; }
    setEnergy(energy) { this.energy = energy; }
    getLiving() { return this.living; }
    setLiving(living) { this.living = living; }

    // Methods

    // Checks if an entity is within this entity's field of vision, a 90 degree cone
    inFieldOfVision(e) {
        const a = angle(this.getX(), this.getY(), e.getX(), e.getY());
        if((toralDistance(this.getX(), this.getY(), e.getX(), e.getY(),1) <= this.getVISION() || toralDistance(this.getX(), this.getY(), e.getX(), e.getY(),2) <= this.getVISION() || toralDistance(this.getX(), this.getY(), e.getX(), e.getY(),3) <= this.getVISION() || toralDistance(this.getX(), this.getY(), e.getX(), e.getY(),4) <= this.getVISION())) { //&& ((a > this.getDirection() - coneAngle && a < this.getDirection() + coneAngle) || (a - 2*Math.PI > this.getDirection() - coneAngle && a - 2*Math.PI < this.getDirection() + coneAngle))
            return true;
        }
    }

    // Check surroundings
    check() {

        // Randomish movement
        this.setDirection(this.getDirection() + getRandomRange(0.1));

        // Loop through entities
        const predators = [];
        let escapeAngle = 0;
        for(const e of entities) {
            if(this.getEATABLES().includes(e.getTYPE()) && e.getLiving() >= 0 && this.inFieldOfVision(e)) {
                this.setDirection(this.getDirection() + (angle(this.getX(),this.getY(),e.getX(),e.getY()) - this.getDirection())*5/6);
            }
            if(this.getTIER() < e.getTIER()) {
                predators.push(e);
            }
        }
        if(predators.length != 0 && this.getEnergy() <= this.getENERGY()/10) {
            for(const p of predators) {
                escapeAngle += angle(this.getX(), this.getY(), p.getX(), p.getY());
            }
            this.setDirection(Math.PI - escapeAngle/predators.length);
        }
    }

    // Move based on trajectory
    move() {
        this.setX(this.getX() + this.getSpeed()*Math.cos(this.getDirection()));
        this.setY(this.getY() + this.getSpeed()*Math.sin(this.getDirection())); // SIGN CHANGE HERE TO ACCOUNT FOR COORDINATE SYSTEM OF CANVAS: SUBJECT TO CHANGE
        
        if(this.getX() < 0) { this.setX(this.getX() + width); }
        if(this.getX() > width) { this.setX(this.getX() - width); }
        if(this.getY() < 0) { this.setY(this.getY() + height); }
        if(this.getY() > height) { this.setY(this.getY() - height); }
        
        ctx.beginPath();
        ctx.fillStyle = getFillStyle(this.getRCOLOR(), this.getGCOLOR(), this.getBCOLOR());
        ctx.arc(this.getX(), this.getY(), this.getMASS(), 0, 2*Math.PI, true);
        ctx.fill();
    }

    // Eat if an eatable is within range
    eat() {
        if(this.getLiving() > 0) {
            for(const e of entities) {
                // if the entity is an eatable and is within range...
                if(this.getEATABLES().includes(e.getTYPE()) && e.getLiving() >= 0 && distance(this.getX(), this.getY(), e.getX(), e.getY()) <= eatRadius) {
                    // Take its energy
                    this.setEnergy(this.getEnergy() + e.getENERGY() * Math.pow(10,e.getTIER() - this.getTIER()));
                    // Set the entity's living status to eaten
                    e.setLiving(-1);
                }
            }
        }
    }

    // Updates energy and living status
    updateEnergy() {
        this.setEnergy(this.getEnergy() - 0.5*this.MASS*Math.pow(this.getSpeed() + 1,2));
        if(this.getEnergy() <= 0 && this.getLiving() > 0) {
            this.setLiving(0);
        }
        if(this.getLiving() <= 0 && this.getEnergy > 0) {
            this.setEnergy(0);
        }
        if(this.getLiving() === 0) {
            this.setRGB(255,0,0);
            this.setSpeed(0);
        }
        if(this.getLiving() < 0) {
            this.setRGB(100,100,100);
            this.setSpeed(0);
        }
    }

    // Mutates all genes by a random amount
    mutateGenes() {
        this.setSPEED(this.getSPEED() + getRandomRange(1));
        this.setBURST(this.getBURST() + getRandomRange(1));
        this.setRSPEED(this.getRSPEED() + getRandomRange(0.5));
        this.setMASS(this.getMASS() + getRandomRange(0.2));
        this.setVISION(this.getVISION() + getRandomRange(5));
    }
}

// CARROT
class Carrot extends Entity {
    
    // Constructor
    constructor() {
        super('Carrot', 256, 165, 0, [], 0, 0, 0, 0, normEnergy, 5, 0);
    }

}

// RABBIT
class Rabbit extends Entity {

    // Constructor
    constructor(SPEED, BURST, RSPEED, MASS, VISION) {
        super('Rabbit', 255, 255, 255, ['Carrot'], 1, SPEED, BURST, RSPEED, normEnergy, MASS, VISION);
    }

    // Methods

}

// FOX
class Fox extends Entity {

    //Constructor
    constructor(SPEED, BURST, RSPEED, MASS, VISION) {
        super('Fox', 255, 255, 0, ['Rabbit'], 2, SPEED, BURST, RSPEED, normEnergy, MASS, VISION);
    }
}

// BEAR
class Bear extends Entity {

    // Constructor
    constructor(SPEED, BURST, RSPEED, MASS, VISION) {
        super('Bear', 100, 255, 255, ['Fox'], 3, SPEED, BURST, RSPEED, normEnergy, MASS, VISION);
    }
}

/*
  INITIAL SETUP
*/

for(let i = 0; i < 30; i++) {
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Carrot());
    entities.push(new Rabbit(5,7,3,10,100));
    entities.push(new Rabbit(5,7,3,10,100));
    entities.push(new Rabbit(5,7,3,10,100));
    entities.push(new Rabbit(5,7,3,10,100));
    
    //entities.push(new Fox(4,8,2,15,150));
}

for(let i = 0; i < 5; i++) 
{
entities.push(new Fox(5.5,8,2,15,150));
}

/*
  LOOP FUNCTION
*/
function loop() {

    // Background
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0,0,width,height);

    for(const e of entities) {
        e.check();
    }
    for(const e of entities) {
        e.move();
    }
    for(const e of entities) {
        e.eat();
        e.updateEnergy();
    }

    window.requestAnimationFrame(loop);
}

/*
  EVENT LISTENERS
*/

loop();