import * as THREE from "three";
import "./App.css";
import { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import GUI from "lil-gui";

function App() {
  useEffect(() => {
    const canvas = document.querySelector("canvas.webgl");
    const scene = new THREE.Scene();

    //? debug ui
    const gui = new GUI();

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const geomtery = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial();
    material.side = THREE.DoubleSide;

    //? mehses
    const box = new THREE.Mesh(geomtery, material);
    scene.add(box);

    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphere = new THREE.Mesh(sphereGeometry, material);
    scene.add(sphere);
    sphere.position.x = 1.5;

    const torusGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
    const torus = new THREE.Mesh(torusGeometry, material);
    torus.position.x = -1.5;
    scene.add(torus);

    const planeGeometry = new THREE.PlaneGeometry(10, 10, 100, 100);
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    scene.add(plane);

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
    pointLightFolder.addColor(pointLight, "color");
    pointLightFolder.add(pointLight, "intensity", 0, 5, 0.01);
    const pointLightPosition = pointLightFolder.addFolder("position");
    pointLightPosition.add(pointLight.position, "x", -10, 10);
    pointLightPosition.add(pointLight.position, "y", -10, 10);
    pointLightPosition.add(pointLight.position, "z", -10, 10);

    //> directinal light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.visible = false;
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

    let animationId;
    const clock = new THREE.Clock();
    function tick() {
      // update controls for damping
      controls.update();
      pointLightHelper.update();
      directionalLightHelper.update();
      hemisphereLightHelper.update();
      spotLightHelper.update();

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(tick);

      const elapsedTime = clock.getElapsedTime();

      sphere.rotation.x = 0.1 * elapsedTime;
      torus.rotation.x = 0.1 * elapsedTime;
      box.rotation.x = 0.1 * elapsedTime;

      sphere.rotation.y = 0.1 * elapsedTime;
      torus.rotation.y = 0.1 * elapsedTime;
      box.rotation.y = 0.1 * elapsedTime;
    }
    tick();

    // cleanup on unmount
    return () => {
      // stop animation
      if (animationId) cancelAnimationFrame(animationId);

      // remove event listeners
      window.removeEventListener("resize", onResize);

      // dispose controls and GUI
      controls.dispose();

      // dispose renderer
      renderer.dispose();
    };
  }, []);

  return <canvas className="webgl"></canvas>;
}

export default App;
