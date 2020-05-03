var divlogos = document.getElementById("logos")

var colors = ['red', 'green', 'blue', 'yellow', 'pink', 'purple'];
var currentIndex = 0;
setInterval(function () {
   divlogos.style.background = colors[currentIndex]
   if (!colors[currentIndex]) {
       currentIndex = 0;
   } else {
       currentIndex++;
   }
}, 500);
