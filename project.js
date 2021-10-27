function problem_15() {
  
   var outputObj=document.getElementById("output");
 
   var num = parseInt(prompt("Please enter a number: ", ""));
 
   outputObj.innerHTML="number: " + num + "<br><br>";

   var a = 1
   var b = 0
  
  for (i = 0; i < num; i++) {
    if (num - i == 1) {
      outputObj.innerHTML=outputObj.innerHTML + b;
    }
    else {
      outputObj.innerHTML=outputObj.innerHTML + b + ', '
    }
    b = a + b;
    a = b - a
  }
 
   outputObj.innerHTML=outputObj.innerHTML+"<br><br>"+"program ended";
   document.getElementsByTagName("button")[0].setAttribute("disabled","true");
 }

 function SizeChoice() {
  var size = parseInt(prompt("Please enter your number N to generate an NxN Tic Tac Toe field: ", ""));
  var field = ['-' * size] * size
  var square = document.createElement('img')
  square.src = 'square.png'
  square.id = 'square'
  var src = document.getElementById('field')
  document.getElementById('field').style='display: block'

  for (i = 0; i < size; i++) {
    for (j = 0; j < size; j++) {
      src.appendChild(square.cloneNode(true))
    }
    src.innerHTML += '<br>'
  }
  src.innerHTML += '<br>'
 }