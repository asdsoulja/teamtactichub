let win;
let board_size;
let url= "http://localhost:3000/post";

function sizeChoice() {
    board_size=prompt("Enter size of the board");
    win = prompt("Enter amount of cells in a row to win");

    $('<div id="gameboard"></div>').appendTo('#main');
    $('#sizechoice').css('margin-bottom', '0px');

    for (let i = 0; i < board_size; i++) {
        for (let j = 0; j < board_size; j++){
            let newImg = document.createElement("img");
             $(newImg).attr("id",""+j+i+"0");  //i,j are coordinates, the last bit is the state. -1 for O's, 0 for empty, and 1 for X's
             $(newImg).attr("class","cell");
             $(newImg).attr("src","images/square.png");

             
             $(newImg).click(() => 
                select( $(newImg).attr("id"))
             )

             $("#gameboard").append(newImg);
        }
        $("#gameboard").append(document.createElement("br"));
    }
};

function select(cell){

    let move= cell.substr(0,2);
    let status=cell[2];
    $("#"+cell).attr("src", "images/x.jpg");

    
    $.post(url+'?data='+JSON.stringify({
        'move':move, 
        'size':board_size,
        'win':win}
        ), response);

    
}

function response(data,status){
    let res=JSON.parse(data);
    if(res['server_move'] == 0){
        alert("Please click an empty square");
        return;
    }

    $('#'+res['server_move']+"0").attr("src","images/o.jpg");
    console.log("WINNER : " + res['winner']);
    if(res['winner']=="player"){
        alert("Player Wins");
    }
    else if(res['winner']=="server"){
        alert("Server Wins");
    }

    
}
