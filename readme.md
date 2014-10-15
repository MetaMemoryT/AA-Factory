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

### roadmap
- Pause Resume with correct disabled/enabled
- Submit Code -> Save + Load
bring back alert win / lose: out of bounds
level 1 + 2 winning code inserted
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