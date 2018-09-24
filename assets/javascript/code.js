// Initialize Firebase
var config = {
  apiKey: "AIzaSyDwZZ7dVpjMt_9khpta_Dqqe2VZXb0nWBM",
  authDomain: "trainscheduler-megross.firebaseapp.com",
  databaseURL: "https://trainscheduler-megross.firebaseio.com",
  projectId: "trainscheduler-megross",
  storageBucket: "trainscheduler-megross.appspot.com",
  messagingSenderId: "351105723614"
};
firebase.initializeApp(config);
const database = firebase.database();
const trainRef = database.ref('Trains/'); //primary location for trains to allow for further db expansion

//global variable to set if input form is a new submission or edit
let isEdit = false;
let currentKey = "";


//set listener on submit to validate form and write to firebase
$("#submit-btn").on("click",function(event){
  event.preventDefault();
  console.log('submitting...');
  //set local variables to input values for validation


  const trainName = $("#train-name").val().trim();
  const destination = $("#destination").val().trim();
  const firstTrainTime = $("#first-train-time").val().trim();
  const frequency = $("#frequency").val().trim();

    //TODO learn regex for validation of firstTrainTime
  const postData = {
    trainName,
    destination,
    firstTrainTime,
    frequency
  };
  if(isEdit = false) {
    trainRef.push(postData);
  }
  else {
    database.ref(`Trains/${currentKey}`).set(postData)
  }
  // $(".input-field").reset();
});

const WriteSchedule = function(snapshot) {
  $("#trainSchedule").empty();
  snapshot.forEach(function (childSnapshot) {
    const childKey = childSnapshot.key;
    const childData = childSnapshot.val();
    createRow(childKey, childData.trainName, childData.destination, childData.frequency, childData.firstTrainTime);
  });
  $(document).on("click",".edit", editRecord);
  $(document).on("click",".delete", deleteRecord)
};

trainRef.on('value', WriteSchedule);
setInterval(function(){trainRef.once('value', WriteSchedule)}, 60000);

const editRecord = function(event) {
  isEdit = true;
  currentKey = event.target.dataset.id;
  console.log(currentKey);
  database.ref('Trains/'+currentKey).once('value',function(snapshot) {
    console.log(snapshot.val());
    $("#train-name").val(snapshot.val().trainName);
    $("#destination").val(snapshot.val().destination);
    $("#first-train-time").val(snapshot.val().firstTrainTime);
    $("#frequency").val(snapshot.val().frequency);
    M.updateTextFields();
  });
  $("#submit-btn").text('Save Edit')
};

const deleteRecord = function(event) {
  console.log(event.target.dataset.id)
};


const nextTrainTime = function(firstTime, frequency) {
  const startTime = moment(firstTime, "HH:mm");
  const now = moment();
  if(now.isBefore(startTime)) {
    return startTime;
  }
  else {
    let nextStep = startTime;
    while (nextStep.isBefore(now)){
      nextStep.add(frequency, 'm')
    }
    return nextStep
  }
};

//function to create a table row
const createRow = function(key, trainName, destination, frequency, firstTrainTime) {
  const nextArrival = nextTrainTime(firstTrainTime, frequency);
  const minutesAway = nextArrival.fromNow();
  const newRow = $(`<tr>
  
<th>${trainName}</th>
<th>${destination}</th>
<th>${frequency}</th>
<th>${nextArrival.format("h:mm A")}</th>
<th>${minutesAway}</th>
<th><i class="material-icons icon edit" title="edit" data-id="${key}">edit</i>
<i class="material-icons icon delete" title="delete" data-id="${key}">delete</i></th>`);

  $("#trainSchedule").append(newRow)
};