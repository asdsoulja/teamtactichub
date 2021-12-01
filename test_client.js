let win;
let board_size;
let url= "http://localhost:3000/post";

window.onload = () => {
    board_size=prompt("Enter size of the board");
    win = prompt("Enter amount of cells in a row to win");
    for (let i = 0; i < board_size; i++) {
        for (let j = 0; j < board_size; j++){
            let newImg = document.createElement("img");
             $(newImg).attr("id",""+i+j+"0");  //i,j are coordinates, the last bit is the state. -1 for O's, 0 for empty, and 1 for X's
             $(newImg).attr("class","cell");
             $(newImg).attr("src","square.png");

             
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
    $("#"+cell).attr("src", "x.png");
    console.log("win:"+win);
    console.log("size:"+board_size);
    
    $.post(url+'?data='+JSON.stringify({
        'move':move, 
        'size':board_size,
        'win':win}
        ), response);

    
}

function response(data,status){
    let res=JSON.parse(data);
    console.log(res['winner']);
    if(res['winner']=="player"){
        alert("Player Wins");
    }
    else if(res['winner']=="server"){
        alert("Server Wins");
    }
    else{
        $('#'+res['server_move']+"0").attr("src","o.png");
    }
    
}
