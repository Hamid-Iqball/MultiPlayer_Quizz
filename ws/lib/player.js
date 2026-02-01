// lets design a player class


export default class Player{
    
constructor(id,name){
     
    this.id =id;
    this.name =name;
    this.gameId =null;
    this.game =null;
    this.score=0
    this.hasAnswered =false
  }


  addScore(){
  this.score +=1;
  }


  resetFortheNextQuestion(){
    this.hasAnswered =false
  }




        }