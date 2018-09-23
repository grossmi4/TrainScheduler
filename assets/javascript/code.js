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


//set listener on submit to validate form and write to firebase
$("#submit-btn").on("click",function(event){
  event.preventDefault();
  console.log('submitting...');
  //set local variables to input values for validation
  const trainName = $("#train-name").val().trim();
  const destination = $("#destination").val().trim();
  const firstTrainTime = $("#first-train-time").val().trim();
  const frequency = $("#frequency").val().trim();

  //validations

  //write to database
  trainRef.push({
    trainName,
    destination,
    firstTrainTime,
    frequency
  });
});

//logic to run on database change to return full list and recreate schedule table
trainRef.on('value', function(snapshot) {
  console.log(snapshot);
  snapshot.forEach(function(childSnapshot) {
    const childKey = childSnapshot.key;
    const childData = childSnapshot.val();
    createRow(childKey, childData.trainName,childData.destination, childData.frequency, childData.firstTrainTime);
  })
});

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
  const newRow = $(`<tr id=key>
  
<th>${trainName}</th>
<th>${destination}</th>
<th>${frequency}</th>
<th>${nextArrival.format("h:mm A")}</th>
<th>${minutesAway}</th>`);

  $("#trainSchedule").append(newRow)
};