const { count } = require("console");
const e = require("express");
let express = require("express");
const { request } = require("http");
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
let server_vectors = [];
let empty_list = [];

//Intilaizes array of empty cells, out of which the server picks it's move

app.post("/post", (req, res) => {
    let jsontext;
    res.header("Access-Control-Allow-Origin", "*");
    let info = JSON.parse(req.query["data"]);
    let size = info["size"];
    let move_num = info["move_num"];

    let win = info["win"]; //Amount of cells required to win
    let winner = "";
    let server_move;

    if(move_num == 1){
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          empty_list.push("" + i + j);
        }
      }
    }


    let player_move = info["move"];

    
    
    console.log(
      "player move:" + "(" + player_move[0] + "," + player_move[1] + ")"
    );
    //Removes the players move from the stack of empty cells and adds it to the appropriate array
    let index = empty_list.indexOf(player_move);
    empty_list.splice(index, 1);
    addMove(player_vectors, player_move,empty_list);
    //Filters the array so it's more managable
    player_vectors = player_vectors.filter(
      (vector, index, array) =>
        index === array.findIndex((v) => v.toString() == vector.toString())
    );
    player_vectors.sort((firstEl, secondEl) => {
      if (firstEl.magnitude > secondEl.magnitude) return -1;
      else if (firstEl.magnitude < secondEl.magnitude) return 1;
      else return 0;
    }); //Sorts player array in terms of highest magnitutde

    
    if(empty_list.length != 0) {
      
    server_vectors = server_vectors.filter(
      (vector, index, array) =>
        index === array.findIndex((v) => v.toString() == vector.toString())
    );

    server_vectors.sort((firstEl, secondEl) => {
      if (firstEl.magnitude > secondEl.magnitude) return -1;
      else if (firstEl.magnitude < secondEl.magnitude) return 1;
      else return 0;
    });

    server_move = chooseMove(player_vectors, server_vectors, empty_list);
      console.log(
        "server move:" + "(" + server_move[0] + "," + server_move[1] + ")"
      );
      index = empty_list.indexOf(server_move);
      empty_list.splice(index, 1);
      
      addMove(server_vectors, server_move, empty_list);
    }

    else winner = "tie";

    console.log("Player magnitutude: " + player_vectors[0].magnitude);
    console.log("Server magnitutude: " + server_vectors[0].magnitude);
  
  
    if (player_vectors[0].magnitude >= win) {
      winner = "player";
    } else if (server_vectors[0].magnitude >= win) {
      winner = "server";
    }

    console.log("Winner : "+ winner)

    jsontext = JSON.stringify({
      server_move: server_move,
      winner: winner,
    });

    res.send(jsontext);


    console.log("---------------------------------------------------");
  })
  .listen(3000);
console.log("Server is running!");

//Function that adds a move to a vector in the vector array, or creates a new vector if it doesn't exist
function addMove(vector_array, move, empty) {
  //Vectors which have had a point added to them , vectors of interest. Every single
  //vector in this array shares a point
  let voi = [];
  //Does it extend a previous vector? If it does, grow the vector
  vector_array.forEach(vector => {

    if(vector.direction == "0"){
      let nearby = vector.nextPoints;
      if(nearby.indexOf(move)!= -1){
        vector.addPoint(move,true);
        voi.push(vector);
        return;
      }
    }

    if(vector.nextPoints.indexOf(move) == 0) {
      vector.addPoint(move,true);
      voi.push(vector);
    }
    else if(vector.nextPoints.indexOf(move) == 1) {
      vector.addPoint(move,false);
      voi.push(vector);
    }
    else return;
  });

  //Checks if newly added vector is a part of other vectors
  if(voi.length==0){
    voi.push(new Vector(move,move));
    vector_array.push(new Vector(move,move));
    let points_arr=[];
    let nearby = new Vector(move,move).nextPoints;
    
    vector_array.forEach(element => {
      points_arr.push(element.initialPoint);
      points_arr.push(element.finalPoint);
    });
  //Listen, I ran out of names so I used Jeferson
    const jeferson = nearby.filter(value => points_arr.includes(value));
    for (let i = 0; i < jeferson.length; i++) {
        vector_array.push(new Vector(move,jeferson[i]));
        voi.push(new Vector(move,jeferson[i]));
    } 
  }
  
    
  //Tests if new  vector touches any points, creating any new vectors
 
  let addvec;
  voi.forEach(element => {
    voi.forEach(element2 => {
      if(element.direction == element2.direction && element.toString() != element2.toString()){
        let x_max = Math.max(
          element.initialX,
          element.finalX,
          element2.initialX,
          element2.finalX
        );
        let y_max = Math.max(
          element.initialY,
          element.finalY,
          element2.initialY,
          element.finalX
        );
        let x_min = Math.min(
          element.initialX,
          element.finalX,
          element2.initialX,
          element2.finalX
        );
        let y_min = Math.min(
          element.initialY,
          element.finalY,
          element2.initialY,
          element.finalX
        );
        switch (element.direction) {
          case "x":
            addvec = new Vector(""+x_min+y_max,""+x_max+y_max);
            break;
          case "y":
            addvec = new Vector(""+x_min+y_min,""+x_max+y_max);
            break;
          case "d+":
            addvec = new Vector(""+x_min+y_min,""+x_max+y_max);
            break;
          case "d-":
            addvec = new Vector(""+x_min+y_max,""+x_max+y_min);
            break;
          default:
            console.log("ruh roh something when wrong");
            break;
        }

        vector_array.splice(vector_array.indexOf(element),1);
        vector_array.splice(vector_array.indexOf(element2),1);
        vector_array.push(addvec);
      }
    });
  });


}

//Assumes that the vectors are sorted
function chooseMove(player_vectors, server_vectors, empty) {
  //Array of moves that would be best for the player
  let player_best=[];
  let server_best=[];

  //If it's the first move
  if(server_vectors.length == 0){
    let nearby =player_vectors[0].nextPoints;
    for (let index = 0; index < nearby.length; index++) {
      if(empty.indexOf(nearby[index])!= -1) return nearby[index] ;
    }
  }

  //Determines best moves for the player
  for (let i = 0; i < player_vectors.length; i++) {
    for (let j = 0; j < player_vectors[i].nextPoints.length; j++) {
      let nextPoints = player_vectors[i].nextPoints;
      
      if(empty.indexOf(nextPoints[j]) != -1) {
        player_best.push(nextPoints[j]);
      }
    }
  }
  if(player_best.length == 0) {
    player_best.push(empty[0]);
  }
  
  
  //Determines best moves for the server
  for (let i = 0; i <server_vectors.length; i++) {
    for (let j = 0; j < server_vectors[i].nextPoints.length; j++) {
      let nextPoints = server_vectors[i].nextPoints;
      if(empty.indexOf(nextPoints[j]) != -1) {
        server_best.push(nextPoints[j]);
      }
    }
  }
  if(server_best.length == 0) {
    server_best.push(empty[0])
  }


  if (player_vectors[0].magnitude > server_vectors[0].magnitude) {
      return player_best[0];
  }
  else {
      return server_best[0];
  }

}

class Vector {
  //Coordinates of the vector
  constructor(initialPoint, finalPoint) {
    this.initialPoint = initialPoint;
    this.finalPoint = finalPoint;
    this.initialX = initialPoint[0];
    this.initialY = initialPoint[1];

    this.finalX = finalPoint[0];
    this.finalY = finalPoint[1];
  }

  get direction() {
    if (this.initialPoint == this.finalPoint) {
      return "0";
    } else if (this.initialY == this.finalY) {
        return "x";
    } else if (this.initialX == this.finalX) {
      return "y";
    } else if (
      (parseInt(this.finalX) - parseInt(this.initialX)) /
        (parseInt(this.finalY) - parseInt(this.initialY)) >
      0
    ) {
      return "d+";
    } else {
      return "d-";
    }
  }

  get magnitude() {
    switch(this.direction){
      case "x":
        return Math.abs(parseInt(this.finalX) - parseInt(this.initialX))+1;
      case "y": 
        return Math.abs(parseInt(this.finalY) - parseInt(this.initialY))+1;
      case "d+":
        return Math.abs(parseInt(this.finalX) - parseInt(this.initialX))+1;
      case "d-":
        return Math.abs(parseInt(this.finalX) - parseInt(this.initialX))+1;
      default:
        return 1;
    }
  }

  //Returns point needed to extend the vector 
  get nextPoints(){
    let ret_arr = [];
    switch (this.direction) {
      case "x":
        if(this.finalX > this.initialX){
          ret_arr.push(""+(parseInt(this.finalX)+1)+this.finalY);
          ret_arr.push(""+(parseInt(this.initialX)-1)+this.finalY);
        }
        else{
          ret_arr.push(""+(parseInt(this.finalX)-1)+this.finalY);
          ret_arr.push(""+(parseInt(this.initialX)+1)+this.finalY);
        }
        break;
      case "y":
        if(this.finalY > this.initialY){
          ret_arr.push(""+this.finalX+(parseInt(this.finalY)+1));
          ret_arr.push(""+this.finalX+(parseInt(this.initialY)-1));
        }
        else{
          ret_arr.push(""+this.finalX+(parseInt(this.finalY)-1));
          ret_arr.push(""+this.finalX+(parseInt(this.initialY)+1));
        }
        break;
      case "d+":
        if(this.finalX > this.initialX){
          ret_arr.push(""+(parseInt(this.finalX)+1)+(parseInt(this.finalY)+1));
          ret_arr.push(""+(parseInt(this.initialX)-1)+(parseInt(this.initialY)-1));
        }
        else{

          ret_arr.push(""+(parseInt(this.finalX)-1)+(parseInt(this.finalY)-1));
          ret_arr.push(""+(parseInt(this.initialX)+1)+(parseInt(this.initialY)+1));
        }
        break;
      case "d-":
        if(this.initialX < this.finalX){
          ret_arr.push(""+(parseInt(this.finalX)+1)+(parseInt(this.finalY)-1));
          ret_arr.push(""+(parseInt(this.initialX)-1)+(parseInt(this.initialY)+1));
        }
        else{
          ret_arr.push(""+(parseInt(this.finalX)-1)+(parseInt(this.finalY)+1));
          ret_arr.push(""+(parseInt(this.initialX)+1)+(parseInt(this.initialY)-1));
        }
        break;
      default:
        ret_arr=this.surrounding_points;
        break;
    }
    return ret_arr;
  }

  //Adds a point to the vector, the "side" indicates weather to add to the tip of the vector or to the tail of the vector (true = tip)
  addPoint(point, side) {
    if (side) {
      this.finalPoint = point;
      this.finalX = point[0];
      this.finalY = point[1];
    } else {
      this.initialPoint = point;
      this.initialX = point[0];
      this.initialY = point[1];
    }
  }

  //ToDo: Make this more efficent
  get surrounding_points() {
    let ret_arr = [];

    let shifted_x_pos = parseInt(this.initialX) + 1;
    let shifted_x_neg = parseInt(this.initialX) - 1;
    let shifted_y_pos = parseInt(this.initialY) + 1;
    let shifted_y_neg = parseInt(this.initialY) - 1;

    ret_arr.push("" + shifted_x_pos + this.initialY);

    ret_arr.push("" + shifted_x_neg + this.initialY);

    ret_arr.push("" + this.initialX + shifted_y_pos);

    ret_arr.push("" + this.initialX + shifted_y_neg);

    ret_arr.push("" + shifted_x_pos + shifted_y_pos);

    ret_arr.push("" + shifted_x_pos + shifted_y_neg);

    ret_arr.push("" + shifted_x_neg + shifted_y_pos);

    ret_arr.push("" + shifted_x_neg + shifted_y_neg);

    return ret_arr;
  }
  //Returns vector in easy to read string form
  toString() {
    return (
      "[" +
      "(" +
      this.initialX +
      "," +
      this.initialY +
      ")" +
      "," +
      "(" +
      this.finalX +
      "," +
      this.finalY +
      ")" +
      "]"
    );
  }
}



