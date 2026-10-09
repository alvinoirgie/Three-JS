import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ==========================================
// 1. SCENE, CAMERA, & RENDERER (DENGAN SHADOW)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050515); // Latar malam gelap kebiruan
scene.fog = new THREE.FogExp2(0x050515, 0.015); // Efek kabut halus di kejauhan

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 3, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; // Aktifkan sistem bayangan
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls (Navigasi Kamera)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 + 0.1; // Membatasi agar tidak bisa melihat dari bawah tanah

// ==========================================
// 2. LIGHTING (PENCAHAYAAN DRAMATIS)
// ==========================================
const ambientLight = new THREE.AmbientLight(0x334466, 1.5); // Cahaya lingkungan temaram
scene.add(ambientLight);

// Lampu utama dengan bayangan
const dirLight = new THREE.DirectionalLight(0xffecd1, 2.5);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Lampu sorot dari bawah istana (Sorot Sihir Cyan)
const spotLight = new THREE.SpotLight(0x00ffff, 4, 15, Math.PI / 4, 0.5);
spotLight.position.set(0, -3, 0);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

// ==========================================
// 3. INOVASI 1: PARTIKEL BINTANG / PERI
// ==========================================
const starCount = 800;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 50;
}

starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3),
);
const starMaterial = new THREE.PointsMaterial({
  color: 0x88ccff,
  size: 0.08,
  transparent: true,
  opacity: 0.8,
});
const starParticles = new THREE.Points(starGeometry, starMaterial);
scene.add(starParticles);

// ==========================================
// 4. INOVASI 2: CINCIN SIHIR BECAHAYA (MAGIC RING)
// ==========================================
const ringGeometry = new THREE.RingGeometry(2.2, 2.3, 64);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5,
});
const magicRing = new THREE.Mesh(ringGeometry, ringMaterial);
magicRing.rotation.x = Math.PI / 2;
magicRing.position.y = -0.5;
scene.add(magicRing);

// ==========================================
// 5. INOVASI 3: KRISTAL PENGELILING (ORBS)
// ==========================================
const orbGeometry = new THREE.OctahedronGeometry(0.15, 0);
const orbMaterial = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  emissive: 0xff00ff,
  emissiveIntensity: 0.8,
  roughness: 0.2,
});

const orb1 = new THREE.Mesh(orbGeometry, orbMaterial);
const orb2 = new THREE.Mesh(orbGeometry, orbMaterial);
scene.add(orb1);
scene.add(orb2);

// ==========================================
// 6. LOAD MODEL FLOATING CASTLE
// ==========================================
const castleContainer = new THREE.Group();
scene.add(castleContainer);

const loader = new GLTFLoader();
loader.load(
  "/models/floating_castle.glb", // Pastikan file ditaruh di folder public/models/
  (gltf) => {
    console.log("Floating Castle berhasil dimuat!");
    const castle = gltf.scene;

    // Aktifkan bayangan untuk semua objek di dalam model
    castle.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    castleContainer.add(castle);

    // Auto-fit & Sentralisasi ukuran
    const box = new THREE.Box3().setFromObject(castle);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const targetSize = 3;
    const scale = targetSize / maxSize;

    castle.scale.setScalar(scale);
    castle.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale,
    );
  },
  undefined,
  (error) => {
    console.error("Gagal memuat model floating castle:", error);
  },
);

// ==========================================
// 7. ANIMASI & RENDER LOOP
// ==========================================
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Rotasi Istana
  castleContainer.rotation.y += 0.002;

  // Efek Istana Melayang naik-turun (Floating/Bobbing Effect)
  castleContainer.position.y = Math.sin(elapsedTime * 1.5) * 0.1;

  // Rotasi Cincin Sihir
  magicRing.rotation.z += 0.005;

  // Orbit Kristal 1
  orb1.position.x = Math.cos(elapsedTime * 1.2) * 2.8;
  orb1.position.z = Math.sin(elapsedTime * 1.2) * 2.8;
  orb1.position.y = Math.sin(elapsedTime * 2.5) * 0.3;
  orb1.rotation.y += 0.02;

  // Orbit Kristal 2 (Arah Berlawanan)
  orb2.position.x = Math.cos(-elapsedTime * 0.9) * 3.2;
  orb2.position.z = Math.sin(-elapsedTime * 0.9) * 3.2;
  orb2.position.y = Math.cos(elapsedTime * 2) * 0.4;
  orb2.rotation.x += 0.02;

  // Rotasi Bintang
  starParticles.rotation.y += 0.0003;

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ==========================================
// 8. RESPONSIVE WINDOW
// ==========================================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
