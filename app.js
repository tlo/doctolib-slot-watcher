var config    = require('config');
var axios     = require('axios');
var moment    = require('moment');

const twilioClient = require('twilio')(config.get('twilioAccountSid'), config.get('twilioAuthToken'));


checkForSlot();
setInterval(function() {
  checkForSlot();
}, config.get('checkInterval') * 1000);


function checkForSlot() {

  let doctolibUrls = config.get('doctolibUrls');

  let now = new moment();
  console.log(now.format("HH:mm:ss") + ' : vérification disponibilités pour ' + doctolibUrls.length + ' centre(s)');
  for (let i = 0; i < doctolibUrls.length; i++) { 

    axios.get(doctolibUrls[i].replace('#DATE#', now.format("YYYY-MM-DD")))
      .then(function (response) {
        // handle success

        if (doctolibUrls[i].indexOf('/booking/') != -1) {
          // For URLs of type https://partners.doctolib.fr/booking/...
          let responseData = response.data.data;
          var centerName = responseData.profile.name_with_title_and_determiner;
          var slotsAvailable = !responseData.agendas[0].booking_disabled;
        } else {
          // For URLs of type https://partners.doctolib.fr/availabilities.json...
          var slotsAvailable = (response.data.availabilities.length > 0);
        }
        let logMessage = 'Centre ' + (i+1);
        if (centerName) { logMessage += ' (' + centerName + ')'; }
        logMessage += ' : ' + (slotsAvailable ? 'CRÉNEAUX DISPONIBLES' : 'pas de créneau');
        console.log(logMessage);

        if (slotsAvailable) {
          // Send message
          let promise = twilioClient.messages.create({
            from: config.get('twilioFromNumber'),
            to: config.get('toNumber'),
            body: logMessage
          })
          .then(function(message) {
            console.log('Message sent');
          })
          .catch((error) => {
            console.error(error);
          });
        }

      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });

  }

}