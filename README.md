# Evolution

## Description
Evolution is a project designed to simulate the bare basics of the way natural selection works. Each animal is equipped with various traits that mutate every cycle. In this simplified model, the traits of the animal that survives the longest are passed to the next generation, and then mutated randomly by a certain margin for each new animal. 

Each entity is represented on the screen by a particular dot, with its color representing the type of entity it is. There are 3 entities in this model: Carrots (orange), Rabbits (white), and Foxes (yellow). 

![image](https://user-images.githubusercontent.com/73001560/209702527-4da75592-3921-4106-acab-d973f44e68e1.png)

### Basic Features
Entities move around via random adjustment. All entities have an initial random direction set, but every few frames that direction changes slightly by a random amount.

Entities have a certain amount of energy, in joules given to them, which depends on its MASS attribute. Every loop, that energy decreases by a certain amount (specified in the "Traits" section). If an entity's energy reaches 0, the entity dies and turns red.

If an entity is eaten, regardless of whether it was alive or had died, it will turn gray. Once all moving entities are gray, a new cycle will begin.

Eating an entity gives the predator an increase in energy.

![image](https://user-images.githubusercontent.com/73001560/209707389-4b4a5903-c3cd-4bb8-a8b8-88c0cead48d6.png)

The statistics in the top right corner of the screen show the number of entities of each type currently alive on the screen as well as how long each species has survived for. 

### Traits

Entities have 5 different mutable traits: SPEED, BURST TIME, REDUCED SPEED TIME, MASS, and VISION.
- SPEED is the magnitude of an entity's velocity vector; in other words, the distance traversed per animation frame.
- BURST TIME is the amount of time, in animation frames, an entity can maintain a "burst" speed, where the speed increases by 50%.
  - Burst is activated when either an entity senses moving prey, or an entity senses a predator.
  - Once the burst time limit expires, an entity cannot activate it again until the time limit for reduced speed cools.
- REDUCED SPEED TIME is the amount of time, in animation frames, an entity must maintain a "reduced" speed, where the speed decreases by 40%.
  - Reduced speed is only activated upon the end of a burst.
- MASS is the weight, in kilograms, of an entity. It determines both the initial amount of energy of an entity and the rate at which energy reduces.
  - The total energy of an entity, in joules, is its MASS times a base energy amount for all entities. 
  - The rate at which energy reduces per animation frame is half of the mass times the quantity (v+3) squared, where v is the current speed.
  - Mass is visually shown as the size of the entity on the screen.
- VISION is the distance for which an entity can see its surroundings. It will act depending on what is within its vision radius
  - If there is prey within its radius, the entity will move towards it. It will also burst if the prey is moving
  - If there is a predator within its radius, the entity will move away from the predator
    - The entity will burst away from the predator
    - The entity will prioritize running away from the predator rather than going to food, unless its current energy is at 10% or less of its initial.
  - Vision radius is shown visually by the transparent gray circle surrounding an entity

These mutable traits are the crux of this project, as they demonstrate the true essence of natural selection. All traits are not necessarily beneficial, even though they may seem that way. For example, having a very high speed helps an entity to escape from a predator, but will drain its energy very quickly. Longer bursts can help with catching prey, but can drain all of an entity's energy if used for too long. Higher mass means having more energy to start with, but also increases the rate of energy loss. 

Vision also has a surprising drawback: information overload. When a rabbit, for instance, has too large a vision radius, it will prioritize running from the predators it sees rather than finding food, which leads to it almost never having time to find food.

## Installation

Find the green button labelled "<Code>" and download the zip from there. Then, simply unzip the folder and run the index.html file on the browser.
