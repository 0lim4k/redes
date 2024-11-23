const navLinks = document.getElementById("nav-links");
const menuBtn = document.getElementById("menu-btn");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute(
    "class",
    isOpen ? "ri-close-line" : "ri-menu-3-line"
  );
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-3-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// header container
ScrollReveal().reveal(".header__content h1", {
  ...scrollRevealOption,
});

ScrollReveal().reveal(".header__content .section__description", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".header__content .header__btn", {
  ...scrollRevealOption,
  delay: 1000,
});

// about container
ScrollReveal().reveal(".about__content .section__header", {
  ...scrollRevealOption,
});

ScrollReveal().reveal(".about__content .section__description", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".about__content .about__btn", {
  ...scrollRevealOption,
  delay: 1000,
});

// service container
ScrollReveal().reveal(".service__card", {
  ...scrollRevealOption,
  interval: 500,
});

// portfolio container
ScrollReveal().reveal(".portfolio__card", {
  duration: 1000,
  interval: 500,
});

document.getElementById('ipForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const ip = document.getElementById('ip').value;
  const mask = document.getElementById('mask').value;

  const ipResult = calculateIP(ip, mask);

  if (ipResult) {
      document.getElementById('networkIP').textContent = ipResult.networkIP;
      document.getElementById('broadcastIP').textContent = ipResult.broadcastIP;
      document.getElementById('hostCount').textContent = ipResult.hostCount;
      document.getElementById('usableRange').textContent = ipResult.usableRange;
      document.getElementById('ipClass').textContent = ipResult.ipClass;
      document.getElementById('ipType').textContent = ipResult.ipType;

      // Mostrar porciones de red y hosts en binario con colores
      displayBinarySections(ipResult.ipBinary, ipResult.maskBinary);

      document.getElementById('result').style.display = 'block';
  } else {
      alert('Por favor, introduce una IP y una máscara válidas.');
  }
});

function calculateIP(ip, mask) {
  const ipBinary = ipToBinary(ip);
  const maskBinary = parseMask(mask);

  if (!ipBinary || !maskBinary) {
      return null;
  }

  const networkIP = binaryToIp(andBinary(ipBinary, maskBinary));
  const broadcastIP = binaryToIp(orBinary(ipBinary, invertBinary(maskBinary)));
  const hostCount = calculateHostCount(maskBinary);
  const usableRange = calculateUsableRange(networkIP, broadcastIP);
  const ipClass = getClass(ip);
  const ipType = isPrivate(ip) ? 'Privada' : 'Pública';

  return {
      networkIP,
      broadcastIP,
      hostCount,
      usableRange,
      ipClass,
      ipType,
      ipBinary,  // Devuelve la IP en binario
      maskBinary // Devuelve la máscara en binario
  };
}

// Función para mostrar la porción de red y hosts en binario
function displayBinarySections(ipBinary, maskBinary) {
  const maskBits = maskBinary.replace(/\./g, '').split('').filter(bit => bit === '1').length;
  const ipBinaryFull = ipBinary.replace(/\./g, '');

  // Porción de red en binario
  const red = ipBinaryFull.slice(0, maskBits);
  // Porción de hosts en binario
  const host = ipBinaryFull.slice(maskBits);

  // Mostrar los valores en la interfaz
  document.getElementById('binaryRepresentation').innerHTML = 
      `<span class="red">${red}</span>` +
      `<span class="green">${host}</span>`;
}

function ipToBinary(ip) {
  return ip.split('.').map(octet => {
      const binary = parseInt(octet, 10).toString(2).padStart(8, '0');
      return binary;
  }).join('.');
}

function binaryToIp(binary) {
  return binary.split('.').map(bin => {
      return parseInt(bin, 2).toString(10);
  }).join('.');
}

function parseMask(mask) {
  const octets = mask.split('.');
  if (octets.length !== 4 || octets.some(octet => isNaN(octet) || octet < 0 || octet > 255)) {
      return null;
  }
  return octets.map(octet => parseInt(octet, 10).toString(2).padStart(8, '0')).join('.');
}

function andBinary(a, b) {
  const aParts = a.split('.');
  const bParts = b.split('.');
  return aParts.map((part, index) => {
      return (parseInt(part, 2) & parseInt(bParts[index], 2)).toString(2).padStart(8, '0');
  }).join('.');
}

function orBinary(a, b) {
  const aParts = a.split('.');
  const bParts = b.split('.');
  return aParts.map((part, index) => {
      return (parseInt(part, 2) | parseInt(bParts[index], 2)).toString(2).padStart(8, '0');
  }).join('.');
}

function invertBinary(binary) {
  return binary.split('.').map(part => {
      return (~parseInt(part, 2) & 255).toString(2).padStart(8, '0');
  }).join('.');
}

function calculateHostCount(maskBinary) {
  const zeroBits = 32 - maskBinary.split('.').reduce((acc, part) => acc + part.split('').filter(bit => bit === '1').length, 0);
  return Math.pow(2, zeroBits) - 2;
}

function calculateUsableRange(networkIP, broadcastIP) {
  const networkParts = networkIP.split('.').map(Number);
  const broadcastParts = broadcastIP.split('.').map(Number);

  networkParts[3] += 1; // Primera IP útil
  broadcastParts[3] -= 1; // Última IP útil

  return `${networkParts.join('.')} - ${broadcastParts.join('.')}`;
}

function getClass(ip) {
  const firstOctet = parseInt(ip.split('.')[0], 10);

  if (firstOctet >= 1 && firstOctet <= 126) {
      return 'Clase A';
  } else if (firstOctet >= 128 && firstOctet <= 191) {
      return 'Clase B';
  } else if (firstOctet >= 192 && firstOctet <= 223) {
      return 'Clase C';
  } else if (firstOctet >= 224 && firstOctet <= 239) {
      return 'Clase D (Multicast)';
  } else {
      return 'Clase E (Experimental)';
  }
}

function isPrivate(ip) {
  const [first, second] = ip.split('.').map(Number);

  if (
      (first === 10) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
  ) {
      return true;
  }

  return false;
}

