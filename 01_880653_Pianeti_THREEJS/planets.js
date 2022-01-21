/*
                     PLANETS THREEJS

                        ,MMM8&&&.
                    _..MMMMM88&&&&..._
                .::'''MMMMM88&&&&&&'''::.
                ::    MMMMM88&&&&&&     ::
                '::...MMMMM88&&&&&&....::'
                  `''''MMMMM88&&&&''''`
                        'MMM8&&&'

              Author: Leonardo Fasolato 880653

*/
function generatePlanet(radius, texture, parent, rotation, revolution, traslation, light_map, ring_texture) {
  let planet_geometry = new THREE.SphereGeometry(radius);

  //Phong -> better texture surface => Phong > Lambert > basic
  let planet_material = new THREE.MeshPhongMaterial({
    map: texture,
    emissiveMap: light_map ? light_map : null,
    emissive: light_map ? 'white' : null
  });

  let planet = new THREE.Mesh(planet_geometry, planet_material);

  //all planets excluding sun
  if (light_map == null) {
    planet.castShadow = true;
    planet.receiveShadow = true;
  }

  //ring for saturn
  if (ring_texture) {
    let ring = new THREE.RingBufferGeometry(7, 8.5, 100);
    let material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: ring_texture, transparent: true });
    let saturn_ring = new THREE.Mesh(ring, material);
    saturn_ring.rotateX(2.0);
    saturn_ring.castShadow = true;
    saturn_ring.receiveShadow = true;
    planet.add(saturn_ring);
  }
  
  planet.matrixAutoUpdate = false;
  
  // additional fields
  planet.rot = rotation;
  planet.rev = revolution;
  planet.tras = traslation;

  parent.add(planet);
  return planet;
}


function renderPlanet(render_scene, planet) {
  let Rotation = new THREE.Matrix4().makeRotationY(planet.rot * render_scene.time);
  let Revolution = new THREE.Matrix4().makeRotationY(planet.rev * render_scene.time);
  let Traslation = new THREE.Matrix4().makeTranslation(planet.tras, 0, 0);
  planet.matrix = new THREE.Matrix4().multiplyMatrices(Rotation, Traslation).multiply(Revolution);
}

function createLights(scene) {
  //Sun
  let sun_light = new THREE.PointLight('white', 1.2);
  sun_light.castShadow = true;
  scene.add(sun_light);
  
  //Ambient
  let ambientlight = new THREE.AmbientLight('white', 0.5);
  scene.add(ambientlight);
}

//used to generate the glow effect for the sun
function sunBloomGenerator(scene, camera, renderer) {
  const renderScene = new THREE.RenderPass(scene, camera);
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0;
  bloomPass.strength = 2; //intensity of glow
  bloomPass.radius = 0;
  const bloomComposer = new THREE.EffectComposer(renderer);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.renderToScreen = true;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);
  return bloomComposer;
}

function Galaxy(scene) {
  // galaxy geometry
  const starGeometry = new THREE.SphereGeometry(500, 64, 64);
  // galaxy material
  const starMaterial = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture("./textures/galaxy1.png"),
    side: THREE.BackSide,
    transparent: true,
  });
  // galaxy mesh
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  scene.add(starMesh);
  return starMesh;
}

window.onload = function () {
  
  //Scene 
  let scene = new THREE.Scene();
  let bloom_scene = new THREE.Scene();

  //WebGL render
  let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor('black', 0.00);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);

  //Galaxy
  starMesh = Galaxy(scene);

  //Lights
  createLights(scene);

  //Camera and setter
  let camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 200;
  camera.position.y = 30;
  camera.rotateX(-0.5);
  camera.far = 20000;

  //bloom renderer
  bloomComposer = sunBloomGenerator(scene, camera, renderer);

  //controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  //Sun
  let sun_texture = new THREE.TextureLoader().load('./textures/sun.jpg');
  let sun = generatePlanet(13, sun_texture, scene, 0, 0, 0, sun_texture);
  sun.layers.enable(1); //needed for bloomComposer rendering

  //Mercury
  let mercury = generatePlanet(1, new THREE.TextureLoader().load('./textures/mercury.jpg'), sun, 0.0010, 0.0037, 30); //Attached to sun

  //Venus
  let venus = generatePlanet(2, new THREE.TextureLoader().load('./textures/venus.jpg'), sun, 0.0014, 0.00148, 40); ///Attached to sun

  //Earth + moon
  let earth = generatePlanet(2, new THREE.TextureLoader().load('./textures/earth.jpg'), sun, 0.0011, 0.00264, 50); //Attached to sun
  let moon = generatePlanet(0.75, new THREE.TextureLoader().load('./textures/moon.jpg'), earth, 0.0013, 0.00234, 3); //Attached to earth

  //Mars
  let mars = generatePlanet(1.5, new THREE.TextureLoader().load('./textures/mars.jpg'), sun, 0.0011, 0.001, 60); //Attached to mars

  //Jupiter + ganymede
  let jupiter = generatePlanet(6, new THREE.TextureLoader().load('./textures/jupiter.jpg'), sun, 0.00124, 0.00157, 80); //Attached to sun
  let ganymede = generatePlanet(1, new THREE.TextureLoader().load('./textures/ganymede.jpg'), jupiter, 0.002, 0.0037, 10); //Attached to jupiter

  //Saturn + ring
  let ring_texture = new THREE.TextureLoader().load("./textures/ring.png")
  let saturn = generatePlanet(5, new THREE.TextureLoader().load('./textures/saturn.jpg'), sun, 0.001324, 0.00124, 100, null, ring_texture); //Attached to sun

  //Uranus
  let uranus = generatePlanet(4, new THREE.TextureLoader().load('./textures/uranus.jpg'), sun, 0.001423, 0.0024, 120); //Attached to sun

  //Neptune
  let neptune = generatePlanet(4, new THREE.TextureLoader().load('./textures/neptune.jpg'), sun, 0.001142, 0.0035, 130); //Attached to sun

  //collection
  let planets = [mercury, venus, earth, moon, mars, jupiter, ganymede, saturn, uranus, neptune];

  //Rendering and animations
  let render_scene = function () {

    let now = Date.now();
    let dt = now - (render_scene.time || now);
    render_scene.time = now;

    starMesh.rotation.y += 0.001;
    controls.update();
    
    //updates all the planets
    planets.forEach(planet => renderPlanet(render_scene, planet));

    //I need to use layer to render the bloom only on the sun
    renderer.clear();
    camera.layers.set(1); // go to sun layer
    bloomComposer.render(); // render bloom on sun
    renderer.clearDepth();
    camera.layers.set(0);// switch to general layer
    renderer.render(scene, camera);

    requestAnimationFrame(render_scene);
  }
  render_scene();
}