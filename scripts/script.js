

var blockedPathMessages = ["The door is locked.","It's impossible to go through that.","You need to find the key."];

//the notification message shows the action result and some useful information
var helpMessages = ["What do you wanna do?","(Enter HELP to get action commands.)", 
			"You find nothing useful.","Nothing happenned.","You cannot do it here.",
			"You get book ashes.","You get notes ashes."];

//the message for the ending display.
var endingMessages=["You find yourself wake up in this house again.","Your own bedroom",
			"It was all a dream.","You find yourself wake up in your own bed."];

//the collection of all the items in the game

var allItems = ["Note 1","Living Room Key","Note 2","Match","Book","Candel","Note 3","Bedroom Key"]

/*
	All the objects are as such:
		name - the name of the room,
		img -  the corresponding image to display the area
		storyLines -  background of this room
		items -  the items contained in the room
		actions - the actions can be performed in the room
		resultActions - the result of performing the action
		requirement - the required item to enter the room
*/

var Bedroom = {
	name:"Bedroom",
	img:"img/bedroom.png",
	storyLines:["You wake up with a bad headache and have no idea of what happened.","This place is completely wasted."],
	items:[allItems[1],allItems[0],""],
	actions:["look around","open closet","go outside"],
	resultActions:["You find a key on the desk.","You find a note on the wall.",1],
	requirement:"Bedroom Key"
};

var Hallway = {
	name:"Hallway",
	img:"img/hallway.png",
	storyLines:["The hallway looks old.","But you can tell the shoes cabinet is new."],
	items:["",allItems[2],"","",""],
	actions:["check front door", "check shoe cabinet","go bathroom", "go living room", "go bedroom"],
	resultActions:[blockedPathMessages[0],"You found a Note inside",3,2,0],
	requirement:"None"
};

var LivingRoom={
	name:"Living Room",
	img:"img/living_room.png",
	storyLines:["This place is well decorated and warm.","The fireplace is still on."],
	items:["",allItems[3],allItems[4],"","",""],
	actions:["check coffee table", "check fireplace", "sit on the sofa","go backyard","go kitchen", "go hallway"],
	resultActions:[helpMessages[2],"You found a match.","You found the red book on the sofa.",5,4,1],
	requirement:"Living Room Key"
};

var Bathroom={
	name:"Bathroom",
	img:"img/bathroom.png",
	storyLines:["This place is cold and smells like dirt","It's pretty cold."],
	items:[allItems[5],"","",""],
	actions:["check window","check sink","check bathtub","go hallway"],
	resultActions:["You find a candel.","There is some burn ashes in the sink.", "There is some burn pages in the bathtub.",1],
	requirement:"None"
};

var Kitchen={
	name:"Kitchen",
	img:"img/kitchen.png",
	storyLines:["It smells like food here.","The stove is still warm."],
	items:[allItems[3],allItems[3],"",""],
	actions:["check stove","check drawers","check on the groud","go living room"],
	resultActions:["You found a match.","You found a match.",helpMessages[2],2],
	requirement:"None"
};

var Backyard={
	name:"Backyard",
	img:"img/backyard.png",
	storyLines:["The plants are dead","The air is heavy and it is misty around."],
	items:[allItems[6],allItems[7]],
	actions:["check tree","check bush", "check on the ground","go inside","climb fence"],
	resultActions:["You find another note.","You find another key.",helpMessages[2],2,blockedPathMessages[1]],
	requirement:"None"
};


var GoodEndingImg = "img/ending.png";
//the list of all the areas
var map = [Bedroom,Hallway,LivingRoom,Bathroom,Kitchen, Backyard];
var specialItems = ["notes ashes","book ashes"];
var specialActions=["burn notes","burn book","light candel","dump the notes ashes","dump the book ashes"];
//var sounds=[]
var inventory= [];
//the actions can be taken in the current state (based on the area and the inventory)
var actions=[];
//the special actions can be taken because of the combination of the items in the inventory
var specActions=new Set();
//the room index that the player is currently at
var roomNumber=0;

//the function to refresh the displayed information and actions

function render(){

	//update the UI
	document.getElementById("room_name").innerHTML = map[roomNumber].name;
	document.getElementById("room_img").src = map[roomNumber].img;
	document.getElementById("room_info").innerHTML = map[roomNumber].storyLines[0];
	document.getElementById("item_info").innerHTML = map[roomNumber].storyLines[1];
	document.getElementById("command_info").innerHTML = helpMessages[0]+helpMessages[1];
	document.getElementById("inventory").innerHTML = "Inventory: "+ inventory.join(", ");
	document.getElementById("input").value = "";
	document.getElementById("input").disabled = false;
	document.getElementById("enter").disabled  =false;
	//update the action list
	actions = Array.from(specActions).concat(map[roomNumber].actions);
	
}

//try to take an item and put into the list based on the action taken

function takeItem(actionInt){
	//the the action results in an item
	if(map[roomNumber].items[actionInt] !== ""){
		//update the inventory and update special actions
		inventory.push(map[roomNumber].items[actionInt]);
		document.getElementById("inventory").innerHTML = "Inventory: "+ inventory.join(", ");
		checkActions();
		map[roomNumber].items[actionInt]  = "";
		return true;
	}
	return false;

}

//update the specActions once a new item is added to the inventory

function checkActions(){
	
	//if the book or a note is in the inventory, there cannot be ashes (if burnt before) (memory loading issue)
	if(inventory.indexOf(allItems[4])!=-1){
		specActions.delete(specialActions[4]);
	}
	
	if(inventory.indexOf(allItems[0])!=-1){
		specActions.delete(specialActions[3]);
	}
	
	let matchExist = inventory.indexOf(allItems[3]);
	//no match no burn
	if(matchExist!==-1){
		
		let candelExist = inventory.indexOf(allItems[5]);
		let bookExist = inventory.indexOf(allItems[4]);
		let note1Exist = inventory.indexOf(allItems[0]);
		let note2Exist = inventory.indexOf(allItems[2]);
		let note3Exist = inventory.indexOf(allItems[6]);
		//if there is a match and a candel, we can light a candel
		if(candelExist!==-1){
			specActions.add(specialActions[2]);
		}
		//if there is a match and a book, we can burn the book
		if(bookExist!==-1){
			specActions.add(specialActions[1]);
		}
		//if there is a match and all the notes, we can burn the notes
		if(note1Exist !== -1 && note2Exist !== -1 && note3Exist !== -1){
			specActions.add(specialActions[0]);
		}
		//update the action list
		actions = Array.from(specActions).concat(map[roomNumber].actions);
	}
	
}

//manually use the items in the inventory for the story line 
//(key usages are automatic if exist in the inventory)

function useItem(action){
	
	//if the action is to burn notes, we update inventory and action list and same for the other options
	if(action==specialActions[0]){
		inventory.splice(inventory.indexOf(allItems[3]),1);
		inventory.splice(inventory.indexOf(allItems[0]),1);
		inventory.splice(inventory.indexOf(allItems[2]),1);
		inventory.splice(inventory.indexOf(allItems[6]),1);
		inventory.push(specialItems[0]);
		specActions.delete(specialActions[0]);
		specActions.delete(specialActions[1]);
		checkActions();
		specActions.add(specialActions[3]);
		actions = Array.from(specActions).concat(map[roomNumber].actions);
		document.getElementById("command_info").innerHTML = helpMessages[6]+" "+helpMessages[1];
		document.getElementById("inventory").innerHTML = "Inventory: "+ inventory.join(", ");
	}
	else if(action==specialActions[1]){
		inventory.splice(inventory.indexOf(allItems[3]),1);
		inventory.splice(inventory.indexOf(allItems[4]),1);
		inventory.push(specialItems[1]);
		specActions.delete(specialActions[0]);
		specActions.delete(specialActions[1]);
		checkActions();
		specActions.add(specialActions[4]);
		actions = Array.from(specActions).concat(map[roomNumber].actions);
		document.getElementById("command_info").innerHTML = helpMessages[5]+" "+helpMessages[1];
		document.getElementById("inventory").innerHTML = "Inventory: "+ inventory.join(", ");
	}
	else if(action==specialActions[2]){
		inventory.splice(inventory.indexOf(allItems[3]),1);
		document.getElementById("inventory").innerHTML = "Inventory: "+ inventory.join(", ");
	}
	else if(action==specialActions[3]){
		if(roomNumber==3){
			document.getElementById("command_info").innerHTML = helpMessages[3];
		}
		else if(roomNumber==5){
				alert(endingMessages[0]);
				location.reload(true);
		}
		else{
			document.getElementById("command_info").innerHTML = helpMessages[4];
		}
	}
	else if(action==specialActions[4]){
		if(roomNumber==3){
			document.getElementById("room_name").innerHTML = endingMessages[1];
			document.getElementById("room_info").innerHTML = endingMessages[2];
			document.getElementById("item_info").innerHTML = "";
			document.getElementById("command_info").innerHTML = "";
			document.getElementById("room_img").src  = GoodEndingImg;
			document.getElementById("input").disabled = true;
			document.getElementById("enter").disabled  =true;
			document.getElementById("inventory").innerHTML = "";
			alert(endingMessages[3]);
		}
		else if(roomNumber==5){
			document.getElementById("command_info").innerHTML = helpMessages[3];
		}
		else{
			document.getElementById("command_info").innerHTML = helpMessages[4];
		}
	}
	
}
//check if the room is locked
function checkLock(roomNum){
	if(inventory.indexOf(map[roomNum].requirement)!==-1 || map[roomNum].requirement=="None"){
		return true;
	}
	return false;
}

//load the game when the load button pressed
function loadGame(){
	roomNumber = localStorage.getItem("storeRoomNum");
	inventory = JSON.parse(localStorage.getItem("storeInventory"));
	let tmap = JSON.parse(localStorage.getItem("storeRooms"));
	//console.log(roomNumber);
	//console.log(inventory);
	//console.log(tmap);
	if(roomNumber==null){
		roomNumber = 0;
	}
	if(inventory==null){
		inventory=[];
	}
	if(tmap!=null){
		map = tmap;
	}
	checkActions();
	render();
}

//save the game state when the save button is pressed
function saveGame(){

	localStorage.setItem("storeRoomNum",roomNumber);
	localStorage.setItem("storeInventory",JSON.stringify(inventory));
	localStorage.setItem("storeRooms",JSON.stringify(map));
	
}

//run the action when the Enter button is pressed

function playGame(){
	
	let action = document.getElementById("input").value.trim();
	document.getElementById("input").value = "";
	let actionIndex = map[roomNumber].actions.indexOf(action);
	//if it is a special action (burn stuff), we do that
	if(specActions.has(action)){
		useItem(action);
	}
	//if the command is help or does not exist, we help
	else if(action == "HELP" || actionIndex==-1){
		document.getElementById("command_info").innerHTML = helpMessages[0]+" Available actions: "+actions.join(", ");
	}
	//else it is a legit action in the room
	else{
		//if the action takes an item
		let taken = takeItem(actionIndex);
		//get the result action of the action
		let result = map[roomNumber].resultActions[actionIndex];
		//check if it is entering a room, if the player has key, enter, otherwise, blocked
		if(Number.isInteger(result)){
			
			if(checkLock(result)){
				roomNumber = result;
				render();
			}
			else{
				document.getElementById("command_info").innerHTML = blockedPathMessages[0]+" "+blockedPathMessages[2];
			}
		}
		//otherwise, an item is taken, remove the item from the available list and continue.
		else{
			document.getElementById("command_info").innerHTML = result +" "+helpMessages[1];
			if(taken){
				map[roomNumber].resultActions[actionIndex] = helpMessages[2];
			}
		}
	}
	
}