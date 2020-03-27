import { Pane } from "https://lively-kernel.org/lively4/BP2019RH1/prototypes/display-exploration/pane.js";

export class Diagram {
  constructor(div, pointWidth, data) {
    this.div = div;
    this.pointWidth = pointWidth;
    this.initialData = data;
    this.canvasDimensions = {};
    this.panes = [];
    this.addButton = <button>Add subsequent Pane</button>;
    this.colorMap = this.getColorMap();

    this.initialize();
  }

  initialize() {
    this.div.style.overflow = "auto";
    this.addButton.style.margin = "0 auto";
    this.addButton.style.display = "table";

    this.canvasDimensions = {
      "width": this.div.getBoundingClientRect().width,
      "height": this.div.getBoundingClientRect().height
    };

    this.div.appendChild(<br></br>);

    this.addButton.addEventListener("click", () => {
      this.addNewPane();
    });
    this.div.appendChild(this.addButton);
  }

  addNewPane() {
    this.div.removeChild(this.addButton);

    let newDiv = <div></div>;
    newDiv.style.width = this.canvasDimensions.width * 0.90 + "px";
    newDiv.style.height = this.canvasDimensions.height * 0.40 + "px";
    newDiv.style.border = "1px solid black";
    newDiv.style.margin = "0 auto";
    newDiv.style.display = "table";
    this.div.appendChild(newDiv);
    this.div.appendChild(<br></br>);

    let data;
    if (this.panes.length == 0) {
      data = this.initialData;
    } else {
      data = this.panes[this.panes.length - 1].getData();
    }

    let pane = new Pane(newDiv, this.pointWidth, data, this.colorMap);
    pane.setDiagram(this);

    if (this.panes.length != 0) {
      pane.setParent(this.panes[this.panes.length - 1]);
      this.panes[this.panes.length - 1].addChild(pane);
      this.panes[this.panes.length - 1].updateChildren();
    }

    this.panes.push(pane);

    this.div.appendChild(this.addButton);
  }

  removePane(pane) {
    this.div.removeChild(pane.getDiv());
    this.panes.splice(this.panes.indexOf(pane), 1);
  }

  getColorMap() {
    return {
      "10": "#17b18e",
      "11": "#db3328",
      "12": "#9137eb",
      "13": "#d2f0f4",
      "14": "#96efdc",
      "15": "#631518",
      "16": "#23d70a",
      "17": "#1f641b",
      "18": "#645f7b",
      "19": "#6e09d1",
      "20": "#791584",
      "21": "#da92d1",
      "22": "#8e764a",
      "23": "#4fbb6a",
      "24": "#9213af",
      "25": "#2ea945",
      "26": "#6c081e",
      "27": "#60fb34",
      "28": "#01e510",
      "29": "#bdbcdf",
      "30": "#44dd28",
      "31": "#b82c65",
      "32": "#971512",
      "33": "#735dab",
      "34": "#e7b06c",
      "35": "#57d163",
      "36": "#fee395",
      "37": "#00b5ac",
      "38": "#85c737",
      "39": "#f97f4a",
      "40": "#8edd44",
      "41": "#0ab218",
      "42": "#8bc9ed",
      "43": "#1a0bef",
      "44": "#59f4d3",
      "45": "#7cafeb",
      "46": "#9ff095",
      "47": "#2b5c31",
      "48": "#f731a4",
      "49": "#ac8830",
      "50": "#c4dca5",
      "51": "#9b8a40",
      "52": "#098c77",
      "53": "#0d4469",
      "54": "#d48b41",
      "55": "#491539",
      "56": "#960c87",
      "57": "#33d76e",
      "58": "#b8ed5a",
      "59": "#c5fbf3",
      "60": "#2339e8",
      "61": "#8fd3e4",
      "62": "#807aec",
      "63": "#d604ab",
      "64": "#54fc64",
      "65": "#ff9d03",
      "66": "#0deb19",
      "67": "#44e46e",
      "68": "#420fa9",
      "69": "#650be2",
      "70": "#5c3df7",
      "71": "#159298",
      "72": "#feed28",
      "75": "#1455eb",
      "76": "#074a6e",
      "77": "#dc1e35",
      "78": "#3456fe",
      "80": "#dc84a3",
      "82": "#3b51be",
      "84": "#fe3ee7",
      "85": "#0d2cf1",
      "88": "#73a676",
      "89": "#20cbb4",
      "90": "#46b378",
      "94": "#b909b4",
      "95": "#ecd1d6",
      "96": "#829747",
      "98": "#dc257c",
      "99": "#0e3a15",
      "NC": "#937933",
      "male": "#da63e2",
      "NA": "#0b2c8d",
      "mogadishu": "#7b7149",
      "banadir": "#2c4e03",
      "scz": "#313811",
      "STOP": "#dc3df6",
      "mudug": "#e6372c",
      "galmudug": "#41463c",
      "female": "#9c0576",
      "galgaduud": "#388c63",
      "dhuusamarreeb": "#b06d8d",
      "belet xaawo": "#c5dc1a",
      "gedo": "#98753e",
      "jubbaland": "#c4d134",
      "gebiley": "#1bb26b",
      "woqooyi galbeed": "#dbb4a1",
      "somaliland": "#b6cd6b",
      "nwz": "#693a66",
      "kismayo": "#42d34f",
      "lower juba": "#4d6500",
      "garbahaarey": "#782ff2",
      "hargeysa": "#2b89fe",
      "belet weyne": "#077e39",
      "hiraan": "#437043",
      "hir-shabelle": "#6dd2f4",
      "baidoa": "#68e7c6",
      "bay": "#847664",
      "south west state": "#4d0e2f",
      "qansax dheere": "#0c7b63",
      "cadale": "#eee4a6",
      "middle shabelle": "#87b67a",
      "bossaso": "#9f76ea",
      "bari": "#dd4516",
      "puntland": "#8409b0",
      "nez": "#cc50eb",
      "gaalkacyo": "#741f3c",
      "question": "#30cc35",
      "jowhar": "#09aea2",
      "bulo burto": "#f8f747",
      "CE": "#f5f8e7",
      "bu'aale": "#dab0cc",
      "middle juba": "#bc5efd",
      "balcad": "#14d354",
      "qardho": "#b0ecb3",
      "afmadow": "#204985",
      "cadaado": "#947b36",
      "sanaag": "#6d120d",
      "ceerigaabo": "#31a155",
      "cabudwaaq": "#29cc80",
      "hobyo": "#d06f68",
      "showtime_question": "#92f7dc",
      "burtinle": "#8819f3",
      "nugaal": "#73fa88",
      "eyl": "#ca846f",
      "luuq": "#308467",
      "baardheere": "#908bfa",
      "lasqooray": "#f10b79",
      "afgooye": "#9d1a84",
      "lower shabelle": "#92660e",
      "garowe": "#8f7bda",
      "burco": "#fdfebe",
      "togdheer": "#a6ff01",
      "berbera": "#fb6f0c",
      "caynabo": "#d05d49",
      "sool": "#0826b0",
      "buuhoodle": "#fda74b",
      "ceel buur": "#05b3ac",
      "galdogob": "#de28d8",
      "owdweyne": "#85214a",
      "jalalaqsi": "#c4cd18",
      "qandala": "#8a25a5",
      "ceel dheer": "#e805b6",
      "marka": "#e1f62c",
      "ceel waaq": "#128f22",
      "WS": "#33c65b",
      "taleex": "#4d2198",
      "push_back": "#e51234",
      "NR": "#493ba9",
      "xarardheere": "#d9ed36",
      "buur hakaba": "#37bd09",
      "xudur": "#4c4fbc",
      "bakool": "#0276e8",
      "baraawe": "#504916",
      "borama": "#01c2aa",
      "awdal": "#c583d6",
      "jariiban": "#163939",
      "ceel afweyn": "#fba893",
      "diinsoor": "#af2707",
      "laas caanood": "#e5291a",
      "jilib": "#53c0b2",
      "waajid": "#d17380",
      "doolow": "#9576e6",
      "tayeeglow": "#2a7350",
      "bandarbayla": "#86e65b",
      "sablaale": "#66e00b",
      "iskushuban": "#7ee344",
      "baki": "#af698f",
      "greeting": "#6f8315",
      "qoryooley": "#c9555e",
      "xudun": "#931018",
      "zeylac": "#100605",
      "adan yabaal": "#012652",
      "sheikh": "#f257d1",
      "wanla weyn": "#70e1bd",
      "badhaadhe": "#cdbd0e",
      "caluula": "#530477",
      "jamaame": "#205c97",
      "default": "#59105e"
    };
  }
}