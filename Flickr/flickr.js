	//array of strings for tag
	//not used now but was using at the start
	//--------------------------------------------------------------------------
	var tag = new Array();
	var tagString = "";
	var num = 1;
	//--------------------------------------------------------------------------
	//variable to had,e the amount of calls we make to flickr so we can limit the 
	//amount of js added to our head. We do not limit the first two search
	//but we do for every subsequent search
	var flickrCallCount = 0;
	//the number of images to load from flickr
	var imagesToLoadFromFlickr = 15;
	//initialise the flickr search array
	var flickrSearch = new Array();
	//the last added script src to the head for flickr
	//The code for the api adds multiple scripts to the head.
	//we need to limit this to make sure our search is using the latest
	//script as per the users choices
	var lastAddedHeadScript = null;
	//the amount of images returned from flickr
	var imageCount = 0;
	//the current selected image
	var currentImage = 0;
	//called when page loads. 
	//need to handle the click events for each element
	function setupClicks(){
		//setup the button -- div styled to look like a button
		var button = document.getElementById('findButton');
		var left = document.getElementById('left');
		var right = document.getElementById('right');
		//setup up click function for button to get pics
		button.onclick = function(){
									getPics();
								};
		left.onclick = function(){
									moveSlide(1);
								};
		right.onclick = function(){
									moveSlide(2);
								};
	}
	//handles click of images
	//only allows move if not selected image
	function changeImage(val){
		//move from the right to left
		if(val>currentImage){
			moveSlide(1);
		}
		else{//move from the left to right
			moveSlide(2);
		}
	}
	//handling moving of the innerDiv slideshow
	function moveSlide(val){		
		switch(val){
					//if we get to the first image we cannot move left
			case 1: if(currentImage < (imageCount-1)){//yes we can move the images to the left
						moveLeft();
						currentImage++;
					}
					break;
					//if we get to the last image we cannot move right
			case 2: if(currentImage > 0){//yes we can move the images to the right
						moveRight();
						currentImage--;
					}
					break;
		}	
		//handling the image displayed in middle of outerDiv
		setupImage();
	}
	//jquery to move images to the left
	//minus percentage pushes to the left
	function moveLeft(){
		$('#innerDiv').animate({"left": "-=33%"}, "fast");
	}
	//jquery to move images to the right
	//plus percentage pushes to the right
	function moveRight(){
		$('#innerDiv').animate({"left": "+=33%"}, "fast");
	}
	//setup the image opacity ect by adding/removing classes
	function setupImage(){
		//get all the images into an array
		var images = document.getElementsByName("myImages");
		//this will be our image src for the selected image
		var displayImage = "";
		for(var i = 0; i < images.length;i++){
			//looping through the images to match i==selectedImage
			//if we have the current image we remove the fade class and add the show class to 
			//increase the opacity
			if(currentImage == i){
				removeClass(images[i],"fade");
				addClass(images[i],"show");
				//set our displayImage to be the src of the selectedImage
				displayImage = images[i].src;
			}
			else{
				//remove the show class and add the fade class
				removeClass(images[i],"show");
				addClass(images[i],"fade");				
			}
		}
		//get access to our displayDiv
		var displayDiv = document.getElementById("displayImage");
		//add the css class to style the display image
		addClass(displayDiv,"imageToDisplay");
		//set the backgroun image of our div to be the selected image src
		displayDiv.style.backgroundImage = "url("+displayImage+")";		
	}
	//adds tag 
	function addTag(){
		tagField = document.getElementById('tagDiv');
		tagField.innerHTML += '<div id = "divTag' + num + '"><input type="text" id="tag'+num+'" name="tag"/>' + "   "
		+ '<input type = "button" value = "-"  onClick = "removeTag(this)";>' + '<br /></div>';
		num++;
	}
	//remove tag
	function removeTag(tagNum){
		tagDiv.removeChild(tagNum.parentNode);
	}
	//get all the tag values into a string
	function getTags() {
		tagString = "";
		var tags = document.getElementsByName('tag');
				
		for(i=0;i<tags.length;i++)
		{
			if(tags[i].value !== "" && tags[i].value != null){
				if(i>0){
					tagString += ",";
				}
				tagString += tags[i].value;
			}
		}
		
		return tagString;
	}	
	//check if element has class
	//gotten from stackoverflow
	function hasClass(ele,cls) {
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	}
	//adds class to element if it hasn't already been added
	function addClass(ele,cls) {
		if (!this.hasClass(ele,cls)) ele.className += " "+cls;
	}
	//removes class from element if it exists
	function removeClass(ele,cls) {
		if (hasClass(ele,cls)) {
			var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
			ele.className=ele.className.replace(reg,' ');
		}
	}
	//get the images from flickr
	function getPics(){	 
		//reset selected image
		currentImage = 0;
		//reset html
		document.getElementById("innerDiv").innerHTML = "";
		//adds teh loading image to our button div
		addClass(document.getElementById('displayImage'),"loading");
		//remove classes from display div to clear out old images
		var displayDiv = document.getElementById("displayImage");
		removeClass(displayDiv,"imageToDisplay");
		displayDiv.style.backgroundImage = "";
		//this api adds a script to the head of our html,
		//we want to remove this to make sure our current search is the only one sent.
		if(flickrCallCount>1){
			removeScriptFromHead();
		}
		
		var request = "https://www.flickr.com/services/rest/?";
		var tags = getTags();
		//if no text entered into the tags
		if(tags==""){
			alert("Please enter a search item");
		}
		else{
			flickrCallCount++;
			document.getElementById('findButton').innerHTML = "";
			document.getElementById('findButton').className = "loading";
			newScript = document.createElement('script');			
			request += "method=flickr.photos.search";
			request += "&per_page="+imagesToLoadFromFlickr;			//number of images to load as decalred at the top of file
			request += "&api_key=e61cb711d646f4fbdf943c2d3d1ffbcb"; //The API key, without it flickr disables access for our requests
			request += "&tags="+tags;								//the users selected search items
			request += "&tag_mode=all";								//Get all images
			request += "&format=json";								//format returned is JSON array
			newScript.setAttribute('src',request);					//Build the src element to append to the head
			lastAddedHeadScript = newScript;						//set the last added scr element so we can remove on a new search
			document.getElementsByTagName('head')[0].appendChild(newScript); //append script to the head
		}	
	}
	//the flickr api to output the images to the page.
	function jsonFlickrApi(images){
		var newStr = "";
		if(images.photos.photo.length>0){
			imageCount = images.photos.photo.length;
			for (i = 0; i < images.photos.photo.length; i++ )
			{
				//get out url for the images from flickr
				//---------------------------------------------------------------------
				url = "https://farm" + images.photos.photo[i].farm ;
			 
				url += ".static.flickr.com/" ;
			 
				url += images.photos.photo[i].server + "/";
			 
				url += images.photos.photo[i].id + "_";
			 
				url += images.photos.photo[i].secret;
				url += "_s.jpg"
				//---------------------------------------------------------------------
				//if the images are just loading, the first image should appear in the middle
				if(i==0){
					newStr += " <img class = \"images show\" id=\"image"+(i+1)+"\" onclick=\"changeImage("+(1+i)+");\" name=\"myImages\" src = " + url + "> "; 
				}else{					
					newStr += " <img class = \"images fade\" id=\"image"+(i+1)+"\" onclick=\"changeImage("+(1+i)+");\" name=\"myImages\" src = " + url + "> "; 
				}
			}
			setupImage();
		}
		//if no images returned show error message
		if(newStr.length <1){
			document.getElementById('innerDiv').innerHTML = "Please refine your criteria";
		}
		else{
			document.getElementById('innerDiv').innerHTML = newStr;
		}
		
		document.getElementById('findButton').innerHTML = "Find Images";
		removeClass(document.getElementById('findButton'),"loading");
		removeClass(document.getElementById('displayImage'),"loading");
		setupImage();
	}
	//removes the last added script from the head if 
	//more than 1 search has been initiated
	function removeScriptFromHead(){
		document.getElementsByTagName('head')[0].removeChild(lastAddedHeadScript);
	}
	