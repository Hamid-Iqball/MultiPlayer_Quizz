import Game from "./lib/game.js";


const game =  new Game(
   [
    { text: "2 + 2?", answer: "4" },
  { text: "Capital of France?", answer: "Paris" }
   ]
)


const alice = game.addPlayer("Alice")
const bob = game.addPlayer("Bob")

console.log('.....startingggg')

game.start()


game.submitAnswer(alice.id,"4")
game.submitAnswer(bob.id , "4")

console.log(game.getStates())

console.log('...NEXT QUESTION')

game.nextQuestion()



game.submitAnswer(alice.id, "Paris")
game.submitAnswer(bob.id , "parissss")



console.log(game.getStates())


console.log('Game finished')