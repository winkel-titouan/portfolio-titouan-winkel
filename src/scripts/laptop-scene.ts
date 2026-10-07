import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Valeurs pilotées par le scroll (0 → 1 sauf rotations en radians). */
export interface LaptopState {
    /** Ouverture de l'écran (0 = fermé, 1 = ouvert) */
    open: number;
    /** Rotation du PC autour de l'axe vertical */
    rotY: number;
    /** Inclinaison avant/arrière */
    rotX: number;
    /** Décalage vers la droite (desktop) / vers le bas (mobile), en facteur */
    offset: number;
    /** Allumage de l'écran */
    screen: number;
    /** Zoom caméra vers l'écran */
    zoom: number;
    /** Tour d'introduction joué au chargement */
    spin: number;
}

const FOV = 30;
const MODEL_SCALE = 10;
const tmpVec = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();

/** Ombre portée douce, moins chère qu'une vraie shadow map. */
function createShadow() {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(40, 10, 80, 0.55)");
    g.addColorStop(0.5, "rgba(40, 10, 80, 0.2)");
    g.addColorStop(1, "rgba(40, 10, 80, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.2, 3.8),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(c),
            transparent: true,
            depthWrite: false,
        }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.03;
    return mesh;
}

/** Contenu affiché sur l'écran du PC. */
async function createScreenTexture() {
    await Promise.all([
        document.fonts.load('400 120px "Russo One"'),
        document.fonts.load('500 40px "Space Grotesk"'),
    ]).catch(() => {});

    const W = 1600;
    const H = 934; // ratio de l'écran du modèle (0.322 × 0.188)
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#160a2b");
    bg.addColorStop(0.6, "#2b1356");
    bg.addColorStop(1, "#a983e2");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Quadrillage
    ctx.strokeStyle = "rgba(213, 185, 255, 0.08)";
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
    }
    for (let y = 0; y < H; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }

    // Halo
    const glow = ctx.createRadialGradient(W * 0.78, H * 0.3, 0, W * 0.78, H * 0.3, 520);
    glow.addColorStop(0, "rgba(213, 185, 255, 0.55)");
    glow.addColorStop(1, "rgba(213, 185, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Barre de fenêtre
    ctx.fillStyle = "rgba(11, 7, 16, 0.65)";
    ctx.fillRect(0, 0, W, 64);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(44 + i * 40, 32, 12, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = '500 28px "Space Grotesk", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("titouan-winkel.fr", W / 2, 42);
    ctx.textAlign = "left";

    // Crochets (rappel des éléments graphiques du site)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 16;
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(120, 330);
    ctx.lineTo(120, 210);
    ctx.lineTo(200, 210);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = '400 150px "Russo One", sans-serif';
    ctx.fillText("Titouan", 150, 360);
    ctx.fillStyle = "#d5b9ff";
    ctx.fillText("Winkel", 150, 520);

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = '500 46px "Space Grotesk", sans-serif';
    ctx.fillText("Graphiste · Designer web", 156, 610);

    // Bouton incliné, même style que les boutons du site (variante sombre)
    const btn = { x: 176, y: 676, label: 330, icon: 100, h: 100 };
    const btnW = btn.label + btn.icon;
    ctx.save();
    ctx.translate(btn.x, btn.y);
    ctx.transform(1, 0, -0.2126, 1, 0, 0); // skewX(-12deg)
    ctx.fillStyle = "#a983e2"; // ombre portée
    ctx.fillRect(16, 16, btnW, btn.h);
    ctx.fillStyle = "#0b0710";
    ctx.fillRect(0, 0, btnW, btn.h);
    ctx.fillStyle = "#a983e2"; // case d'icône
    ctx.fillRect(btn.label, 0, btn.icon, btn.h);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, btnW, btn.h);
    ctx.beginPath();
    ctx.moveTo(btn.label, 0);
    ctx.lineTo(btn.label, btn.h);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.font = '400 40px "Russo One", sans-serif';
    ctx.textBaseline = "middle";
    ctx.fillText("Bienvenue", btn.x + 26, btn.y + btn.h / 2 + 2);

    // Flèche vers le bas dans la case (centre décalé par l'inclinaison)
    const ax = btn.x + btn.label + btn.icon / 2 - 0.2126 * (btn.h / 2);
    const ay = btn.y + btn.h / 2;
    ctx.strokeStyle = "#0b0710";
    ctx.lineWidth = 8;
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";
    ctx.beginPath();
    ctx.moveTo(ax, ay - 22);
    ctx.lineTo(ax, ay + 20);
    ctx.moveTo(ax - 16, ay + 4);
    ctx.lineTo(ax, ay + 20);
    ctx.lineTo(ax + 16, ay + 4);
    ctx.stroke();
    ctx.textBaseline = "alphabetic";

    // Cartes décoratives
    const cards = [
        { x: 1040, y: 220, w: 300, h: 380, r: -6 },
        { x: 1230, y: 330, w: 280, h: 360, r: 5 },
    ];
    cards.forEach(({ x, y, w, h, r }) => {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((r * Math.PI) / 180);
        ctx.fillStyle = "#0b0710";
        ctx.fillRect(-w / 2 + 14, -h / 2 + 14, w, h);
        const cg = ctx.createLinearGradient(0, h / 2, 0, -h / 2);
        cg.addColorStop(0, "#eaddff");
        cg.addColorStop(0.6, "#a983e2");
        cg.addColorStop(1, "#eaddff");
        ctx.fillStyle = cg;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = "#0b0710";
        ctx.lineWidth = 7;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillRect(-w / 2 + 22, -h / 2 + 22, w - 44, h * 0.55);
        ctx.strokeRect(-w / 2 + 22, -h / 2 + 22, w - 44, h * 0.55);
        ctx.fillStyle = "#0b0710";
        ctx.fillRect(-w / 2 + 40, h * 0.17, w - 80, 18);
        ctx.fillRect(-w / 2 + 70, h * 0.17 + 40, w - 140, 12);
        ctx.restore();
    });

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

/** Projection plane des UV : garantit que la texture remplit exactement la dalle. */
function remapPlanarUVs(geometry: THREE.BufferGeometry) {
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox!;
    const pos = geometry.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = (pos.getX(i) - min.x) / (max.x - min.x);
        uv[i * 2 + 1] = (pos.getY(i) - min.y) / (max.y - min.y);
    }
    geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

export async function createLaptopScene(canvas: HTMLCanvasElement, modelUrl: string, state: LaptopState) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.75;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 6, 5);
    const rim = new THREE.DirectionalLight(0xa983e2, 4);
    rim.position.set(-5, 3, -4);
    const fill = new THREE.HemisphereLight(0xffffff, 0xd5b9ff, 0.6);
    scene.add(key, rim, fill);

    // Hiérarchie : root (position) → pivot (rotations + flottement) → modèle
    const root = new THREE.Group();
    const pivot = new THREE.Group();
    root.add(pivot);
    scene.add(root);

    const shadow = createShadow();
    root.add(shadow);

    const [gltf, screenTexture] = await Promise.all([
        new GLTFLoader().loadAsync(modelUrl),
        createScreenTexture(),
    ]);

    const model = gltf.scene;
    model.scale.setScalar(MODEL_SCALE);
    pivot.add(model);

    const screen = model.getObjectByName("Laptop_Screen") as THREE.Mesh | undefined;
    const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture, color: 0x000000, toneMapped: false });
    if (screen) {
        remapPlanarUVs(screen.geometry);
        screen.material = screenMaterial;
    }

    const mixer = new THREE.AnimationMixer(model);
    const clip = gltf.animations.find((a) => a.name === "OpenLid") ?? gltf.animations[0];
    const action = clip ? mixer.clipAction(clip) : undefined;
    if (action) {
        action.play();
        action.paused = true;
    }

    // Interaction souris (parallaxe)
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointer = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let width = 0;
    let height = 0;
    function resize() {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const introPos = new THREE.Vector3();
    const introTarget = new THREE.Vector3();
    const zoomPos = new THREE.Vector3();
    const zoomTarget = new THREE.Vector3();
    const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const screenSize = new THREE.Vector3();
    if (screen) {
        screen.geometry.computeBoundingBox();
        screen.geometry.boundingBox!.getSize(screenSize).multiplyScalar(MODEL_SCALE);
    }
    const ease = (t: number) => t * t * (3 - 2 * t);

    let running = false;

    function frame() {
        if (!running) return;
        requestAnimationFrame(frame);
        const t = performance.now() / 1000;
        const aspect = camera.aspect;
        const mobile = aspect < 0.95;

        // Pose d'intro : recule la caméra sur les écrans étroits
        const dist = 10.8 * Math.max(1, 0.72 / aspect);
        introTarget.set(0, 0.6, 0);
        introPos.set(0, 3.3 * (dist / 9.4), dist);
        const halfW = dist * halfTan * aspect;
        const halfH = dist * halfTan;
        root.position.set(
            mobile ? 0 : state.offset * halfW * 0.5,
            mobile ? -state.offset * halfH * 0.42 : 0,
            0,
        );

        // Parallaxe atténuée pendant le zoom
        pointer.sx += (pointer.x - pointer.sx) * 0.05;
        pointer.sy += (pointer.y - pointer.sy) * 0.05;
        const free = 1 - state.zoom;
        pivot.rotation.set(
            state.rotX + pointer.sy * 0.08 * free,
            state.rotY + state.spin * Math.PI * 1.25 + pointer.sx * 0.22 * free,
            0,
        );
        const bob = Math.sin(t * 1.4) * 0.07 * free;
        pivot.position.y = bob + state.spin * 0.6;
        shadow.scale.setScalar(1 - bob * 1.5);
        (shadow.material as THREE.MeshBasicMaterial).opacity = (1 - state.spin) * (0.9 - bob * 2);

        if (action) {
            action.time = Math.min(state.open, 0.999) * clip!.duration;
            mixer.update(0);
        }
        screenMaterial.color.setScalar(state.screen);

        // Pose zoom : face à la dalle, à une distance qui la fait tenir dans le cadre
        if (screen && state.zoom > 0) {
            model.updateMatrixWorld(true);
            screen.geometry.boundingBox!.getCenter(zoomTarget);
            screen.localToWorld(zoomTarget);
            screen.getWorldQuaternion(tmpQuat);
            const normal = tmpVec.set(0, 0, 1).applyQuaternion(tmpQuat);
            const fitH = screenSize.y / (2 * halfTan * 0.78);
            const fitW = screenSize.x / (2 * halfTan * aspect * (mobile ? 0.92 : 0.8));
            zoomPos.copy(zoomTarget).addScaledVector(normal, Math.max(fitH, fitW));
        }

        const z = ease(state.zoom);
        camera.position.lerpVectors(introPos, zoomPos, z);
        camera.lookAt(tmpVec.lerpVectors(introTarget, zoomTarget, z));

        renderer.render(scene, camera);
    }

    return {
        start() {
            if (running) return;
            running = true;
            frame();
        },
        stop() {
            running = false;
        },
        dispose() {
            running = false;
            ro.disconnect();
            window.removeEventListener("pointermove", onPointer);
            renderer.dispose();
        },
    };
}
