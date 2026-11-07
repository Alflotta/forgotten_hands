"use strict";

const PROFESSIONS = [
  {
    id: 1,
    name: "Knocker-up",
    drawer: "Light & Night",
    icon: "bi-alarm",
    image: "images/knocker-up.jpg",
    period: "19th – mid-20th century",
    from: 1800,
    vanished: 1950,
    where: "Britain, Ireland, Netherlands",
    replacedBy: "alarm clocks",
    description:
      "Walked the streets before dawn and tapped on bedroom windows with a long pole to wake workers for their shift.",
  },
  {
    id: 2,
    name: "Lamplighter",
    drawer: "Light & Night",
    icon: "bi-lightbulb",
    image: "images/lamplighter.jpg",
    period: "18th – early 20th century",
    from: 1700,
    vanished: 1930,
    where: "Britain, USA, Europe",
    replacedBy: "electric street lighting",
    description: "Lit, tended and put out gas street lamps by hand on a nightly round.",
  },
  {
    id: 3,
    name: "Human computer",
    drawer: "Science",
    icon: "bi-calculator",
    image: "images/human-computer.jpg",
    period: "19th – 20th century",
    from: 1830,
    vanished: 1970,
    where: "USA, Britain, research centers",
    replacedBy: "electronic computers and software",
    description:
      "Did long mathematical calculations by hand, in teams that checked each other's work.",
  },
  {
    id: 4,
    name: "Switchboard operator",
    drawer: "Communication & News",
    icon: "bi-telephone",
    image: "images/switchboard.jpg",
    period: "Late 19th – 20th century",
    from: 1878,
    vanished: 1970,
    where: "USA, Europe, Japan",
    replacedBy: "automatic exchanges",
    description: "Connected callers by plugging cords into the right sockets of a switchboard.",
  },
  {
    id: 5,
    name: "Ice cutter",
    drawer: "Home & Daily Life",
    icon: "bi-snow",
    image: "images/ice-cutter.jpg",
    period: "19th – early 20th century",
    from: 1800,
    vanished: 1930,
    where: "USA, Canada, Russia",
    replacedBy: "refrigerators",
    description: "Cut blocks of ice from frozen lakes and rivers in winter to stock icehouses.",
  },
  {
    id: 6,
    name: "Water carrier",
    drawer: "Transport & Water",
    icon: "bi-droplet",
    image: "images/water-carrier.jpg",
    period: "Antiquity – 19th/20th century",
    from: 1700,
    vanished: 1920,
    where: "Europe, Middle East, Asia, Africa",
    replacedBy: "piped water systems",
    description: "Hauled water from wells and rivers to people's homes, or sold it on the street.",
  },
  {
    id: 7,
    name: "Carriage driver",
    drawer: "Transport & Water",
    icon: "bi-car-front",
    image: "images/carriage-driver.jpg",
    period: "18th – early 20th century",
    from: 1700,
    vanished: 1915,
    where: "Russia, Europe, USA",
    replacedBy: "cars, trams and buses",
    description: "Drove hired horse carriages through city streets: the original taxi.",
  },
  {
    id: 8,
    name: "Linotype operator",
    drawer: "Communication & News",
    icon: "bi-printer",
    image: "images/linotype.jpg",
    period: "Late 19th century – 1980s",
    from: 1886,
    vanished: 1985,
    where: "USA, Britain, Europe",
    replacedBy: "phototypesetting and desktop publishing",
    description: "Typed on a machine that cast whole lines of newspaper text in hot metal.",
  },
  {
    id: 9,
    name: "Film projectionist",
    drawer: "Cinema",
    icon: "bi-film",
    image: "images/projectionist.jpg",
    period: "20th century – 2010s",
    from: 1900,
    vanished: 2012,
    where: "Cinemas worldwide",
    replacedBy: "digital projectors",
    description: "Loaded reels and kept the lamp bright and the picture sharp at every screening.",
  },
  {
    id: 10,
    name: "Silent-film pianist",
    drawer: "Cinema",
    icon: "bi-music-note-beamed",
    image: "images/pianist.jpg",
    period: "1890s – late 1920s",
    from: 1895,
    vanished: 1929,
    where: "USA, Europe",
    replacedBy: "recorded film sound",
    description: "Played live music as the silent film ran, giving each scene its mood.",
  },
];

function makeImage(profession, className) {
  const img = document.createElement("img");
  img.src = profession.image;
  img.alt = profession.name + ", historical photograph";
  img.loading = "lazy";
  if (className) img.className = className;
  return img;
}

function makeIcon(profession, className) {
  const icon = document.createElement("i");
  icon.className = "bi " + profession.icon + (className ? " " + className : "");
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function getDrawers() {
  const drawers = [];
  for (const profession of PROFESSIONS) {
    if (!drawers.includes(profession.drawer)) drawers.push(profession.drawer);
  }
  return drawers;
}

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {

  }
}
