  function SizeChoice() {
  var size = parseInt(prompt("Please enter your number N to generate an NxN Tic Tac Toe field: ", ""));
  var field = ['-' * size] * size;
  var square = document.createElement('img');
  square.src = 'square.png';
  square.id = 'square';
  square.class = 'square';
  var src = document.getElementById('field');
  document.getElementById('field').style='display: block';

  for (i = 0; i < size; i++) {
    for (j = 0; j < size; j++) {
      src.appendChild(square.cloneNode(true));
    }
    src.innerHTML += '<br>';
  }
  src.innerHTML += '<br>';
 }
