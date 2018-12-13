Title: Endless Forest
Date: 2018-06-24 11:26
Category: Studies
Tags: threejs, noise, procedural
Keywords: perlin noise, trees, flat shading, procedural
Authors: Clay
Summary: Trying to create an endless forest full of vistas

<style>

	#blocker {
		position: fixed;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0.5);
		top: 0;
  	left: 0;
  	right: 0;
  	bottom: 0;
  	z-index: 3;
	}
	#instructions {
		width: 100%;
		height: 100%;
		display: -webkit-box;
		display: -moz-box;
		display: box;
		-webkit-box-orient: horizontal;
		-moz-box-orient: horizontal;
		box-orient: horizontal;
		-webkit-box-pack: center;
		-moz-box-pack: center;
		box-pack: center;
		-webkit-box-align: center;
		-moz-box-align: center;
		box-align: center;
		color: #ffffff;
		text-align: center;
		cursor: pointer;
	}
	#top {
  position: fixed;
  width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 2;
  }
	div {
		user-select: auto;
	}
	canvas {
		user-select: none;
	}
</style>
<div id="top" style="display:none">
</div>

<script src="scripts/three.min.js"></script>
<script src="scripts/EF_include/hsluv.min.js"></script>
<script src="scripts/EF_include/PointerLockControls.js"></script>
<script src="scripts/EF_include/DeviceOrientationControls.js"></script>
<script src="scripts/EF_include/perlin.js"></script>
<script src="scripts/EF_include/groundShader.js"></script>
<script src="scripts/EF_include/instanceShader.js"></script>
<script src="scripts/EF_include/infiniteTerrain.js"></script>
<script src="scripts/EF_include/Flora.js"></script>
<!--Seeded RNG from http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html-->
<script src="scripts/EF_include/seedrandom.min.js"></script>
<script src="scripts/EF_include/tween.min.js"></script>
<script src="scripts/EF_include/ConvexGeometry.js"></script>
<script src="scripts/EF_include/QuickHull.js"></script>

<script>
  var clock, controls, scene, renderer, camera, terrain, deltas, waterPlane;
  var init = function() {
		clock = new THREE.Clock();
    clock.start();
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xaaaaff);
		scene.fog = new THREE.FogExp2( new THREE.Color(0xaaaaff), 0.003 );

		camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000 );

		renderer = new THREE.WebGLRenderer({antialias: true && quality.medium}); //move to SMAA for low end computers
		renderer.setSize( window.innerWidth, window.innerHeight );

		document.getElementById("top").appendChild( renderer.domElement );
		window.addEventListener( 'resize', onWindowResize, false );
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
      // Take the user to a different screen here.
      controls = new THREE.DeviceOrientationControls(camera);
      var blocker = document.getElementById( 'blocker' );
      blocker.remove();
			var list = document.getElementsByTagName("div");
			for (var i=0;i<list.length;i++) {
				list[i].style.userSelect = "none";
			}
    } else {
		  controls = new THREE.PointerLockControls( camera );

		  scene.add( controls.getObject() );
    }
		terrain = new Terrain(360, 10, camera, scene);
		
		//place a single blue plane in the scene that moves with the camera to act as water
		var waterGeometry = new THREE.PlaneBufferGeometry(720, 720);
    var waterMaterial = new THREE.MeshBasicMaterial( {color: 0x4477aa} );
    waterPlane = new THREE.Mesh( waterGeometry, waterMaterial );
    scene.add( waterPlane );
    waterPlane.rotateX(-Math.PI*0.5);
    waterPlane.position.y = -30;
    
    //just for debugging terrain
    //var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
    //scene.add( directionalLight );

		  //this requires:
		    //c) a plant generator for each tile //including grass, flowers, maybe shrubs
		      //ii) flowers can be done same as rock and trees
		    //h) Monuments that have a random chance at spawning

		deltas = [];
		
		controls.update(0, terrain.group);
    terrain.update( controls.getObject().position.clone() );

	  renderer.render(scene, camera);

	  animate();
  }
  function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
  
	var animate = function (time) {
	  requestAnimationFrame( animate );
    var delta = clock.getDelta();
	  controls.update( delta , terrain.group);
		if (controls.enabled) {
      terrain.update( controls.getObject().position.clone() );
      TWEEN.update(time);
      
      waterPlane.position.x = controls.getObject().position.x;
      waterPlane.position.z = controls.getObject().position.z;

			renderer.render(scene, camera);
			
			//record frame time
			deltas.push(delta);
			var ft = 0;
			for (let i=0;i<deltas.length;i++) {
			  ft+=deltas[i];
			}
			ft/=deltas.length;
			while (deltas.length > 100) { deltas.pop(); }
			//console.log(ft*1000);
	  }
	};
	
	var setQuality = function(it) {
    blocker.style.display = "block";
    window.quality = {low: true, medium: false, high:false};
    if (it.value != "Low") {
      window.quality.medium = true;
      if (it.value == "High") {
        window.quality.high = true;
      }
    }
    window.low_gravity = document.getElementById( 'gravity' ).checked;
    window.free_fly = document.getElementById( 'flight' ).checked;
    it.parentNode.remove();
    document.getElementById("top").style.display = '';
    init();
	};
</script>
<div>
  <p>Select Options:</p>
  <input type="radio" id="gravity" name="gravity" value="on">
  <label for="gravity">Low-Gravity</label>
  <input type="radio" id="flight" name="flight" value="on">
  <label for="flight">Free Fly</label>
  <p>Select Desired Quality:</p>
  <input type="button" id="Low"
   name="contact" value="Low" onclick="setQuality(this)">
  <input type="button" id="Medium"
   name="contact" value="Medium" onclick="setQuality(this)">
  <input type="button" id="High"
   name="contact" value="High" onclick="setQuality(this)">
   
</div>
<!--Used directly from the threejs pointer lock control example. https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html-->
<div id="blocker" style="display:none">
	<div id="instructions">
		<span style="font-size:40px">Click to play</span>
		<br />
		(W, A, S, D = Move, SPACE = Jump, MOUSE = Look around)
	</div>

</div>

Trying to put together a few ideas I have had going for awhile.
