import * as THREE from "three";
import "./App.css";
import { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import GUI from "lil-gui";

function App() {
  useEffect(() => {
    const canvas = document.querySelector("canvas.webgl");
    const scene = new THREE.Scene();

    //? debug ui
    const gui = new GUI();

    //? presets - save/load the whole GUI state to localStorage
    // const PRESET_STORAGE_KEY = "threejs-lights-preset";
    // const presetActions = {
    //   save: () => {
    //     localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(gui.save()));
    //   },
    //   load: () => {
    //     const saved = localStorage.getItem(PRESET_STORAGE_KEY);
    //     if (!saved) return;
    //     gui.load(JSON.parse(saved));
    //   },
    // };
    // const presetsFolder = gui.addFolder("Presets");
    // presetsFolder.add(presetActions, "save").name("save preset");
    // presetsFolder.add(presetActions, "load").name("load preset");

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    //> material playground - swap material type and tweak shared PBR params
    const materialParams = {
      type: "standard",
      color: "#ffffff",
      roughness: 0.5,
      metalness: 0.5,
      envMapIntensity: 1,
    };

    function createMaterial(type) {
      let newMaterial;
      if (type === "physical") newMaterial = new THREE.MeshPhysicalMaterial();
      else if (type === "toon") newMaterial = new THREE.MeshToonMaterial();
      else newMaterial = new THREE.MeshStandardMaterial();

      newMaterial.side = THREE.DoubleSide;
      newMaterial.color.set(materialParams.color);
      if ("roughness" in newMaterial)
        newMaterial.roughness = materialParams.roughness;
      if ("metalness" in newMaterial)
        newMaterial.metalness = materialParams.metalness;
      if ("envMapIntensity" in newMaterial)
        newMaterial.envMapIntensity = materialParams.envMapIntensity;
      return newMaterial;
    }

    let material = createMaterial(materialParams.type);

    const geomtery = new THREE.BoxGeometry();

    //? mehses
    const box = new THREE.Mesh(geomtery, material);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    sphere.position.x = 1.5;

    const torusGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
    const torus = new THREE.Mesh(torusGeometry, material);
    torus.castShadow = true;
    torus.receiveShadow = true;
    torus.position.x = -1.5;
    scene.add(torus);

    const planeGeometry = new THREE.PlaneGeometry(10, 10, 100, 100);
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    scene.add(plane);

    const meshesUsingMaterial = [box, sphere, torus, plane];

    const materialFolder = gui.addFolder("Material").close();
    materialFolder
      .add(materialParams, "type", ["standard", "physical", "toon"])
      .name("material type")
      .onChange(applyMaterialType);
    materialFolder.addColor(materialParams, "color").onChange(() => {
      material.color.set(materialParams.color);
    });
    const roughnessController = materialFolder
      .add(materialParams, "roughness", 0, 1, 0.01)
      .onChange((value) => {
        if ("roughness" in material) material.roughness = value;
      });
    const metalnessController = materialFolder
      .add(materialParams, "metalness", 0, 1, 0.01)
      .onChange((value) => {
        if ("metalness" in material) material.metalness = value;
      });
    const envIntensityController = materialFolder
      .add(materialParams, "envMapIntensity", 0, 3, 0.01)
      .name("env intensity")
      .onChange((value) => {
        if ("envMapIntensity" in material) material.envMapIntensity = value;
      });

    function applyMaterialType(type) {
      const oldMaterial = material;
      material = createMaterial(type);
      meshesUsingMaterial.forEach((mesh) => {
        mesh.material = material;
      });
      oldMaterial.dispose();

      const supportsPBR = type !== "toon";
      roughnessController.enable(supportsPBR);
      metalnessController.enable(supportsPBR);
      envIntensityController.enable(supportsPBR);
    }

    //? camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.01,
      100
    );
    camera.position.z = 3;
    scene.add(camera);

    //> ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambientLight.visible = false;
    scene.add(ambientLight);

    //? debug ui
    const ambientLightFolder = gui.addFolder("Ambient light").close();
    ambientLightFolder.add(ambientLight, "visible");
    ambientLightFolder.addColor(ambientLight, "color");
    ambientLightFolder
      .add(ambientLight, "intensity")
      .min(0.1)
      .max(5)
      .step(0.01)
      .name("ambient light intensity");

    //> point light
    const pointLight = new THREE.PointLight(0xffffff, 3, 3);
    pointLight.position.y = 1.5;
    pointLight.shadow.mapSize.set(1024, 1024);
    scene.add(pointLight);

    //?helper
    const pointLightHelper = new THREE.PointLightHelper(
      pointLight,
      0.2,
      0xff00ff
    );
    scene.add(pointLightHelper);

    //? debug ui
    const pointLightFolder = gui.addFolder("point light");
    pointLightFolder.add(pointLight, "visible");
    pointLightFolder.add(pointLightHelper, "visible").name("helper");
    pointLightFolder.add(pointLight, "castShadow").name("cast shadow");
    pointLightFolder.addColor(pointLight, "color");
    pointLightFolder.add(pointLight, "intensity", 0, 5, 0.01);
    const pointLightPosition = pointLightFolder.addFolder("position");
    pointLightPosition.add(pointLight.position, "x", -10, 10);
    pointLightPosition.add(pointLight.position, "y", -10, 10);
    pointLightPosition.add(pointLight.position, "z", -10, 10);

    //> directinal light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.visible = false;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 15;
    scene.add(directionalLight);

    //?helper
    const directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLight,
      0.2
    );
    directionalLightHelper.visible = false;
    scene.add(directionalLightHelper);

    //? debug ui
    const directionalLightFolder = gui.addFolder("Directional light").close();
    directionalLightFolder.add(directionalLight, "visible");
    directionalLightFolder
      .add(directionalLightHelper, "visible")
      .name("helper");
    directionalLightFolder
      .add(directionalLight, "castShadow")
      .name("cast shadow");
    directionalLightFolder.addColor(directionalLight, "color");
    directionalLightFolder.add(directionalLight, "intensity", 0, 5, 0.01);
    const directionalLightPosition =
      directionalLightFolder.addFolder("position");
    directionalLightPosition.add(directionalLight.position, "x", -10, 10);
    directionalLightPosition.add(directionalLight.position, "y", -10, 10);
    directionalLightPosition.add(directionalLight.position, "z", -10, 10);

    //> hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0xff00ff, 0x0000ff, 3);
    hemisphereLight.visible = false;
    scene.add(hemisphereLight);

    //?helper
    const hemisphereLightHelper = new THREE.HemisphereLightHelper(
      hemisphereLight,
      0.2
    );
    hemisphereLightHelper.visible = false;
    scene.add(hemisphereLightHelper);

    //? debug ui
    const hemisphereLightFolder = gui.addFolder("Hemisphere light").close();
    hemisphereLightFolder.add(hemisphereLight, "visible");
    hemisphereLightFolder.add(hemisphereLightHelper, "visible").name("helper");
    hemisphereLightFolder.addColor(hemisphereLight, "color");
    hemisphereLightFolder
      .addColor(hemisphereLight, "groundColor")
      .name("ground Color");
    hemisphereLightFolder.add(hemisphereLight, "intensity", 0, 5, 0.01);
    const hemisphereLightPosition = hemisphereLightFolder.addFolder("position");
    hemisphereLightPosition.add(hemisphereLight.position, "x", -10, 10);
    hemisphereLightPosition.add(hemisphereLight.position, "y", -10, 10);
    hemisphereLightPosition.add(hemisphereLight.position, "z", -10, 10);

    //> rect area light - only works with mesh standard material and mesh physical material
    const rectAreaLight = new THREE.RectAreaLight(0xff0000, 5, 1, 1);
    rectAreaLight.visible = false;
    rectAreaLight.position.set(1, 0, 0);
    const rectAreaLightTarget = new THREE.Vector3();
    rectAreaLight.lookAt(rectAreaLightTarget);
    scene.add(rectAreaLight);

    //? helper
    const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
    rectAreaLightHelper.visible = false;
    scene.add(rectAreaLightHelper);

    //? debug ui
    const rectAreaLightFolder = gui.addFolder("Rectarea light").close();
    rectAreaLightFolder.add(rectAreaLight, "visible");
    rectAreaLightFolder.add(rectAreaLightHelper, "visible").name("helper");
    rectAreaLightFolder.addColor(rectAreaLight, "color");
    rectAreaLightFolder.add(rectAreaLight, "intensity", 0, 5, 0.01);
    const rectAreaLightPosition = rectAreaLightFolder.addFolder("position");
    rectAreaLightPosition.add(rectAreaLight.position, "x", -10, 10);
    rectAreaLightPosition.add(rectAreaLight.position, "y", -10, 10);
    rectAreaLightPosition.add(rectAreaLight.position, "z", -10, 10);
    const rectAreaLightTargetPosition =
      rectAreaLightFolder.addFolder("Target Position");
    rectAreaLightTargetPosition
      .add(rectAreaLightTarget, "x", -10, 10)
      .onChange(() => {
        rectAreaLight.lookAt(rectAreaLightTarget);
      });
    rectAreaLightTargetPosition
      .add(rectAreaLightTarget, "y", -10, 10)
      .onChange(() => {
        rectAreaLight.lookAt(rectAreaLightTarget);
      });
    rectAreaLightTargetPosition
      .add(rectAreaLightTarget, "z", -10, 10)
      .onChange(() => {
        rectAreaLight.lookAt(rectAreaLightTarget);
      });

    //> spotlight  - color, intensity, distance, angle, penumbra, decay
    const spotLight = new THREE.SpotLight(
      0xff00ff,
      5,
      5,
      Math.PI * 0.1,
      0.25,
      1
    );
    spotLight.target.position.x = 1;
    spotLight.visible = false;
    spotLight.shadow.mapSize.set(1024, 1024);
    scene.add(spotLight.target);
    scene.add(spotLight);

    //?helper
    const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0.2);
    spotLightHelper.visible = false;
    scene.add(spotLightHelper);

    //? debug ui
    const spotLightFolder = gui.addFolder("Spotlight light").close();
    spotLightFolder.add(spotLight, "visible");
    spotLightFolder.add(spotLightHelper, "visible").name("helper");
    spotLightFolder.add(spotLight, "castShadow").name("cast shadow");
    spotLightFolder.addColor(spotLight, "color");
    spotLightFolder.add(spotLight, "intensity", 0, 20, 0.01);
    spotLightFolder.add(spotLight, "distance", 0, 10, 0.01);
    spotLightFolder.add(spotLight, "decay", 0, 10, 0.01);
    spotLightFolder.add(spotLight, "penumbra", 0, 5, 0.001);
    spotLightFolder.add(spotLight, "angle", 0, Math.PI, Math.PI / 180);
    const spotLightPosition = spotLightFolder.addFolder("position");
    spotLightPosition.add(spotLight.position, "x", -10, 10);
    spotLightPosition.add(spotLight.position, "y", -10, 10);
    spotLightPosition.add(spotLight.position, "z", -10, 10);
    const spotLightTargetPosition =
      spotLightFolder.addFolder("Target position");
    spotLightTargetPosition.add(spotLight.target.position, "x", -5, 5);
    spotLightTargetPosition.add(spotLight.target.position, "y", -5, 5);
    spotLightTargetPosition.add(spotLight.target.position, "z", -5, 5);

    //!light cost
    //> minimal - ambient light, hemisphere light
    //> moderate - directional light, point light
    //> high - spotlight , rectarea light

    //? renderer
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //> environment map - gives PBR materials something to reflect
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    const environmentParams = { enabled: false, showBackground: false };
    function applyEnvironment() {
      scene.environment = environmentParams.enabled ? environmentTexture : null;
      scene.background =
        environmentParams.enabled && environmentParams.showBackground
          ? environmentTexture
          : null;
    }
    applyEnvironment();

    const environmentFolder = gui.addFolder("Environment").close();
    environmentFolder
      .add(environmentParams, "enabled")
      .name("env lighting")
      .onChange(applyEnvironment);
    environmentFolder
      .add(environmentParams, "showBackground")
      .name("show as background")
      .onChange(applyEnvironment);

    //> fps stats panel
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    // Resize handler
    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", onResize);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth camera motion

    //> per-model move control (drag gizmo to translate whichever mesh is selected)
    const models = { none: null, box, sphere, torus };
    const movableModels = { box: false, sphere: false, torus: false };

    const transformControls = new TransformControls(
      camera,
      renderer.domElement
    );
    transformControls.setMode("translate");
    transformControls.enabled = false;
    transformControls.visible = false;
    scene.add(transformControls.getHelper());

    // dragging the gizmo shouldn't also orbit the camera
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });

    const initialTransforms = {
      box: {
        position: box.position.clone(),
        rotation: box.rotation.clone(),
        scale: box.scale.clone(),
      },
      sphere: {
        position: sphere.position.clone(),
        rotation: sphere.rotation.clone(),
        scale: sphere.scale.clone(),
      },
      torus: {
        position: torus.position.clone(),
        rotation: torus.rotation.clone(),
        scale: torus.scale.clone(),
      },
    };

    const modelControlFolder = gui.addFolder("Model move control");
    const modelSelection = { selected: "none" };
    const modelSelectController = modelControlFolder
      .add(modelSelection, "selected", Object.keys(models))
      .name("select model")
      .onChange(selectModel);

    const transformModeParams = { mode: "translate" };
    const transformModeController = modelControlFolder
      .add(transformModeParams, "mode", ["translate", "rotate", "scale"])
      .name("gizmo mode")
      .onChange(setTransformMode);

    const resetActions = {
      reset: () => {
        const name = modelSelection.selected;
        if (name === "none") return;
        const target = models[name];
        const initial = initialTransforms[name];
        target.position.copy(initial.position);
        target.rotation.copy(initial.rotation);
        target.scale.copy(initial.scale);
      },
    };
    modelControlFolder.add(resetActions, "reset").name("reset selected position");

    function setTransformMode(mode) {
      transformModeParams.mode = mode;
      transformModeController.updateDisplay();
      transformControls.setMode(mode);
    }

    function selectModel(name) {
      modelSelection.selected = name;
      modelSelectController.updateDisplay();

      Object.keys(movableModels).forEach((key) => {
        movableModels[key] = key === name;
      });

      const target = models[name];
      if (target) {
        transformControls.attach(target);
        transformControls.enabled = true;
        transformControls.visible = true;
      } else {
        transformControls.detach();
        transformControls.enabled = false;
        transformControls.visible = false;
      }
    }

    // click a mesh to toggle its move control on/off
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    const pickableMeshes = [box, sphere, torus];
    const meshNames = new Map([
      [box, "box"],
      [sphere, "sphere"],
      [torus, "torus"],
    ]);

    let clickStartPos = null;

    const onCanvasPointerDown = (event) => {
      clickStartPos = { x: event.clientX, y: event.clientY };
    };

    const onCanvasPointerUp = (event) => {
      if (!clickStartPos) return;
      const movedDistance = Math.hypot(
        event.clientX - clickStartPos.x,
        event.clientY - clickStartPos.y
      );
      clickStartPos = null;
      if (movedDistance > 5) return; // was a drag (camera orbit / gizmo), not a click

      const rect = canvas.getBoundingClientRect();
      pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNDC, camera);
      const [hit] = raycaster.intersectObjects(pickableMeshes);
      if (!hit) return;

      const name = meshNames.get(hit.object);
      selectModel(name === modelSelection.selected ? "none" : name);
    };

    canvas.addEventListener("pointerdown", onCanvasPointerDown);
    canvas.addEventListener("pointerup", onCanvasPointerUp);

    // keyboard shortcuts for gizmo mode while a model is selected
    const onKeyDown = (event) => {
      if (!transformControls.enabled) return;
      if (event.key === "t") setTransformMode("translate");
      else if (event.key === "r") setTransformMode("rotate");
      else if (event.key === "s") setTransformMode("scale");
    };
    window.addEventListener("keydown", onKeyDown);

    let animationId;
    const clock = new THREE.Clock();
    function tick() {
      stats.begin();

      // update controls for damping
      controls.update();
      pointLightHelper.update();
      directionalLightHelper.update();
      hemisphereLightHelper.update();
      spotLightHelper.update();

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(tick);

      const elapsedTime = clock.getElapsedTime();

      // skip the automatic spin for the model currently being moved
      if (!movableModels.sphere) {
        sphere.rotation.x = 0.1 * elapsedTime;
        sphere.rotation.y = 0.1 * elapsedTime;
      }
      if (!movableModels.torus) {
        torus.rotation.x = 0.1 * elapsedTime;
        torus.rotation.y = 0.1 * elapsedTime;
      }
      if (!movableModels.box) {
        box.rotation.x = 0.1 * elapsedTime;
        box.rotation.y = 0.1 * elapsedTime;
      }

      stats.end();
    }
    tick();

    // cleanup on unmount
    return () => {
      // stop animation
      if (animationId) cancelAnimationFrame(animationId);

      // remove event listeners
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onCanvasPointerDown);
      canvas.removeEventListener("pointerup", onCanvasPointerUp);

      // remove stats panel
      document.body.removeChild(stats.dom);

      // dispose controls and GUI
      controls.dispose();
      transformControls.dispose();
      gui.destroy();

      // dispose material, environment map and renderer
      material.dispose();
      environmentTexture.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas className="webgl"></canvas>
      <div className="tooltip">Click on a model to move it around</div>
    </>
  );
}

export default App;
