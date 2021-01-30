var config    = require('config');
var axios     = require('axios');
var moment    = require('moment');

const twilioClient = require('twilio')(config.get('twilioAccountSid'), config.get('twilioAuthToken'));
var lastAlertDate = null;

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
          var slotsAvailable = (response.data.total > 0 || response.data.next_slot);
          if (slotsAvailable) {
            console.log(response.data);
          }
        }
        let logMessage = 'Centre ' + (i+1);
        if (centerName) { logMessage += ' (' + centerName + ')'; }
        logMessage += ' : ' + (slotsAvailable ? 'CRÉNEAUX DISPONIBLES' : 'pas de créneau');
        console.log(logMessage);

        if (slotsAvailable) {
          if (lastAlertDate == null || lastAlertDate < moment().subtract(120, 'seconds')) {
            // Send message (every 120 seconds only to limit spamming in case of short polling time)

            lastAlertDate = new moment();
            let promise = twilioClient.messages.create({
              from: config.get('twilioFromNumber'),
              to: config.get('toNumber'),
              body: logMessage
            })
            .then(function(message) {
              console.log('SMS sent');
            })
            .catch((error) => {
              console.error(error);
            });

          } else {
            console.log('No message sent');
          }
        }

      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });

  }

}