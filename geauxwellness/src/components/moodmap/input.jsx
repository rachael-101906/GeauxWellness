import { db } from "./firebase.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const moodWeights = {

happy: 3,
sad: 4,
angry: 6,
anxious: 5,
hungry: 3,
flirty: 2

};

document.getElementById("submitMood")
.addEventListener("click",submitMood);

function submitMood(){

let mood =
document.getElementById("moodSelect").value;

if(!mood){
alert("Select a mood");
return;
}

navigator.geolocation.getCurrentPosition(async(pos)=>{

let lat = pos.coords.latitude;
let lng = pos.coords.longitude;

await addDoc(collection(db,"moods"),{

mood:mood,
lat:lat,
lng:lng,
weight:moodWeights[mood],
time:new Date()

});

});

}