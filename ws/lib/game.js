import Player from "./player.js";

import crypto from "node:crypto";



export default class Game{

    constructor(questions){

     this.questions = questions;

     this.id =crypto.randomInt(100000,999999);

     this.players = new Map()

     this.currentQuestionIndex = -1;

     this.started =null;

    }







 addPlayer(name){
    if(this.started){
        throw new Error("Game already started can not start it");
    }
    const player =  new Player(crypto.randomUUID(), name);

    this.players.set(player.id, player);

    return player;

    }





start(){
        if(this.players === 0){
            throw new Error("No player in the game")
        }
        this.started = new Date();
        this.currentQuestionIndex = 0;
        this.resetPlayers()
    }

    
submitAnswer(playerId , answer){
    if(!this.started){
        throw new Error("Game not started")
    }
    const player = this.players.get(playerId)
    if(!player || player.hasAnswered) {
        throw new Error("Player not found or already answered")
    }

    player.hasAnswered = true;
    const correctAnswer  = this.questions[this.currentQuestionIndex].answer

    if(answer === correctAnswer){
        player.addScore()
    }
   }

 nextQuestion(){
    this.currentQuestionIndex +=1

    if(this.currentQuestionIndex >= this.questions.length){

        this.end()

    }

    this.resetPlayers()

 }





 resetPlayers(){

    for(const player of this.players.values()){

        player.hasAnswered = false;

    }

 }







 getStates(){
    return {
        started: this.started,
        question: this.currentQuestionIndex >= 0 && this.questions 
            ? this.questions[this.currentQuestionIndex] 
            : null,
        players: [...this.players.values()].map(p => ({
            name: p.name,
            score: p.score,
            hasAnswered: p.hasAnswered
        }))
    };
 }





 end(){

    this.started = false;

    this.currentQuestionIndex = -1;

    this.resetPlayers()

 }













}