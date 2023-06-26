var routingURL="https://api.tomtom.com/routing/1/calculateRoute/";
var geocodeURL="https://api.tomtom.com/search/2/search/";
var mapURL="https://api.tomtom.com/map/1/staticimage";
//var phpURL="http://localhost:8080/final.php?"
var phpURL="http://172.17.12.195/final.php?"
var key = "2bs0CPcqLFWpbu9I6lyyZhJk6kVIfF9i"
var startAddressURL;
var endAddressURL;
var startLong;
var startLat;
var endLong;
var endLad; 
var instructionsType = "text";
var routeType;
var travelMode;
var hilliness;
var isThrilling = false;
var imgFormat = 'png';
var zoom = 12;
var width = 512;
var height = 512;
var request;
var response;
var startLocation;
var endLocation;
var isValid = true;
$(document).ready(function() {
	$("#hillinessGroup").hide();
	$("#thrilling").click(function(){
		isThrilling = true;
		$("#hillinessGroup").show();
	});
	$("#fastest, #shortest, #eco").click(function(){
		isThrilling = false;
                $("#hillinessGroup").hide();
        });
	$("#submit").click(function(){
	validate();
	if ($("#startingAddress").val() === "" || $("#endingAddress").val() === "") isValid = false;
	else isValid = true
	if(isValid) {
		startLocation = $("#startingAddress").val();
		endLocation = $("#endingAddress").val();
		startAddressURL = encodeURIComponent(startLocation);
		endAddressURL = encodeURIComponent(endLocation);
		routeType = $('input[name="routeType"]:checked').val();
                travelMode = $("#mode").children("option:selected").val();

		a=$.ajax({
			url: geocodeURL + startAddressURL + ".json?minFuzzyLevel=1&maxFuzzyLevel=2&view=Unified&relatedPois=off" + "&key=" + key,
			method: "GET" 
		}).done(function(data) {
			if (data.results.length != 0) {
				startLong = data.results[0].position.lon;
				startLat = data.results[0].position.lat;
			}
			a=$.ajax({
                        	url: geocodeURL + endAddressURL + ".json?minFuzzyLevel=1&maxFuzzyLevel=2&view=Unified&relatedPois=off" + "&key=" + key,
                        	method: "GET"
                	}).done(function(data2) {
                        	if (data2.results.length != 0) {
                                	endLong = data2.results[0].position.lon;
                                	endLat = data2.results[0].position.lat;
                        	}
				let fullURL = routingURL + startLat + "%2C" + startLong + "%3A" + endLat + "%2C" + endLong + "/json?" + "instructionsType=" + instructionsType + "&routeType=" + routeType
		                                + "&travelMode=" + travelMode + "&key=" + key;
                		if (isThrilling) {
                        		hilliness = $('input[name="hilliness"]:checked').val();
                        		fullURL += "&hilliness=" + hilliness;
                		}
                		a=$.ajax({
                        		url: fullURL,
                        		method: "GET"
                		}).done(function(data3) {
                        		//do something
					$("#result").html("");
					let instructionID = 0;
					$("#result").append('<div class="row line" id="summary"></div>');
					$("#summary").html("<h1>Route Information: </h2><br><p>Distance: " + 
						data3.routes[0].summary.lengthInMeters + " meters</p><br><p>Expected Travel Time: " + data3.routes[0].summary.travelTimeInSeconds +
						" seconds</p><br><p>Expected Traffic Delay: " + data3.routes[0].summary.trafficDelayInSeconds + " seconds</p><br>"); 
					data3.routes[0].guidance.instructions.forEach((instruction) => {
						instructionID++;  
						$("#result").append('<div class="row line" id=line' + instructionID + '></div>');
						$("#line"+instructionID).append('<div class="col-md-8" id=text' + instructionID +'></div>');
						$("#line"+instructionID).append('<div class="col-md-3" id=map' + instructionID +'></div>');
						$("#text"+instructionID).append("<h2>" + instruction.message + "</h2><br><p>Distance traveled: " + instruction.routeOffsetInMeters + " meters</p><br>" +
  							"<p>Time traveled: " + instruction.travelTimeInSeconds + " seconds</p><br>");
						instructionMapURL = mapURL + "?layer=basic&style=main" + "&format=" + imgFormat + "&zoom=" + zoom + "&center=" + instruction.point.longitude + "%2C" + instruction.point.latitude + "&width=" + width
                                       			 + "&height=" + height + "&view=Unified" + "&key=" + key;
						$("#map"+instructionID).append('<img id=picture' + instructionID + ' alt=instruction' + instructionID + ' class="images"></img>');
                                                $("#picture"+instructionID).attr("src", instructionMapURL);
					});
					request = fullURL; 
					response = data3;
					setValue(startLocation, endLocation, request, response);
                		}).fail(function(error3) {
                        		//do something
					$("#result").html("");
					$("#result").append('<p>' + error3.responseJSON.detailedError.message + '</p>');
                		});
                	}).fail(function(error2) {
                        	//do something
                                console.log(error2);
			});
		}).fail(function(error) {
			//do something
			console.log(error);
		});
	}
	}); //onClick
function setValue(startLocation, endLocation, requestURL, response) {
	let location = {
		start: startLocation,
		end: endLocation, 
	};
	let value = { 
		request: requestURL, 
		response: JSON.stringify(response),
	};
	a=$.ajax({	
		url: phpURL,
                method: "POST",
		data: {
			method: "setLookUp",
			location: JSON.stringify(location),
			sensor: "web",
			value: JSON.stringify(value)
		}
	}).fail(function(error) {
		//do something
		console.log(error);
	});
}
//validation function
function validate() {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
		isValid = false;
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
}

}); //document.ready

