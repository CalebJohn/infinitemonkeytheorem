/**
 * @author mrdoob / http://mrdoob.com/
 * Heavily modified by Me
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;
	moveSpeed = 1;
	
	var raycaster = new THREE.Raycaster();
	
	var blocker = document.getElementById( 'blocker' );
	var instructions = document.getElementById( 'instructions' );
	// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	
	if ( havePointerLock ) {
		var element = document.body;
		var pointerlockchange = function ( event ) {
			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
				scope.enabled = true;
				blocker.style.display = 'none';
			} else {
				scope.enabled = false;
				blocker.style.display = 'block';
				instructions.style.display = '';
			}
		};
		var pointerlockerror = function ( event ) {
			instructions.style.display = '';
		};
		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
		instructions.addEventListener( 'click', function ( event ) {
			instructions.style.display = 'none';
			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		}, false );
	} else {
		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}
			
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var canJump = false;
	var velocity = new THREE.Vector3();
	var direction = new THREE.Vector3();
	var lowGravity = false;
	var mass = 10.0;
	
	var toGround = function(pos, collider) {
		raycaster.set(pos, new THREE.Vector3(0, -1, 0));
		var intersects = raycaster.intersectObject( collider, true );
		if ( intersects.length > 0 ) {
			return intersects[0].point.y;
		}
		return -1000;
	};

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	this.dispose = function() {

		document.removeEventListener( 'mousemove', onMouseMove, false );

	};

	document.addEventListener( 'mousemove', onMouseMove, false );

	scope.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();
	
	this.onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true; break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if ( canJump === true ) velocity.y += 35+moveSpeed;
				canJump = false;
				break;
			case 16:
			  moveSpeed = 50;
			  break;
			case 17:
			  lowGravity = lowGravity === false;
			  mass = 1.0;
			  if (lowGravity === false) mass *= 10;
			  break;
			  
		}
	};
	this.onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
			case 16:
			  moveSpeed = 1.0;
			  break;
		}
	};
	
	document.addEventListener( 'keydown', this.onKeyDown, false );
	document.addEventListener( 'keyup', this.onKeyUp, false );
	
	this.update = function( delta, collider) {
	  velocity.x -= velocity.x * 10.0 * delta;
	  velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= 9.8 * mass * delta; // 100.0 = mass
		
		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveLeft ) - Number( moveRight );
		direction.normalize(); // this ensures consistent movements in all directions
		if ( moveForward || moveBackward ) velocity.z -= direction.z * 40.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 40.0 * delta;
					
		this.getObject().translateX( velocity.x * delta * moveSpeed);
		this.getObject().translateY( velocity.y * delta );
		this.getObject().translateZ( velocity.z * delta * moveSpeed);
		var temp = this.getObject().position.clone();
		temp.y = 100;
		var ground = toGround(temp, collider)+0.5;

		if (this.getObject().position.y <= ground) {
		  velocity.y = 0;
		  this.getObject().position.y = ground;
		  canJump = true;
		}
	};
};
