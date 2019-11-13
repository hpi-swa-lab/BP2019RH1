# Today I learned

## 17.10.2019

- Javascript kann nicht automatisch zahlen-strings in ints umwandeln. 
  Bsp: "42"/42 wird nicht ausgeführt, wirft aber auch keinen Fehler. 
  Es gibt die Funktion parseInt(String text, int base), die einen String in einen int umwandelt.
  ```javascript
    let numberString = "42";
    let number = parseInt(numberString, 10);
  ```
  (Luc)
  
  
## 21.10.2019
- Um Bibliotheken über ein CDN einzubinden, kann die normale JS import function benutzt weren 
  ``` javascript
  import Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.js";
  
  ```
  (Simon)

- Um ganze Ordner zu löschen müssen diese in der Ansicht ausgeklappt sein (d.h. unter dem Ordnername alle innerhalb dieses  existierenden Datein stehen)
  (Leo)
  
- Jens hat uns unter home/doc/scripts/index.html ein paar Beispiele für Scripting in Lively zusammengehackt - theresa setzen

## 22.10.2019

- you can not only sync events but also reminders using our shared owncloud calendar - Leo

- if you want to change global css styles, you can do so in HOME/src/lively.css (or so), local style sheets can be used via <link href="url/sdf" rel="stylesheet" type="text/css" /> - Leo


## 24.10.2019

- zooming in and out (on Mac cmd + / cmd -) takes a while to master but makes for a far better workflow - Theresa

- Jens is searching for good options for behavior when minimizing a window - if you have ideas go talk to him - Theresa


