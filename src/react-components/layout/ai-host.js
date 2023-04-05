import * as HOST from "@amazon-sumerian-hosts/three/dist/host.three";
export function AIHost() {
  const speakers = new Map([["Luke", undefined]]);
  const renderFn = [];
  async function main() {
    // Define the glTF assets that will represent the host
    const characterFile1 = "./src/assets/models/luke/luke.gltf";
    const animationPath1 = "./src/assets/models/luke/animation";
    const animationFiles = [
      "stand_idle.glb",
      "lipsync.glb",
      "gesture.glb",
      "emote.glb",
      "face_idle.glb",
      "blink.glb",
      "poi.glb"
    ];
    const gestureConfigFile = "gesture.json";
    const poiConfigFile = "poi.json";
    const audioAttachJoint1 = "chardef_c_neckB"; // Name of the joint to attach audio to
    const lookJoint1 = "charjx_c_look"; // Name of the joint to use for point of interest target tracking
    const voiceEngine = "neural";
    const voice1 = "Luke";
    // Set up the scene and host
    // eslint-disable-next-line no-use-before-define
    const { scene, camera, clock } = createScene();
    // eslint-disable-next-line no-use-before-define
    const { character: character1, clips: clips1, bindPoseOffset: bindPoseOffset1 } = await loadCharacter(
      scene,
      characterFile1,
      animationPath1,
      animationFiles
    );

    character1.position.set(-15.7, 0.2, -25.2);
    character1.rotateY(-0.5);

    // Find the joints defined by name
    const audioAttach1 = character1.getObjectByName(audioAttachJoint1);
    const lookTracker1 = character1.getObjectByName(lookJoint1);

    // Read the gesture config file. This file contains options for splitting up
    // each animation in gestures.glb into 3 sub-animations and initializing them
    // as a QueueState animation.
    const gestureConfig1 = await fetch(`${animationPath1}/${gestureConfigFile}`).then(response => response.json());

    // Read the point of interest config file. This file contains options for
    // creating Blend2dStates from look pose clips and initializing look layers
    // on the PointOfInterestFeature.
    const poiConfig1 = await fetch(`${animationPath1}/${poiConfigFile}`).then(response => response.json());

    const [idleClips1, lipsyncClips1, gestureClips1, emoteClips1, faceClips1, blinkClips1, poiClips1] = clips1;
    // eslint-disable-next-line no-use-before-define
    const host1 = createHost(
      character1,
      audioAttach1,
      voice1,
      voiceEngine,
      idleClips1[0],
      faceClips1[0],
      lipsyncClips1,
      gestureClips1,
      gestureConfig1,
      emoteClips1,
      blinkClips1,
      poiClips1,
      poiConfig1,
      lookTracker1,
      bindPoseOffset1,
      clock,
      camera,
      scene
    );
    // Set up each host to look at the other when the other speaks and at the
    // camera when speech ends
    const onHost1StartSpeech = () => {};
    const onStopSpeech = () => {
      host1.PointOfInterestFeature.setTarget(camera);
    };
    host1.listenTo(host1.TextToSpeechFeature.EVENTS.play, onHost1StartSpeech);
    HOST.aws.TextToSpeechFeature.listenTo(HOST.aws.TextToSpeechFeature.EVENTS.stop, onStopSpeech);
    speakers.set(voice1, host1);
  }
  function createScene() {
    // Base scene
    const scene = new THREE.Scene();
    const clock = new THREE.Clock();
    scene.fog = new THREE.Fog(0x33334d, 0, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x33334d);
    renderer.domElement.id = "renderCanvas";
    document.body.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      THREE.MathUtils.radToDeg(0.8),
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Render loop
    function render() {
      requestAnimationFrame(render);

      renderFn.forEach(fn => {
        fn();
      });

      renderer.render(scene, camera);
    }

    render();

    return { scene, camera, clock };
  }

  // Load character model and animations
  async function loadCharacter(scene, characterFile, animationPath, animationFiles) {
    // Asset loader
    const gltfLoader = new THREE.GLTFLoader();

    function loadAsset(loader, assetPath, onLoad) {
      return new Promise(resolve => {
        loader.load(assetPath, async asset => {
          if (onLoad[Symbol.toStringTag] === "AsyncFunction") {
            const result = await onLoad(asset);
            resolve(result);
          } else {
            resolve(onLoad(asset));
          }
        });
      });
    }

    // Load character model
    const { character, bindPoseOffset } = await loadAsset(gltfLoader, characterFile, gltf => {
      // Transform the character
      const character = gltf.scene;
      scene.add(character);

      // Make the offset pose additive
      const [bindPoseOffset] = gltf.animations;
      if (bindPoseOffset) {
        THREE.AnimationUtils.makeClipAdditive(bindPoseOffset);
      }

      // Cast shadows
      character.traverse(object => {
        if (object.isMesh) {
          object.castShadow = true;
        }
      });

      return { character, bindPoseOffset };
    });

    // Load animations
    const clips = await Promise.all(
      animationFiles.map(filename => {
        const filePath = `${animationPath}/${filename}`;

        return loadAsset(gltfLoader, filePath, async gltf => {
          return gltf.animations;
        });
      })
    );

    return { character, clips, bindPoseOffset };
  }

  // Initialize the host
  function createHost(
    character,
    audioAttachJoint,
    voice,
    engine,
    idleClip,
    faceIdleClip,
    lipsyncClips,
    blinkClips,
    poiClips,
    poiConfig,
    lookJoint,
    bindPoseOffset,
    clock,
    camera,
    scene
  ) {
    // Add the host to the render loop
    const host = new HOST.HostObject({ owner: character, clock });
    // eslint-disable-next-line no-undef
    renderFn.push(() => {
      host.update();
      if (host.visemeHandler) {
        host.visemeHandler.CheckForViseme();
      }
    });

    // Set up text to speech
    const audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    host.addFeature(HOST.aws.TextToSpeechFeature, false, {
      listener: audioListener,
      attachTo: audioAttachJoint,
      voice,
      engine
    });

    // Set up animation
    host.addFeature(HOST.anim.AnimationFeature);

    // Base idle
    host.AnimationFeature.addLayer("Base");
    host.AnimationFeature.addAnimation("Base", idleClip.name, HOST.anim.AnimationTypes.single, { clip: idleClip });
    host.AnimationFeature.playAnimation("Base", idleClip.name);

    // Face idle
    host.AnimationFeature.addLayer("Face", {
      blendMode: HOST.anim.LayerBlendModes.Additive
    });
    THREE.AnimationUtils.makeClipAdditive(faceIdleClip);
    host.AnimationFeature.addAnimation("Face", faceIdleClip.name, HOST.anim.AnimationTypes.single, {
      clip: THREE.AnimationUtils.subclip(faceIdleClip, faceIdleClip.name, 1, faceIdleClip.duration * 30, 30)
    });
    host.AnimationFeature.playAnimation("Face", faceIdleClip.name);

    // Blink
    host.AnimationFeature.addLayer("Blink", {
      blendMode: HOST.anim.LayerBlendModes.Additive,
      transitionTime: 0.075
    });
    blinkClips.forEach(clip => {
      THREE.AnimationUtils.makeClipAdditive(clip);
    });
    host.AnimationFeature.addAnimation("Blink", "blink", HOST.anim.AnimationTypes.randomAnimation, {
      playInterval: 3,
      subStateOptions: blinkClips.map(clip => {
        return {
          name: clip.name,
          loopCount: 1,
          clip
        };
      })
    });
    host.AnimationFeature.playAnimation("Blink", "blink");

    // Talking idle
    host.AnimationFeature.addLayer("Talk", {
      transitionTime: 0.75,
      blendMode: HOST.anim.LayerBlendModes.Additive
    });
    host.AnimationFeature.setLayerWeight("Talk", 0);
    const talkClip = lipsyncClips.find(c => c.name === "stand_talk");
    lipsyncClips.splice(lipsyncClips.indexOf(talkClip), 1);
    host.AnimationFeature.addAnimation("Talk", talkClip.name, HOST.anim.AnimationTypes.single, {
      clip: THREE.AnimationUtils.makeClipAdditive(talkClip)
    });
    host.AnimationFeature.playAnimation("Talk", talkClip.name);

    // Viseme poses
    host.AnimationFeature.addLayer("Viseme", {
      transitionTime: 0.12,
      blendMode: HOST.anim.LayerBlendModes.Additive
    });
    host.AnimationFeature.setLayerWeight("Viseme", 0);

    window.lipsyncClips = lipsyncClips;

    // Slice off the reference frame
    const blendStateOptions = lipsyncClips.map(clip => {
      THREE.AnimationUtils.makeClipAdditive(clip);
      return {
        name: clip.name,
        clip: THREE.AnimationUtils.subclip(clip, clip.name, 1, 2, 30),
        weight: 0
      };
    });
    host.AnimationFeature.addAnimation("Viseme", "visemes", HOST.anim.AnimationTypes.freeBlend, { blendStateOptions });
    host.AnimationFeature.playAnimation("Viseme", "visemes");

    // POI poses
    poiConfig.forEach(config => {
      host.AnimationFeature.addLayer(config.name, {
        blendMode: HOST.anim.LayerBlendModes.Additive
      });

      // Find each pose clip and make it additive
      config.blendStateOptions.forEach(clipConfig => {
        const clip = poiClips.find(clip => clip.name === clipConfig.clip);
        THREE.AnimationUtils.makeClipAdditive(clip);
        clipConfig.clip = THREE.AnimationUtils.subclip(clip, clip.name, 1, 2, 30);
      });

      host.AnimationFeature.addAnimation(config.name, config.animation, HOST.anim.AnimationTypes.blend2d, {
        ...config
      });

      host.AnimationFeature.playAnimation(config.name, config.animation);

      // Find and store reference objects
      config.reference = character.getObjectByName(config.reference.replace(":", ""));
    });

    // Apply bindPoseOffset clip if it exists
    if (bindPoseOffset !== undefined) {
      host.AnimationFeature.addLayer("BindPoseOffset", {
        blendMode: HOST.anim.LayerBlendModes.Additive
      });
      host.AnimationFeature.addAnimation("BindPoseOffset", bindPoseOffset.name, HOST.anim.AnimationTypes.single, {
        clip: THREE.AnimationUtils.subclip(bindPoseOffset, bindPoseOffset.name, 1, 2, 30)
      });
      host.AnimationFeature.playAnimation("BindPoseOffset", bindPoseOffset.name);
    }

    // Set up Lipsync
    const visemeOptions = {
      layers: [{ name: "Viseme", animation: "visemes" }]
    };
    const talkingOptions = {
      layers: [
        {
          name: "Talk",
          animation: "stand_talk",
          blendTime: 0.75,
          easingFn: HOST.anim.Easing.Quadratic.InOut
        }
      ]
    };
    host.addFeature(HOST.LipsyncFeature, false, visemeOptions, talkingOptions);

    // Set up Point of Interest
    host.addFeature(
      HOST.PointOfInterestFeature,
      false,
      {
        target: camera,
        lookTracker: lookJoint,
        scene
      },
      {
        layers: poiConfig
      },
      {
        layers: [{ name: "Blink" }]
      }
    );

    host.audioListener = audioListener;
    return host;
  }
  main();
}
