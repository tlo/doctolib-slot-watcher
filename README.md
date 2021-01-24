# doctolib-slot-watcher
__Check for Doctolib slot availabilities and send SMS__

Ce script vérifie toutes les x minutes si des centres de vaccination Covid-19 parmi une liste proposent de nouveaux créneaux, et envoie un SMS via le service Twilio si c'est la cas.

## Configuration
Editer le fichier :
```
./config/default.json
```

Pour obtenir les URLs Doctolib : 
* Aller sur la page du centre de vaccination souhaité, ex : 
https://www.doctolib.fr/centre-de-vaccinations-internationales/nantes/centre-de-vaccination-salle-festive-nantes-erdre?highlight%5Bagenda_ids%5D%5B%5D=410714&highlight%5Bagenda_ids%5D%5B%5D=410715&highlight%5Bagenda_ids%5D%5B%5D=410716
* F12, Network, filtre sur XHR
* Choisir le motif de consultation à droite
* Obtenir l'appel effectué en https://partners.doctolib.fr/availabilities.json...

## Lancement
```
node app.js
```