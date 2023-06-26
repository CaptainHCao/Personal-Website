function changeBg1(){
	document.getElementById('text-card1').innerHTML = "Hiep Cao / Kevin<br>SWE/CS<br>Miami University<br>Game Developer<br>Anime";
	document.body.style.animation =  "changeBg1 2s forwards";
        document.getElementById('text-card1').style.animation =  "changeText1 2s forwards";
}
function returnBg1(){ 
	document.getElementById('text-card1').innerHTML = "About me";
        document.body.style.animation =  "returnBg1 2s forwards";
        document.getElementById('text-card1').style.animation =  "returnText1 2s forwards";

}
function changeBg2(){
	document.getElementById('text-card2').innerHTML = "Made with:<br>&nbspHTML<br>&nbspCSS<br>&nbspJavaScript<br>&nbspBootstrap<br>&nbspJQuery<br>&nbspAjax<br>&nbspTomTom API";
        document.body.style.animation =  "changeBg2 2s forwards";
        document.getElementById('text-card2').style.animation =  "changeText2 2s forwards";
}
function returnBg2(){
	document.getElementById('text-card2').innerHTML = "About this project";
        document.body.style.animation =  "returnBg2 2s forwards";
        document.getElementById('text-card2').style.animation =  "returnText2 2s forwards";
}

