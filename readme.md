## Features needed for Presentation:
### BUG Sometimes The Robot Disappears in level3
If you use the step feature in level 3 you will notice that the robot disappears for a turn or 2.
This could be to do with the step logic callback added in the constructor of level3 or just a rendering problem. Note, the map for level3 is an extended class called L3Map which changes the default coloring behavior for a robot.
#### partial fix
Part of the problem was that L3Map.prototype.colorRobot would return the `target` color if there was a dud. By only returning target color when there was a dud AND the dud wasn't in the same place as the robot some of the problem was fixed.

### FIXED Run Game button doesn't fully reset the game
#### FIXED
just had to reset window.robotFinished in level constructor
#### to reproduce
- run level3 to completion.
- press run game
- the robot exits after the first turn


## creation of user AI
Not using server approach because it is too technical for our specific audience.
### inline editor
- textarea
- on submit eval code which returns a function.
- function is ran in Robot.move

### nodejs server with DevTools
Make a node server which serves up a specific level.  This level will have a skeleton of code where the user will program the AI. They will make a workspace and create a network mapping. This way they have the full power of devTools.

### installation
requires chrome > M38 for for..of loops
bower install

### Bugs (- when solved)
"Run Game" on level 3, "Run Game" again and it fails, likely some of the new global vars are not being reset.

### Integration Problems
6cc7529619f56b07759373ed03ef53d25c79cfe5 lost 3 lines from readme.md

### roadmap
- Pause Resume with correct disabled/enabled
- Submit Code -> Save + Load
- level 1 + 2 w/ winning code inserted
- bring back alert win / lose: out of bounds
- email
- 3 levels working
- codemirror
- console.log
- fix changeOrRestartLevel
level 4 -> 5 random clients
decision making
inter-agent communication
seek and destroy
1 level for each of the five classes http://en.wikipedia.org/wiki/Intelligent_agent#Classes_of_intelligent_agents
Load
level nav
* NOTE: \[Run Game] also Saves and Loads your code into the game
Save
Level select
Insert starter template (automatic on level select)
level Objective
Insert hint
Insert soln(devel version only)
astar
dynamic programming
Inspect Game State
Dropbox sync + share


## theory
The AI that the user implements should be structure as a function which takes 2 object arguments like this:
```
function move(sensors, actuators, state) {
    ...
}
```
`sensors` is an object of fields and methods the AI can use to perceive the environment.
`actuators` is an object of fields and methods the AI can use act upon the environment.
`state` is an object which contains anything the AI keeps track of. Could be considered its "knowledge".
http://51lica.com/wp-content/uploads/2012/05/Artificial-Intelligence-A-Modern-Approach-3rd-Edition.pdf, chapter 2

## level4
### questions
Does each client have a unique destination?
  > The locations don't have to be unique.

Do clients start on different locations?
  > Yes, I think they could be randomly placed.

Does the AI know the destination(s) at the start, or does he have to find it? "Taxi driver" title implies he knows the destination, and the client locations.

Do the clients move randomly? Do they move towards their destinations?

Does each client have its own destination? Or do they all have the same destination?

If each clients has its own destination, when should this information become availible?

Should clients spawn randomly during the level, or all at the beginning?

What is the "AI" part of the algorithm? Give me rough sudo-code of the correct answer.
### description
level 4 is going to be a taxi driver Robot.

Each Taxi Driver (robot)
    * has a list of clients (an array, managed by the level, containing the coordinates of the clients)
    * must move each client to their destination ()
    * should complete goals as fast as possible
The level is beat if the taxi driver signals that it is finished in less than the time limit
The time limit is calculated as follows:
```
timeLimit = 2 * sum(distance from client's location to their goal) + (grid size) / (number of clients)
```
This formula assumes the clients are evenly distributed.
This should be fairly easy to beat because it is allowing for the taxi driver to deliver a client, retrace his path, then pick up the next client.  The level could be made more challenging by adding a difficulty modifier like so:
```
timeLimit' = timeLimit * difficulty
where difficulty < 1
```
