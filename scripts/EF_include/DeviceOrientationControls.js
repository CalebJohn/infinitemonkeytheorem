/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this.alpha = 0;
	this.alphaOffsetAngle = 0;
	this.forward = false;
	
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var canJump = false;
	var velocity = new THREE.Vector3();
	var direction = new THREE.Vector3();
	var lowGravity = false;
	var mass = 10.0;
	
	this.toGround = function(pos, collider) {
	  var raycaster = new THREE.Raycaster();
		raycaster.set(pos, new THREE.Vector3(0, -1, 0));
		var intersects = raycaster.intersectObject( collider, true );
		if ( intersects.length > 0 ) {
			return intersects[0].point.y;
		}
		return -1000;
	};
	
	this.getObject = function() {
	  return scope.object;
	};


	var onDeviceOrientationChangeEvent = function( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function() {

		scope.screenOrientation = window.orientation || 0;

	};
	var touched = function() {
		scope.forward = true;
	};

	var lifted = function() {
		scope.forward = false;
	};

	var moved = function() {
		//update direction somehow
		this.forward = true;
	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function() {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler ); // orient the device

			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
		window.addEventListener( 'touchstart', touched, false);
		window.addEventListener( 'touchend', lifted, false);
		window.addEventListener( 'touchmove', moved, false);

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};
	


	this.update = function(delta, collider) {

		if ( scope.enabled === false ) return;

		var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
		var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
		var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
		this.alpha = alpha;
		if (scope.forward) {
			scope.object.translateZ(-0.1);
		}
    if (!(free_fly)) {
		  var temp = this.getObject().position.clone();
		  temp.y = 100;
      var ground = scope.toGround(temp, collider)+0.5;
		  this.getObject().position.y = ground;
    }
	};

	this.updateAlphaOffsetAngle = function( angle ) {

		this.alphaOffsetAngle = angle;
		this.update();

	};

	this.dispose = function() {

		this.disconnect();

	};

	this.connect();

};
