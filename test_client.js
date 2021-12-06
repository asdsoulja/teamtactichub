let win;
let board_size;
let url = "http://localhost:3000/post";
let cellimage = "images/square.jpg";
let ximage = "images/x.jpg"
let omage = "images/o.jpg"
let move_num=1;

function sizeChoice() {
  board_size = prompt("Enter size of the board, Minimum amount: 3; Maximum amount: 3");
  win = prompt("Enter amount of cells in a row to win, Minimum amount: 2; Maximum amount: size of the board");

  $('.themes').hide();

  $('<div id="gameboard"></div>').appendTo("#main");
  $("#sizechoice").css("margin-bottom", "0px");

  for (let i = 0; i < board_size; i++) {
    for (let j = 0; j < board_size; j++) {
      let newImg = document.createElement("img");
      $(newImg).attr("id", "" + j + i + "0"); //i,j are coordinates, the last bit is the state. -1 for O's, 0 for empty, and 1 for X's
      $(newImg).attr("class", "cell");
      $(newImg).attr("src", cellimage);

      $(newImg).click(() => select($(newImg).attr("id")));

      $("#gameboard").append(newImg);
    }
    $("#gameboard").append(document.createElement("br"));
  }
}

function select(cell) {
  let move = cell.substr(0, 2);
  let status = cell[2];
  $("#" + cell).attr("src", ximage);

  $.post(
    url +
      "?data=" +
      JSON.stringify({
        move: move,
        size: board_size,
        win: win,
        move_num:move_num
      }),
    response
  );
  move_num++;
}

function response(data, status) {
  let res = JSON.parse(data);
  if (res["server_move"] == "err") {
    alert("Please click an empty square");
    return;
  }

  $("#" + res["server_move"] + "0").attr("src", omage);
  console.log("WINNER : " + res["winner"]);
  if (res["winner"] == "tie") {
    alert("Tie!");
  } else if (res["winner"] == "player") {
    alert("Player Wins");
  } else if (res["winner"] == "server") {
    alert("Server Wins");
  }
}

function changeTheme1() {
  document.getElementById('stylesheet').href='basic.css';
  cellimage = "images/square.jpg";
  ximage = "images/x.jpg"
  omage = "images/o.jpg"
}

function changeTheme2() {
  document.getElementById('stylesheet').href='christmas.css';
  cellimage = "images/christmassquare.png";
  ximage = "images/christmasx.png"
  omage = "images/christmaso.png"
}

function changeTheme3() {
  document.getElementById('stylesheet').href='halloween.css';
  cellimage = "images/spookysquare.png";
  ximage = "images/spookyx.png"
  omage = "images/spookyo.png"
}
