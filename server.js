
/*

▀█▀ █▀█ █▀▄ █▀█ ▀
░█░ █▄█ █▄▀ █▄█ ▄

Server doesn't handle win states/ loss states properly. Fix.

*/


const e = require('express');
let express = require('express');
const { request } = require('http');
//const { emitKeypressEvents } = require('readline');
//const { arrayBuffer } = require('stream/consumers');
let app = express();

let pmove;
/*
When a player makes a move they either add a new line (a point) to the board, or extend a previous line to a new cell. 
We use vectors to represent these lines, its direction being either horizontal, diagonal, or vertical 
and its magnitude is how many cells it encompasses, it's "danger level". 
*/
let player_vectors = []; 
let server_vectors=[];
let empty_list=[];

//Intilaizes array of empty cells, out of which the server picks it's move
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
       empty_list.push(""+i+j); 
    }
}


app.post("/post",(req,res) => {

    res.header("Access-Control-Allow-Origin", "*");
    let info = JSON.parse(req.query['data'])
    let player_move=info['move']
    let win = info['win']; //Amount of cells required to win
    let winner="";

    console.log("player move:" +"(" +player_move[0]+","+player_move[1]+")");

    //ToDO: Add a check so that the player clicks on an empty list
    //Removes the players move from the stack of empty cells and adds it to the appropriate array
    let index = empty_list.indexOf(player_move);
    if (index > -1) {
        empty_list.splice(index, 1);
        }
    addMove(player_vectors,player_move);
   
    //Filters the array so it's more managable
    player_vectors=player_vectors.filter((vector,index,array) =>
        index === array.findIndex( (v)=>(
            v.toString() == vector.toString()
        )
        )
    );

    player_vectors.sort((firstEl, secondEl) => { 
        if(firstEl.magnitude > secondEl.magnitude) return -1;
        else if(firstEl.magnitude < secondEl.magnitude) return 1;
        else return 0;
     } );  //Sorts player array in terms of highest magnitutde 

    if(player_vectors[0].magnitude == win) winner = "player" ;
    
    let server_move= chooseMove(player_vectors, server_vectors,empty_list) ; 
    
    console.log("server move:"+"(" +server_move[0]+","+server_move[1]+")");
    index = empty_list.indexOf(server_move);
    if (index > -1) {
        empty_list.splice(index, 1);
        }

    addMove(server_vectors,server_move);
    server_vectors=server_vectors.filter((vector,index,array) =>
        index === array.findIndex( (v)=>(
            v.toString() == vector.toString()
        )
        )
    );

    server_vectors.sort((firstEl, secondEl) => { 
        if(firstEl.magnitude > secondEl.magnitude) return -1;
        else if(firstEl.magnitude < secondEl.magnitude) return 1;
        else return 0;
     } );

    if(server_vectors[0].magnitude == win) winner = "server";
    
    let jsontext = JSON.stringify({
        'server_move':server_move,
        'winner':winner 
    });
    res.send(jsontext);

    console.log("player vectors :" + player_vectors);
    console.log("server vectors :"+server_vectors);

    console.log("---------------------------------------------------");

}).listen(3000);
console.log("Server is running!");


//Function that adds a move to a vector in the vector array, or creates a new vector if it doesn't exist 
//ToDo: Handle "gapped" vectors, vectors that have one point missing but are still threats
function addMove(vector_array,move){
    if(vector_array.length==0){
        vector_array.push(new Vector(move,move));
        return;
    }

    //Basically, goes through each vector and sees if the move can be added to it
    vector_array.forEach(element => {
        let added = false ;
        let dir = element.direction;
        //The algorithm for adding a move to a vector depends on the direction of the vector, so we use a switch statment
        switch (dir) {
            case "x+":
                if(move[1] == element.finalY){
                    if(parseInt(move[0]) - 1 == element.finalX){
                        element.addPoint(move,true);
                        added=true;
                    }
                    else if(parseInt(move[0]) + 1 == element.initialX){
                        element.addPoint(move,false);
                        added=true;
                    } 
                }
                break
            case "x-":
                if(move[1] == element.finalY){
                    if(parseInt(move[0]) + 1 == element.finalX){
                        element.addPoint(move,true);
                        added=true;
                    }
                    else if(parseInt(move[0]) - 1 == element.initialX){
                        element.addPoint(move,false);
                        added=true;
                    } 
                }
                break;
            case "y+":
                if(move[0] == element.finalX){
                    if(parseInt(move[1]) - 1 == element.finalY){
                        element.addPoint(move,true);
                        added=true;
                    }
                    else if(parseInt(move[1]) + 1 == element.initialY){
                        element.addPoint(move,false);
                        added=true;
                    } 
                }
                break;
            
            break;
            case "y-":
                if(move[0] == element.finalX){
                    if(parseInt(move[1]) + 1 == element.finalY){
                        element.addPoint(move,true);
                        added=true;
                    }
                    else if(parseInt(move[1]) - 1 == element.initialY){
                        element.addPoint(move,false);
                        added=true;
                    } 
                }
                break;
            
            break;
            case"d+":
                if(parseInt(move[0])+1 == element.initialX  &&parseInt(move[1])+1 == element.initialY){
                    element.addPoint(move,false);
                    added=true;
                }
                else if(parseInt(move[0])-1 == element.finalY  && parseInt(move[1])-1 == element.finalY){
                    element.addPoint(move,true);
                    added=true;
                }
                break;
            case"d-":
                if(parseInt(move[0])-1 == element.initialX  &&parseInt(move[1])-1 == element.initialY){
                    element.addPoint(move,false);
                    added=true;
                }
                else if(parseInt(move[0])+1 == element.finalY  && parseInt(move[1])+1 == element.finalY){
                    element.addPoint(move,true);
                    added=true;
                }
                break;
            case "0":
                if(element.surrounding_points(5).indexOf(move) != -1){
                    element.addPoint(move,true);
                }
                break;
            default:
                break;
        }
        //If the move doesn't match any previous vector then addMove() creates a new 0 magnitude vector
        if(!added ) {
            vector_array.push(new Vector(move,move));
        }
        
    });   
    
} 




function chooseMove(player_vectors, server_vectors,empty){
    //Array of moves that would be best for the player
    let player_best=[];
    let server_best=[];

    //If it's the first move of the game 
    if(server_vectors.length==0){
        return empty[3];
     }

    player_vectors.forEach(element => {
        //If the vector is a point
        if(element.magnitude == 0){
            let nearby= element.surrounding_points();
            for (let i = 0; i < nearby.length; i++) {
                if(empty.indexOf(nearby[i]) != -1){
                    player_best.push(nearby[i]);
                    return;
                } 
            }
        }
        if(empty.indexOf(element.nextTailPoint) == -1 && empty.indexOf(element.nextTipPoint) == -1){
            return;
        }
        else if(empty.indexOf(element.nextTailPoint) != -1){
            player_best.push(element.nextTailPoint);
        }
        else{
            player_best.push(element.nextTipPoint);
        }


    });
    if(player_best.length==0)player_best.push(empty[0]);

    server_vectors.forEach(element => {
        if(element.magnitude == 0){
            let nearby= element.surrounding_points();
            for (let i = 0; i < nearby.length; i++) {
                if(empty.indexOf(nearby[i]) != -1){
                    server_best.push(nearby[i]);
                    return;
                } 
            }
        }
        if(empty.indexOf(element.nextTailPoint) == -1 && empty.indexOf(element.nextTipPoint) == -1){
            return;
        }
        else if(empty.indexOf(element.nextTailPoint) != -1){
            server_best.push(element.nextTailPoint);
        }
        else{
            server_best.push(element.nextTipPoint);
        }
    });
    if(server_best.length==0)server_best.push(empty[0]);

    //Choosing
    if(player_vectors[0].magnitude >server_vectors[0].magnitude ){
        console.log(player_best )
        return player_best[0];
    }
    else{
        return server_best[0];
    }

}


class Vector{
    //Coordinates of the vector
    constructor(initialPoint, finalPoint) {
        this.initialPoint = initialPoint;
        this.finalPoint = finalPoint;
        this.initialX=initialPoint[0];
        this.initialY=initialPoint[1];

        this.finalX=finalPoint[0];
        this.finalY=finalPoint[1];
      } 

    get direction(){
        if(this.initialPoint == this.finalPoint){
            return "0";
        }

        else if(this.initialY == this.finalY) {
            if(parseInt(this.initialX) < parseInt(this.finalX)){
                return "x+";
            } 
            else{
                return "x-";
            }
        }

        else if (this.initialX == this.finalX){
            if(parseInt(this.initialY) < parseInt(this.finalY)){
                return "y+";
            } 
            else{
                return "y-"
            }
        }

        else if( (parseInt(this.finalX)-parseInt(this.initialX)) / (parseInt(this.finalY)-parseInt(this.initialY)) > 0 ){
            return "d+"
        }
        else{
            return "d-"
        }
    }

    get magnitude(){
        let x_1 = parseInt(this.initialX);
        let y_1 = parseInt(this.initialY);
        let x_2 = parseInt(this.finalX);
        let y_2 = parseInt(this.finalY);

        return Math.sqrt( (x_1-x_2)**2 + (y_1-y_2)**2 );
    }

    //Returns point needed to extend the vector from the end
    get nextTipPoint(){
        switch (this.direction) {
            case "x+":
                return ""+(parseInt(this.finalX)+1) + this.finalY;
            case "x-":
                return ""+(parseInt(this.finalX) - 1) + this.finalY;
            case "y+":
                return ""+this.finalX + (parseInt(this.finalY)+1);
            case "y-":
                return ""+this.finalX + (parseInt(this.finalY)-1);
            case "d+":
                return ""+(parseInt(this.finalX)+1) + (parseInt(this.finalY)+1);
            case "d-":
                return ""+(parseInt(this.finalX)-1) + (parseInt(this.finalY)+1);
            default:
                return "0";
        }
    }

    //Returns point needed to extend the vector from the start
    get nextTailPoint(){
        switch (this.direction) {
            case "x+":
                return ""+(parseInt(this.initialX)-1) + this.initialY;
            case "x-":
                return ""+(parseInt(this.initialX)+1) + this.initialY;
            case "y+":
                return ""+this.initialX + (parseInt(this.initialY)-1);
            case "y-":
                return ""+this.initialX + (parseInt(this.initialY)+1);
            case "d+":
                return ""+(parseInt(this.initialX)-1) + (parseInt(this.initialY)-1);
            case "d-":
                return ""+(parseInt(this.initialX)+1) + (parseInt(this.initialY)-1);
            default:
                return "0";
        }
    }
    
    //Adds a point to the vector, the "side" indicates weather to add to the tip of the vector or to the tail of the vector (true = tip)
    addPoint(point,side){

        if(side){
            this.finalPoint=point;
            this.finalX=point[0];
            this.finalY=point[1];
        }
        else{
            this.initialPoint=point;
            this.initialX=point[0];
            this.initialY=point[1]
        }
    }


    //ToDo: Make this more efficent
    surrounding_points(){
        let ret_arr=[];

        let shifted_x_pos=parseInt(this.initialX)+1;
        let shifted_x_neg =parseInt(this.initialX)-1;
        let shifted_y_pos = parseInt(this.initialY)+1;
        let shifted_y_neg=parseInt(this.initialY)-1;

        ret_arr.push(""+shifted_x_pos+this.initialY);

        ret_arr.push(""+shifted_x_neg+this.initialY);

        ret_arr.push(""+this.initialX+shifted_y_pos);

        ret_arr.push(""+this.initialX+shifted_y_neg);

        ret_arr.push(""+shifted_x_pos+shifted_y_pos);

        ret_arr.push(""+shifted_x_pos+shifted_y_neg);

        ret_arr.push(""+shifted_x_neg+shifted_y_pos);

        ret_arr.push(""+shifted_x_neg+shifted_y_neg);


       return  ret_arr;

    }
    //Returns vector in easy to read string form
    toString(){
        return "["+ "(" + this.initialX + "," + this.initialY + ")" + "," + "(" + this.finalX + "," + this.finalY + ")" + "]";
    }

}

