// biome-ignore lint/performance/noNamespaceImport: <explanation>
import * as THREE from "three";

// ============ SCENE SETUP ============
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x00_00_11, 0.000_15);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10_000
);
camera.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas: document.getElementById("space-canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x03_03_08, 1);

// ============ LIGHTING ============
const ambientLight = new THREE.AmbientLight(0x1a_1a_3e, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xff_f4_e0, 1.2);
sunLight.position.set(100, 50, -200);
scene.add(sunLight);

const cockpitLight = new THREE.PointLight(0x00_f0_ff, 0.3, 50);
cockpitLight.position.set(0, 2, -5);
scene.add(cockpitLight);

// Subtle red warning light
const warningLight = new THREE.PointLight(0xff_33_33, 0.15, 30);
warningLight.position.set(-3, 1, -2);
scene.add(warningLight);

// ============ STARFIELD ============
const starCount = 3000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);

const starColorPalette = [
  new THREE.Color(0xe8_e8_ff), // White/blue
  new THREE.Color(0xff_f4_e0), // Warm white
  new THREE.Color(0x00_f0_ff), // Cyan
  new THREE.Color(0xff_6b_00), // Orange
  new THREE.Color(0x9d_4e_dd), // Purple
];

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  // Distribute stars in a cylinder around the ship
  const angle = Math.random() * Math.PI * 2;
  const radius = 50 + Math.random() * 450;
  starPositions[i3] = Math.cos(angle) * radius;
  starPositions[i3 + 1] = (Math.random() - 0.5) * 500;
  starPositions[i3 + 2] = -Math.random() * 2000 - 100;

  const color =
    starColorPalette[Math.floor(Math.random() * starColorPalette.length)];
  starColors[i3] = color.r;
  starColors[i3 + 1] = color.g;
  starColors[i3 + 2] = color.b;

  starSizes[i] = Math.random() * 3 + 1;
}

starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3)
);
starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));

const starMaterial = new THREE.PointsMaterial({
  size: 2,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ============ NEBULA CLOUDS ============
function createNebula() {
  const nebulaGroup = new THREE.Group();
  const nebulaColors = [0x4a_1a_6b, 0x1a_1a_4e, 0x0d_1f_2d, 0x2d_0d_1f];

  for (let i = 0; i < 8; i++) {
    const geometry = new THREE.SphereGeometry(
      100 + Math.random() * 200,
      16,
      16
    );
    const material = new THREE.MeshBasicMaterial({
      color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
      transparent: true,
      opacity: 0.03 + Math.random() * 0.04,
      side: THREE.BackSide,
    });
    const nebula = new THREE.Mesh(geometry, material);
    nebula.position.set(
      (Math.random() - 0.5) * 1000,
      (Math.random() - 0.5) * 500,
      -500 - Math.random() * 1500
    );
    nebula.scale.set(
      1 + Math.random(),
      0.5 + Math.random() * 0.5,
      1 + Math.random()
    );
    nebulaGroup.add(nebula);
  }
  return nebulaGroup;
}

const nebulae = createNebula();
scene.add(nebulae);

// ============ ASTEROIDS ============
const asteroids = [];
const asteroidGeometries = [];

// Create varied asteroid geometries
for (let i = 0; i < 5; i++) {
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const positions = geo.attributes.position;
  for (let j = 0; j < positions.count; j++) {
    positions.setXYZ(
      j,
      positions.getX(j) * (0.7 + Math.random() * 0.6),
      positions.getY(j) * (0.7 + Math.random() * 0.6),
      positions.getZ(j) * (0.7 + Math.random() * 0.6)
    );
  }
  geo.computeVertexNormals();
  asteroidGeometries.push(geo);
}

const asteroidMaterial = new THREE.MeshStandardMaterial({
  color: 0x3a_3a_3a,
  roughness: 0.9,
  metalness: 0.1,
  flatShading: true,
});

function spawnAsteroid() {
  const geo =
    asteroidGeometries[Math.floor(Math.random() * asteroidGeometries.length)];
  const asteroid = new THREE.Mesh(geo.clone(), asteroidMaterial.clone());

  const scale = 2 + Math.random() * 8;
  asteroid.scale.set(scale, scale, scale);

  // Spawn in front, to the sides
  asteroid.position.set(
    (Math.random() - 0.5) * 200,
    (Math.random() - 0.5) * 100,
    -800 - Math.random() * 400
  );

  asteroid.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  asteroid.userData.rotSpeed = {
    x: (Math.random() - 0.5) * 0.02,
    y: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02,
  };
  asteroid.userData.speed = 0.5 + Math.random() * 1.5;

  scene.add(asteroid);
  asteroids.push(asteroid);
}

// Initial asteroids
for (let i = 0; i < 15; i++) {
  spawnAsteroid();
}

// ============ ALIEN SHIPS ============
const alienShips = [];

function createAlienShip() {
  const shipGroup = new THREE.Group();

  // Main hull - sleek design
  const hullGeo = new THREE.ConeGeometry(3, 12, 6);
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x2a_2a_3a,
    roughness: 0.3,
    metalness: 0.8,
  });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.rotation.x = Math.PI / 2;
  shipGroup.add(hull);

  // Engine glow
  const engineGeo = new THREE.SphereGeometry(1.5, 8, 8);
  const engineMat = new THREE.MeshBasicMaterial({
    color: 0x00_ff_41,
    transparent: true,
    opacity: 0.8,
  });
  const engine = new THREE.Mesh(engineGeo, engineMat);
  engine.position.z = 6;
  engine.scale.set(1, 1, 0.5);
  shipGroup.add(engine);

  // Engine trail
  const trailGeo = new THREE.ConeGeometry(1.2, 8, 8);
  const trailMat = new THREE.MeshBasicMaterial({
    color: 0x00_ff_41,
    transparent: true,
    opacity: 0.3,
  });
  const trail = new THREE.Mesh(trailGeo, trailMat);
  trail.position.z = 10;
  trail.rotation.x = -Math.PI / 2;
  shipGroup.add(trail);

  // Wings
  const wingGeo = new THREE.BoxGeometry(15, 0.3, 4);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x3a_3a_4a,
    roughness: 0.4,
    metalness: 0.7,
  });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.z = 2;
  shipGroup.add(wings);

  // Cockpit
  const cockpitGeo = new THREE.SphereGeometry(
    1.8,
    8,
    8,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const cockpitMat = new THREE.MeshStandardMaterial({
    color: 0x00_f0_ff,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.6,
  });
  const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
  cockpitMesh.position.z = -3;
  cockpitMesh.rotation.x = -Math.PI / 2;
  shipGroup.add(cockpitMesh);

  return shipGroup;
}

function spawnAlienShip() {
  const ship = createAlienShip();
  const scale = 0.8 + Math.random() * 0.6;
  ship.scale.set(scale, scale, scale);

  // Spawn to the sides, moving across
  const side = Math.random() > 0.5 ? 1 : -1;
  ship.position.set(
    side * (150 + Math.random() * 100),
    (Math.random() - 0.5) * 80,
    -300 - Math.random() * 400
  );

  ship.userData.velocity = new THREE.Vector3(
    -side * (0.3 + Math.random() * 0.5),
    (Math.random() - 0.5) * 0.1,
    0.5 + Math.random() * 1
  );

  ship.lookAt(
    ship.position.x + ship.userData.velocity.x * 100,
    ship.position.y + ship.userData.velocity.y * 100,
    ship.position.z + ship.userData.velocity.z * 100
  );

  scene.add(ship);
  alienShips.push(ship);
}

// ============ PLANETS ============
const planets = [];

function createPlanet() {
  const planetGroup = new THREE.Group();

  const radius = 30 + Math.random() * 70;
  const planetGeo = new THREE.SphereGeometry(radius, 32, 32);

  // Random planet type
  const planetTypes = [
    { color: 0xc2_70_1a, roughness: 0.8 }, // Desert (Arrakis)
    { color: 0x1a_4a_6b, roughness: 0.6 }, // Ocean
    { color: 0x8b_45_13, roughness: 0.9 }, // Rocky
    { color: 0x2d_4a_2d, roughness: 0.7 }, // Forest
    { color: 0x4a_1a_4a, roughness: 0.5 }, // Gas giant purple
    { color: 0xd4_a5_74, roughness: 0.7 }, // Tan (Caladan)
  ];

  const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
  const planetMat = new THREE.MeshStandardMaterial({
    color: type.color,
    roughness: type.roughness,
    metalness: 0.1,
  });

  const planet = new THREE.Mesh(planetGeo, planetMat);
  planetGroup.add(planet);

  // Atmosphere glow
  const atmosphereGeo = new THREE.SphereGeometry(radius * 1.05, 32, 32);
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: type.color,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  planetGroup.add(atmosphere);

  // Maybe add rings (30% chance)
  if (Math.random() > 0.7) {
    const ringGeo = new THREE.RingGeometry(radius * 1.3, radius * 2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xaa_aa_aa,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    planetGroup.add(ring);
  }

  return planetGroup;
}

function spawnPlanet() {
  const planet = createPlanet();

  // Spawn far away, to the side
  const side = Math.random() > 0.5 ? 1 : -1;
  planet.position.set(
    side * (400 + Math.random() * 300),
    (Math.random() - 0.5) * 200,
    -1500 - Math.random() * 500
  );

  planet.userData.speed = 0.05 + Math.random() * 0.1;
  planet.userData.rotSpeed = 0.001 + Math.random() * 0.002;

  scene.add(planet);
  planets.push(planet);
}

// ============ COCKPIT FRAME ============
function createCockpit() {
  const cockpitGroup = new THREE.Group();

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a_1a_1a,
    roughness: 0.3,
    metalness: 0.8,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a_2a_3a,
    roughness: 0.4,
    metalness: 0.7,
  });

  // Main frame beams - around the viewport
  // Bottom frame
  const bottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.8, 3),
    frameMaterial
  );
  bottomFrame.position.set(0, -6, -8);
  cockpitGroup.add(bottomFrame);

  // Top frame
  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.6, 2),
    frameMaterial
  );
  topFrame.position.set(0, 7, -10);
  cockpitGroup.add(topFrame);

  // Left frame
  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 14, 3),
    frameMaterial
  );
  leftFrame.position.set(-9, 0, -8);
  leftFrame.rotation.z = 0.1;
  cockpitGroup.add(leftFrame);

  // Right frame
  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 14, 3),
    frameMaterial
  );
  rightFrame.position.set(9, 0, -8);
  rightFrame.rotation.z = -0.1;
  cockpitGroup.add(rightFrame);

  // Corner accents with glow
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00_f0_ff,
    transparent: true,
    opacity: 0.6,
  });

  const corners = [
    { x: -8.5, y: -5.5 },
    { x: 8.5, y: -5.5 },
    { x: -8, y: 6 },
    { x: 8, y: 6 },
  ];

  for (const pos of corners) {
    const corner = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.1),
      glowMaterial
    );
    corner.position.set(pos.x, pos.y, -6);
    cockpitGroup.add(corner);
  }

  // Dashboard base
  const dashboardGeo = new THREE.BoxGeometry(18, 1, 6);
  const dashboard = new THREE.Mesh(dashboardGeo, accentMaterial);
  dashboard.position.set(0, -6.5, -5);
  dashboard.rotation.x = 0.2;
  cockpitGroup.add(dashboard);

  // Side consoles
  const consoleMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a_1a_2a,
    roughness: 0.5,
    metalness: 0.6,
  });

  const leftConsole = new THREE.Mesh(
    new THREE.BoxGeometry(3, 8, 4),
    consoleMaterial
  );
  leftConsole.position.set(-10.5, -2, -6);
  leftConsole.rotation.y = 0.3;
  cockpitGroup.add(leftConsole);

  const rightConsole = new THREE.Mesh(
    new THREE.BoxGeometry(3, 8, 4),
    consoleMaterial
  );
  rightConsole.position.set(10.5, -2, -6);
  rightConsole.rotation.y = -0.3;
  cockpitGroup.add(rightConsole);

  // Status lights
  const lightColors = [0x00_ff_41, 0xff_6b_00, 0x00_f0_ff, 0xff_33_33];
  for (let i = 0; i < 8; i++) {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({
        color: lightColors[Math.floor(Math.random() * lightColors.length)],
      })
    );
    light.position.set(-8 + i * 2.2, -5.8, -3.5);
    cockpitGroup.add(light);
  }

  return cockpitGroup;
}

const cockpit = createCockpit();
scene.add(cockpit);

// ============ WARP STREAKS ============
const warpStreaks = [];
const warpGeometry = new THREE.BufferGeometry();
const warpCount = 100;
const warpPositions = new Float32Array(warpCount * 6); // 2 vertices per line

for (let i = 0; i < warpCount; i++) {
  const i6 = i * 6;
  const angle = Math.random() * Math.PI * 2;
  const radius = 20 + Math.random() * 80;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const z = -100 - Math.random() * 400;

  warpPositions[i6] = x;
  warpPositions[i6 + 1] = y;
  warpPositions[i6 + 2] = z;
  warpPositions[i6 + 3] = x;
  warpPositions[i6 + 4] = y;
  warpPositions[i6 + 5] = z - 15;

  warpStreaks.push({
    index: i,
    x,
    y,
    z,
    speed: 2 + Math.random() * 3,
  });
}

warpGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(warpPositions, 3)
);

const warpMaterial = new THREE.LineBasicMaterial({
  color: 0xff_ff_ff,
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending,
});

const warpLines = new THREE.LineSegments(warpGeometry, warpMaterial);
scene.add(warpLines);

// ============ ANIMATION LOOP ============
const clock = new THREE.Clock();
let lastAlienSpawn = 0;
let lastPlanetSpawn = 0;
let lastAsteroidSpawn = 0;

// Hyperdrive state (controlled by UI)
let hyperdriveActive = false;
let hyperdriveMultiplier = 1;
let targetMultiplier = 1;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
function animate() {
  requestAnimationFrame(animate);

  // Keep clock ticking for consistent elapsed time
  clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Smoothly interpolate hyperdrive multiplier
  hyperdriveMultiplier += (targetMultiplier - hyperdriveMultiplier) * 0.05;

  // Camera effects based on hyperdrive
  const shake = hyperdriveActive ? 0.3 : 0.15;
  const shakeSpeed = hyperdriveActive ? 2 : 0.3;
  camera.position.x = Math.sin(elapsed * shakeSpeed) * shake;
  camera.position.y = Math.cos(elapsed * shakeSpeed * 0.7) * shake * 0.7;
  camera.rotation.z =
    Math.sin(elapsed * shakeSpeed * 0.5) * (hyperdriveActive ? 0.02 : 0.005);

  // Warp streak length changes with speed
  const streakLength = 15 + (hyperdriveMultiplier - 1) * 20;

  // Update stars (move towards camera)
  const positions = stars.geometry.attributes.position.array;
  const starSpeed = 1.5 * hyperdriveMultiplier;
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    positions[i3 + 2] += starSpeed;

    if (positions[i3 + 2] > 50) {
      positions[i3 + 2] = -2000;
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 450;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 500;
    }
  }
  stars.geometry.attributes.position.needsUpdate = true;

  // Update warp streaks
  const warpPositionsArray = warpLines.geometry.attributes.position.array;
  for (const streak of warpStreaks) {
    const i6 = streak.index * 6;
    streak.z += streak.speed * hyperdriveMultiplier;

    if (streak.z > 50) {
      streak.z = -500;
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 80;
      streak.x = Math.cos(angle) * radius;
      streak.y = Math.sin(angle) * radius;
    }

    warpPositionsArray[i6] = streak.x;
    warpPositionsArray[i6 + 1] = streak.y;
    warpPositionsArray[i6 + 2] = streak.z;
    warpPositionsArray[i6 + 3] = streak.x;
    warpPositionsArray[i6 + 4] = streak.y;
    warpPositionsArray[i6 + 5] = streak.z - streakLength;
  }
  warpLines.geometry.attributes.position.needsUpdate = true;

  // Warp material opacity increases with speed
  warpMaterial.opacity = 0.3 + (hyperdriveMultiplier - 1) * 0.05;

  // Update asteroids
  asteroids.forEach((asteroid, index) => {
    asteroid.position.z += asteroid.userData.speed * hyperdriveMultiplier;
    asteroid.rotation.x += asteroid.userData.rotSpeed.x * hyperdriveMultiplier;
    asteroid.rotation.y += asteroid.userData.rotSpeed.y * hyperdriveMultiplier;
    asteroid.rotation.z += asteroid.userData.rotSpeed.z * hyperdriveMultiplier;

    if (asteroid.position.z > 50) {
      scene.remove(asteroid);
      asteroids.splice(index, 1);
    }
  });

  // Spawn new asteroids
  if (elapsed - lastAsteroidSpawn > 2 && asteroids.length < 20) {
    spawnAsteroid();
    lastAsteroidSpawn = elapsed;
  }

  // Update alien ships
  alienShips.forEach((ship, index) => {
    const velocity = ship.userData.velocity
      .clone()
      .multiplyScalar(hyperdriveMultiplier);
    ship.position.add(velocity);

    if (ship.position.z > 100 || Math.abs(ship.position.x) > 400) {
      scene.remove(ship);
      alienShips.splice(index, 1);
    }
  });

  // Spawn alien ships occasionally
  if (
    elapsed - lastAlienSpawn > 8 + Math.random() * 12 &&
    alienShips.length < 3
  ) {
    spawnAlienShip();
    lastAlienSpawn = elapsed;
  }

  // Update planets
  planets.forEach((planet, index) => {
    planet.position.z += planet.userData.speed * hyperdriveMultiplier;
    planet.children[0].rotation.y +=
      planet.userData.rotSpeed * hyperdriveMultiplier;

    if (planet.position.z > 200) {
      scene.remove(planet);
      planets.splice(index, 1);
    }
  });

  // Spawn planets rarely
  if (
    elapsed - lastPlanetSpawn > 25 + Math.random() * 20 &&
    planets.length < 2
  ) {
    spawnPlanet();
    lastPlanetSpawn = elapsed;
  }

  // Update nebulae (slow drift)
  for (const nebula of nebulae.children) {
    nebula.position.z += 0.02 * hyperdriveMultiplier;
    if (nebula.position.z > 0) {
      nebula.position.z = -2000;
    }
  }

  // Pulsing cockpit lights
  cockpitLight.intensity = 0.3 + Math.sin(elapsed * 2) * 0.1;
  warningLight.intensity = 0.15 + Math.sin(elapsed * 3) * 0.05;

  // Update colliding asteroids
  updateCollidingAsteroids();
  checkCollisionSpawn(elapsed);

  renderer.render(scene, camera);
}

// ============ RESIZE HANDLER ============
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

// ============ HYPERDRIVE SYSTEM ============
function engageHyperdrive() {
  if (hyperdriveActive) {
    return;
  }

  hyperdriveActive = true;
  targetMultiplier = 15;
  document.body.classList.add("hyperdrive");

  // Play engagement sound effect (visual feedback)
  const flash = document.createElement("div");
  flash.style.cssText = `
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba(0, 240, 255, 0.4) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    animation: hyperdrive-flash 0.5s ease-out forwards;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);

  // After 5 seconds, begin slowdown
  setTimeout(() => {
    targetMultiplier = 1;

    // After another 2 seconds of slowdown, fully disengage
    setTimeout(() => {
      hyperdriveActive = false;
      document.body.classList.remove("hyperdrive");
    }, 2000);
  }, 5000);
}

// Add flash animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes hyperdrive-flash {
    0% { opacity: 0; transform: scale(0.5); }
    30% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.5); }
  }
`;
document.head.appendChild(styleSheet);

// Hook up the trigger
document
  .getElementById("hyperdrive-trigger")
  ?.addEventListener("click", engageHyperdrive);

// ============ RADAR SYSTEM ============
const radarBlipsContainer = document.getElementById("radar-blips");

function createRadarBlip() {
  const blip = document.createElement("div");
  blip.className = "radar-blip";

  // Random position within radar circle
  const angle = Math.random() * Math.PI * 2;
  const distance = 15 + Math.random() * 30; // % from center
  const x = 50 + Math.cos(angle) * distance;
  const y = 50 + Math.sin(angle) * distance;

  blip.style.left = `${x}%`;
  blip.style.top = `${y}%`;

  // Random type
  const type = Math.random();
  if (type > 0.7) {
    blip.classList.add("hostile");
  } else if (type > 0.4) {
    blip.classList.add("friendly");
  }

  radarBlipsContainer?.appendChild(blip);

  // Activate after small delay for effect
  setTimeout(() => blip.classList.add("active"), 50);

  // Remove after animation
  setTimeout(() => {
    blip.remove();
  }, 1500);
}

// Spawn radar blips more frequently
function updateRadar() {
  // Always spawn a blip (more frequent)
  createRadarBlip();

  // Extra blips during hyperdrive
  if (hyperdriveActive) {
    createRadarBlip();
    if (Math.random() > 0.5) {
      createRadarBlip();
    }
  }

  // Shorter interval for more activity
  setTimeout(updateRadar, 300 + Math.random() * 500);
}

updateRadar();

// ============ VELOCITY DISPLAY ============
const velocityFill = document.getElementById("velocity-fill");
const velocityValue = document.getElementById("velocity-value");

function updateVelocityDisplay() {
  const baseSpeed = 0.7;
  const currentSpeed = baseSpeed * hyperdriveMultiplier;
  const displaySpeed = currentSpeed.toFixed(1);

  if (velocityValue) {
    velocityValue.textContent = `${displaySpeed}c`;

    if (hyperdriveMultiplier > 2) {
      velocityValue.classList.add("hyperspeed");
    } else {
      velocityValue.classList.remove("hyperspeed");
    }
  }

  if (velocityFill) {
    // Map multiplier to fill percentage (1x = 70%, 15x = 100%)
    const fillPercent = Math.min(70 + (hyperdriveMultiplier - 1) * 2.5, 100);
    velocityFill.style.width = `${fillPercent}%`;

    // Change color at high speeds
    if (hyperdriveMultiplier > 5) {
      velocityFill.style.background =
        "linear-gradient(90deg, var(--hud-orange), var(--hud-red))";
      velocityFill.style.boxShadow = "0 0 15px var(--hud-orange)";
    } else {
      velocityFill.style.background =
        "linear-gradient(90deg, var(--hud-green), var(--hud-cyan))";
      velocityFill.style.boxShadow = "0 0 10px var(--hud-cyan)";
    }
  }

  requestAnimationFrame(updateVelocityDisplay);
}

updateVelocityDisplay();

// ============ HUD TOGGLE ============
const hudToggle = document.getElementById("hud-toggle");
const hudToggleText = hudToggle?.querySelector(".hud-toggle-text");

hudToggle?.addEventListener("click", () => {
  document.body.classList.toggle("hud-hidden");
  hudToggle.classList.toggle("hidden");

  if (hudToggleText) {
    if (document.body.classList.contains("hud-hidden")) {
      hudToggleText.textContent = "SHOW HUD";
    } else {
      hudToggleText.textContent = "HIDE HUD";
    }
  }
});

// ============ ASTEROID COLLISION SYSTEM ============
const collidingAsteroids = [];

function spawnCollidingAsteroid() {
  const geo =
    asteroidGeometries[Math.floor(Math.random() * asteroidGeometries.length)];
  const asteroid = new THREE.Mesh(geo.clone(), asteroidMaterial.clone());

  const scale = 1 + Math.random() * 2;
  asteroid.scale.set(scale, scale, scale);

  // Spawn directly ahead, slightly offset
  asteroid.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 8,
    -400
  );

  asteroid.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  asteroid.userData.rotSpeed = {
    x: (Math.random() - 0.5) * 0.05,
    y: (Math.random() - 0.5) * 0.05,
    z: (Math.random() - 0.5) * 0.05,
  };
  asteroid.userData.speed = 3 + Math.random() * 2;

  scene.add(asteroid);
  collidingAsteroids.push(asteroid);
}

function createExplosion(position) {
  const explosionGroup = new THREE.Group();
  explosionGroup.position.copy(position);

  // Create particles
  const particleCount = 30;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const size = 0.2 + Math.random() * 0.5;
    const geo = new THREE.SphereGeometry(size, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xff_6b_00 : 0xff_33_33,
      transparent: true,
      opacity: 1,
    });
    const particle = new THREE.Mesh(geo, mat);

    // Random velocity outward
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2 + 1
    );

    explosionGroup.add(particle);
    particles.push(particle);
  }

  // Add bright flash
  const flashGeo = new THREE.SphereGeometry(3, 16, 16);
  const flashMat = new THREE.MeshBasicMaterial({
    color: 0xff_ff_ff,
    transparent: true,
    opacity: 0.8,
  });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  explosionGroup.add(flash);

  scene.add(explosionGroup);

  // Screen shake
  const originalCamPos = { x: camera.position.x, y: camera.position.y };
  let shakeIntensity = 0.5;

  // Create screen flash overlay
  const screenFlash = document.createElement("div");
  screenFlash.style.cssText = `
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba(255, 100, 0, 0.4) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9998;
    animation: explosion-flash 0.3s ease-out forwards;
  `;
  document.body.appendChild(screenFlash);
  setTimeout(() => screenFlash.remove(), 300);

  // Animate explosion
  let frame = 0;
  const maxFrames = 60;

  function animateExplosion() {
    frame += 1;

    // Update particles
    for (const p of particles) {
      p.position.add(p.userData.velocity);
      p.userData.velocity.multiplyScalar(0.95);
      p.material.opacity = 1 - frame / maxFrames;
      p.scale.multiplyScalar(0.97);
    }

    // Fade flash
    flash.material.opacity = Math.max(0, 0.8 - frame / 10);
    flash.scale.multiplyScalar(1.1);

    // Camera shake
    if (frame < 20) {
      camera.position.x =
        originalCamPos.x + (Math.random() - 0.5) * shakeIntensity;
      camera.position.y =
        originalCamPos.y + (Math.random() - 0.5) * shakeIntensity;
      shakeIntensity *= 0.9;
    }

    if (frame < maxFrames) {
      requestAnimationFrame(animateExplosion);
    } else {
      scene.remove(explosionGroup);
    }
  }

  animateExplosion();
}

// Add explosion flash animation
const explosionStyle = document.createElement("style");
explosionStyle.textContent = `
  @keyframes explosion-flash {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
`;
document.head.appendChild(explosionStyle);

// Update colliding asteroids in animation loop - add this function
function updateCollidingAsteroids() {
  for (let i = collidingAsteroids.length - 1; i >= 0; i--) {
    const asteroid = collidingAsteroids[i];
    asteroid.position.z += asteroid.userData.speed * hyperdriveMultiplier;
    asteroid.rotation.x += asteroid.userData.rotSpeed.x;
    asteroid.rotation.y += asteroid.userData.rotSpeed.y;
    asteroid.rotation.z += asteroid.userData.rotSpeed.z;

    // Check for collision (close to camera)
    if (asteroid.position.z > -5) {
      createExplosion(asteroid.position);
      scene.remove(asteroid);
      collidingAsteroids.splice(i, 1);
    }
  }
}

// Spawn colliding asteroids occasionally
let lastCollisionSpawn = 0;
function checkCollisionSpawn(elapsed) {
  // Spawn every 15-30 seconds
  const spawnInterval = 15 + Math.random() * 15;
  if (elapsed - lastCollisionSpawn > spawnInterval) {
    spawnCollidingAsteroid();
    lastCollisionSpawn = elapsed;
  }
}

// ============ START ============
animate();

// Spawn initial objects
setTimeout(() => spawnPlanet(), 5000);
setTimeout(() => spawnAlienShip(), 3000);
// First collision asteroid after 8 seconds
setTimeout(() => spawnCollidingAsteroid(), 8000);
