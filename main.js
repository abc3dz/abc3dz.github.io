import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import gsap from "gsap";
//import { loadGlb } from './loadGlb.js';

let container, gui, camera, scene, renderer, stats, controls, flag;
/*let lastUpdate = Date.now();
const gridSize = 3;
const totalFrames = 9;
let currentFrame = 0;
let frameDuration = 700;
let textureStuff, animatedMesh;
let dirY = [-4,-3,-2,-1,0,1,2,3,4];*/
let dirLight;
//load obj
// let vercelLoad;
// let vercelTurn = false;
//game stuff
let gameMesh, tek1Mesh, tek2Mesh, tek3Mesh, tek4Mesh, tek5Mesh;
let MomGame, RandGeo, YingLeak, Lgg, ClickNaja, GeometricBowling
//Check
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let lastHovered = null;
//LaiThai art
let krajangYai, krajangLek;
gui = new GUI();
var parameters =
{
    'Audio1': 0.1,
    'Audio2': 0.0,
    'X': 0.0,
    'Y': 0.0,
    'Z': 0.0
};
//loop
let time = 0;
// Vertex Shader - สร้างการโบกสะบัด
const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
        vUv = uv;
        vec3 pos = position;
        
        // สร้างคลื่นในแนวนอน
        float wave1 = sin(pos.x * 3.0 + uTime * 2.0) * 0.1;
        float wave2 = sin(pos.x * 5.0 + uTime * 3.0) * 0.05;
        
        // สร้างการโบกที่ลดลงตามแนวนอน
        float waveDecay = (pos.x + 1.0) * 0.5;
        pos.z = (wave1 + wave2) * waveDecay;
        
        // เพิ่มการโค้งเล็กน้อยในแนวตั้ง
        pos.z += sin(pos.y * 2.0 + uTime * 1.5) * 0.03 * waveDecay;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

// Fragment Shader - วาดลายธงชาติไทย 5 แถบสี
const fragmentShader = `
    varying vec2 vUv;
    
    void main() {
        // กำหนดสี
        vec3 red = vec3(0.769, 0.051, 0.102);    // สีแดง
        vec3 white = vec3(1.0, 1.0, 1.0);         // สีขาว
        vec3 blue = vec3(0.157, 0.204, 0.467);   // สีน้ำเงิน
        
        vec3 color;
        float y = vUv.y;
        
        // แบ่งเป็น 5 แถบ (จากบนลงล่าง: แดง, ขาว, น้ำเงิน, ขาว, แดง)
        if (y > 0.833) {
            color = red;           // แถบบน - แดง (1/6)
        } else if (y > 0.667) {
            color = white;         // ขาว (1/6)
        } else if (y > 0.333) {
            color = blue;          // กลาง - น้ำเงิน (2/6)
        } else if (y > 0.167) {
            color = white;         // ขาว (1/6)
        } else {
            color = red;           // แถบล่าง - แดง (1/6)
        }
        
        gl_FragColor = vec4(color, 1.0);
    }
`;

init();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);
    //camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
    camera.position.set(0, 0, 28);
    //scene
    scene = new THREE.Scene();
    scene.background = null;

    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 0, 0);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 0, 1);
    scene.add(dirLight);

    //render
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    //stats = new Stats();
    //container.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize);

    const geometry = new THREE.PlaneGeometry(3, 2, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uTime: { value: 0 }
        },
        side: THREE.DoubleSide
    });

    flag = new THREE.Mesh(geometry, material);
    flag.position.set(0, 0, -15);
    flag.scale.set(5*5, 3.33*5, 1*5);
    scene.add(flag);

    let allIcon;
    const loaderAllIcon = new GLTFLoader().setPath('models/');
    loaderAllIcon.load('linktree3d.glb', async function (gltf) {
        const model = gltf.scene;
        model.position.set(0, -2, 0);
        allIcon = gltf.scene;
        await renderer.compileAsync(model, camera, scene);
        scene.add(model);
    });
    
    //sound
    var listener = new THREE.AudioListener();
    var sound = new THREE.Audio(listener);
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load('./sounds/Re&Ha.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.1);
        sound.play();
    });
    var sound2 = new THREE.Audio(listener);
    audioLoader.load('./sounds/FaDdd.mp3', function (buffer) {
        sound2.setBuffer(buffer);
        sound2.setLoop(true);
        sound2.setVolume(0.0);
        sound2.play();
    });

    //gui
    var volumeFolder = gui.title('Sound Volume');
    volumeFolder.add(parameters, 'Audio1').min(0.0).max(1.0).step(0.01).onChange(function () {
        sound.setVolume(parameters.Audio1);
    });
    volumeFolder.add(parameters, 'Audio2').min(0.0).max(1.0).step(0.01).onChange(function () {
        sound2.setVolume(parameters.Audio2);
    });
    volumeFolder.close();
    var positionLight = gui.addFolder('Light Position');
    positionLight.add(parameters, 'X').min(-1.0).max(1.0).step(0.01).onChange(function () {
        dirLight.position.x = parameters.X;
    });
    positionLight.add(parameters, 'Y').min(-1.0).max(1.0).step(0.01).onChange(function () {
        dirLight.position.y = parameters.Y;
    });
    positionLight.add(parameters, 'Z').min(-1.0).max(1.0).step(0.01).onChange(function () {
        dirLight.position.z = parameters.Z;
    });
    //positionLight.close();

    //Thai art
    const loaderKrajangYai = new GLTFLoader().setPath('models/');
    loaderKrajangYai.load('LaiThai_KrajangYai.glb', async function (gltf) {
        const model = gltf.scene;
        model.position.set(0, -11, -8);
        krajangYai = gltf.scene;
        await renderer.compileAsync(model, camera, scene);
        model.traverse((child) => {
            if (child.isMesh) {
                const material = child.material;

                if (material) {
                    material.transparent = true;
                    material.opacity = 0.5;
                }
            }
        });
        scene.add(model);
    });
    const loaderKrajangLek = new GLTFLoader().setPath('models/');
    loaderKrajangLek.load('LaiThai_KrajangLek.glb', async function (gltf) {
        const model = gltf.scene;
        model.position.set(0, -7, -3);
        krajangLek = gltf.scene;
        await renderer.compileAsync(model, camera, scene);
        model.traverse((child) => {
            if (child.isMesh) {
                const material = child.material;

                if (material) {
                    material.transparent = true;
                    material.opacity = 0.5;
                }
            }
        });
        scene.add(model);
    });

    // --- ฟังก์ชันสร้างหิมะตก (Particle System + GSAP) ---
function createFallingSnow() {
    const flakeCount = 1500; // จำนวนเกล็ดหิมะ (ยิ่งเยอะยิ่งหนา)
    const positionArray = new Float32Array(flakeCount * 3); // เก็บตำแหน่ง x,y,z ของทุกเม็ด

    // 1. สุ่มตำแหน่งเริ่มต้นให้เกล็ดหิมะ
    for (let i = 0; i < flakeCount * 3; i += 3) {
        // กระจายตัวในแนวแกน X และ Z กว้างๆ (เช่น -25 ถึง 25)
        positionArray[i] = (Math.random() - 0.5) * 50;     // x
        
        // กระจายตัวในแนวแกน Y สูงๆ ต่ำๆ คละกันไป (เช่น -30 ถึง 30)
        // เพื่อให้เวลาหิมะตกลงมา มันจะไม่เห็นเป็นแผงสี่เหลี่ยมชัดเจนเกินไป
        positionArray[i + 1] = (Math.random() - 0.5) * 60; // y
        
        positionArray[i + 2] = (Math.random() - 0.5) * 50; // z
    }

    // 2. สร้าง Geometry และ Material สำหรับ Particles
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

    const snowMat = new THREE.PointsMaterial({
        size: 0.2,          // ขนาดเกล็ดหิมะ (ลองปรับดูครับ 0.1 - 0.5)
        color: 0xffffff,    // สีขาว
        transparent: true,  // ให้มันโปร่งใสได้
        opacity: 0.8,       // ความจาง
        // sizeAttenuation: true // (ค่าปกติ true) ทำให้เม็ดที่อยู่ไกลดูเล็กลง สมจริง
    });

    // 3. สร้างระบบอนุภาค (Points)
    const snowSystem = new THREE.Points(snowGeo, snowMat);
    scene.add(snowSystem);

    // --- GSAP Animation : ทำให้หิมะตก ---
    
    // ตั้งค่าเริ่มต้นให้กลุ่มหิมะอยู่สูงขึ้นไปนิดหน่อย
    snowSystem.position.y = 30;

    // ใช้ GSAP สั่งให้ "ทั้งกลุ่ม" เคลื่อนที่ลงมา
    gsap.to(snowSystem.position, {
        y: -30,           // เคลื่อนที่ลงมาจนถึงตำแหน่ง y = -30 (ระยะทางรวม 60 หน่วย)
        duration: 15,     // ใช้เวลา 15 วินาที (ยิ่งเลขเยอะ หิมะยิ่งตกช้า)
        ease: "none",     // ความเร็วคงที่ (หิมะตกความเร็วสม่ำเสมอ)
        repeat: -1,       // ทำซ้ำตลอดไป (Infinite Loop)
        onRepeat: () => {
            // **หัวใจสำคัญ**: เมื่อตกจนสุดทางแล้ว ให้ดีดกลับไปที่ตำแหน่งเริ่มต้นทันที
            // ทำให้ดูเหมือนหิมะตกต่อเนื่องไม่สิ้นสุด
            snowSystem.position.y = 30;
        }
    });

    // (แถม) เพิ่มการหมุนช้าๆ ให้กลุ่มหิมะ ดูเหมือนมีลมพัดเบาๆ
    gsap.to(snowSystem.rotation, {
        y: Math.PI * 2, // หมุนครบ 1 รอบ
        duration: 60,   // ใช้เวลานานๆ 
        repeat: -1,
        ease: "none"
    });
}

// เรียกใช้งานฟังก์ชัน
createFallingSnow();

    //Link
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            const ClickObj = intersects[0].object;
            console.log(ClickObj);
            if (ClickObj.parent.name == "ObjAbczezeze")
                window.open('https://web.facebook.com/juecheu/', '_blank');
            switch (ClickObj.name) {
                case "ObjGithub":
                    window.open('https://github.com/abc3dz', '_blank');
                    break;
                case "ObjReddit":
                    window.open('https://www.reddit.com/user/abczezeze', '_blank');
                    break;
                case "ObjVercel":
                    gsap.to(ClickObj.rotation, {
                    y: ClickObj.rotation.y + 80,
                    duration: 0.8,
                    ease: "power2.inOut"                               
                    });
                    break;
                case "ObjITCH":
                    window.open('https://abc3dz.itch.io/', '_blank');
                    break;
                case "ObjGameJolt":
                    window.open('https://gamejolt.com/@abc3dz', '_blank');
                    break;
                case "ObjINDIEDB":
                    window.open('https://www.indiedb.com/members/abc3dz', '_blank');
                    break;
                case "ObjPlayStore":
                    window.open('https://play.google.com/store/apps/dev?id=6112214561738871485', '_blank');
                    break;
                case "ObjSketchfab":
                    window.open('https://sketchfab.com/abc3dz', '_blank');
                    break;
                case "ObjSoundCloud":
                    window.open('https://soundcloud.com/abc3dz', '_blank');
                    break;
                case "ObjDrive":
                    window.open('https://drive.google.com/drive/folders/14KsuX06G2BkIyWZz2Z6XCIeZBiTAaACA', '_blank');
                    break;
                case "ObjYT":
                    window.open('https://www.youtube.com/@abc3dz', '_blank');
                    break;
                case "ObjFb":
                    window.open('https://web.facebook.com/abc3dz', '_blank');
                    break;
                case "ObjX":
                    window.open('https://x.com/abc3dz', '_blank');
                    break;
                case "ObjMastodon":
                    window.open('https://mastodon.gamedev.place/@abczezeze', '_blank');
                    break;
                case "ObjBluesky":
                    window.open('https://bsky.app/profile/abc3dz.bsky.social', '_blank');
                    break;
                case "ObjDeviantart":
                    window.open('https://www.deviantart.com/abc3dz', '_blank');
                    break;
                case "ObjTumblr":
                    window.open('https://www.tumblr.com/abc3dz', '_blank');
                    break;
                case "ObjLinkedin":
                    window.open('https://www.linkedin.com/in/abc3dz/', '_blank');
                    break;
                case "ObjIG":
                    window.open('https://www.instagram.com/abc3dzddd', '_blank');
                    break;
                case "ObjThread":
                    window.open('https://www.threads.com/@abc3dzddd', '_blank');
                    break;
                case "ObjTiktok":
                    window.open('https://www.tiktok.com/@abc3dzddd', '_blank');
                    break;
                case "ObjSteam":
                    window.open('https://steamcommunity.com/id/abc3dz/', '_blank');
                    break;
                case "ObjWeibo":
                    window.open('https://www.weibo.com/u/6508462276', '_blank');
                    break;
                case "ObjBilibili":
                    window.open('https://www.bilibili.tv/en/space/1538671760', '_blank');
                    break;
                case "KrajangLek":
                    gsap.to(ClickObj.rotation, {
                    y: ClickObj.rotation.y + 80,
                    duration: 0.8,
                    ease: "power2.inOut"                               
                    });
                    break;
                case "KrajankYai":
                    gsap.to(ClickObj.scale, {
                        x: 0.5,
                        y: 0.5,
                        z: 0.5,
                        duration: 0.2,
                        ease: "power2.in",
                        onComplete: () => {
                            // Then scale up with bounce effect
                            gsap.to(ClickObj.scale, {
                                x: 1,
                                y: 1,
                                z: 1,
                                duration: 1,
                                ease: "elastic.out(1, 0.3)"
                            });
                        }
                    });
                    break;
                default:
                    console.log('No action assigned for this object.');
            }
        }
    });

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const hoverObj = intersects[0].object;
            //console.log(hoverObj);
            if (hoverObj.name === "KrajankYai") return;

            if (lastHovered && lastHovered !== hoverObj) {
                lastHovered.material.color.set(0xffffff);
            }

            if (hoverObj.material && hoverObj.material.color) {
                hoverObj.material.color.set(Math.random() * 0xffffff);
                lastHovered = hoverObj;
            }
        } else {
            if (lastHovered) {
                lastHovered.material.color.set(0xffffff);
                lastHovered = null;
            }
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
let clock = new THREE.Clock();
function animate() {
    //requestAnimationFrame(animate);
    let delta = clock.getDelta();

    if (tek1Mesh) tek1Mesh.rotation.y += 0.4 * delta;
    if (tek2Mesh) tek2Mesh.rotation.y += 0.31 * delta;
    if (tek3Mesh) tek3Mesh.rotation.y += 0.22 * delta;
    if (tek4Mesh) tek4Mesh.rotation.y += 0.53 * delta;

    if (tek5Mesh) tek5Mesh.rotation.y += 0.34 * delta;
    if (RandGeo) RandGeo.rotation.y += 0.42 * delta;
    if (MomGame) MomGame.rotation.y += 0.39 * delta;

    if (Lgg) Lgg.rotation.y += 0.33 * delta;
    if (ClickNaja) ClickNaja.rotation.y += 0.44 * delta;
    if (GeometricBowling) GeometricBowling.rotation.y += 0.55 * delta;
    if (YingLeak) YingLeak.rotation.y += 0.37 * delta;

    time += 0.016;
    flag.material.uniforms.uTime.value = time;
    flag.rotation.y = Math.sin(time * 0.3) * 0.1;

    //controls.update();
    renderer.render(scene, camera);
    //stats.update();
}
animate();