//All calls to random should be restricted to the inside of flora
//This means that this should extend to sky/ground color
//or that everything should be wrapped into another thing and the values should be set before flora is called
function Flora(tx, ty, tileSize, ground, heightMap, mapRes) {
  THREE.Group.call(this);
  Math.seedrandom(tx.toString()+ty.toString());
  
  this.populated = false;
  
  //Here assign the proper colours to the shader
	this.uni = THREE.UniformsUtils.clone(THREE.instanceShader.uniforms);
  //var hue = Math.random()*360;
  //var s = Math.random()*40+40;
  //var r = Math.random()*50+10;//arc for adjacency;
  var scale = 0.0005;
  var hue = noise.perlin2(tx*scale+100.7382, ty*scale)*240+180;
  var s = noise.perlin2(tx*scale, ty*scale+83.235)*25+60;
  var r = noise.perlin2(tx*scale, ty*scale-973.483)*30+35;
  
  //starting color
  this.uni.leaves.value = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue, s, 70]));
  //alternate leaf colors
  this.uni.complement1.value = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue-r, s, 60]));
  this.uni.complement2.value = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue+r, s, 60]));

  //  #Ground Color
  this.groundColor = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue, s, 40]));
  this.uni.grass.value = this.groundColor;
  
  //color of random rocks
  this.uni.rock.value = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue+90, s*0.5, 70]));
  //feature Color
  this.uni.flower.value = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue+180, Math.max(1.0, s+0.2), 80]));

  //alternate features
  this.uni.highlight1.value = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue+180-r, s, 70]));
  this.uni.highlight2.value = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue+180+r, s, 70]));

  //bark color
  this.uni.bark.value = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue+180, s, 30]));
  
  //sky color
  this.sky = new THREE.Color().fromArray(window.hsluv.hsluvToRgb([hue+90, s+10, 80]));
  
  this.imat = new THREE.ShaderMaterial( {
  	  uniforms: this.uni,
      vertexShader:THREE.instanceShader.vertexShader,
      fragmentShader: THREE.instanceShader.fragmentShader,
      vertexColors: THREE.FaceColors,
      flatShading: true,
      fog: true,
      side: THREE.DoubleSide
  	});
  
	var makeTri = function(w, l) {
	  var geo = new THREE.Geometry();
	  var sqrt3 =  1.73205080757;
	  geo.vertices.push(
      new THREE.Vector3( 0, 0, (sqrt3/3)*l ),
      new THREE.Vector3(  -0.5*w,     0,  (-sqrt3/6)*l ),
      new THREE.Vector3(  0.5*w, 0, (-sqrt3/6)*l )
    );
    geo.faces.push( new THREE.Face3( 0, 1, 2 ) );
    return geo;
	};

	var map = function(pos) {
	  var p = pos.clone().divideScalar(mapRes).floor().multiplyScalar(mapRes);
	  var f = pos.clone().sub(p).divideScalar(mapRes);
	  var h1, h2, h3;
	  var p1, p2, p3;
	  var triangle;
	  var bary;
	  if (f.y>1.0-f.x) {
	    p1 = new THREE.Vector3(p.x+mapRes, p.y+mapRes, 0);
	    p2 = new THREE.Vector3(p.x, p.y+mapRes, 0);
	    p3 = new THREE.Vector3(p.x+mapRes, p.y, 0);
	    triangle = new THREE.Triangle(p1, p2, p3);
	    bary = triangle.barycoordFromPoint(new THREE.Vector3(pos.x, pos.y, 0));
	    h1 = heightMap(p.x+mapRes, p.y+mapRes, mapRes);
	    h2 = heightMap(p.x, p.y+mapRes, mapRes);
	    h3 = heightMap(p.x+mapRes, p.y, mapRes);
	  } else {
	    p1 = new THREE.Vector3(p.x+mapRes, p.y, 0);
	    p2 = new THREE.Vector3(p.x, p.y, 0);
	    p3 = new THREE.Vector3(p.x, p.y+mapRes, 0);
	    triangle = new THREE.Triangle(p1, p2, p3);
	    bary = triangle.barycoordFromPoint(new THREE.Vector3(pos.x, pos.y, 0));
	    h1 = heightMap(p.x+mapRes, p.y, mapRes);
	    h2 = heightMap(p.x, p.y, mapRes);
	    h3 = heightMap(p.x, p.y+mapRes, mapRes);
	  }
	  var mx = h3;
	  var mn = h3;
	  var mxp = p3;
	  var mnp = p3;
	  if (h1>mx) {mx = h1; mxp = p1;}
	  if (h2>mx) {mx = h2; mxp = p2;}
	  if (h1<mn) {mn = h1; mnp = p1;}
	  if (h2<mn) {mn = h2; mnp = p2;}
	  return {height: h1*bary.x+h2*bary.y+h3*bary.z, slope: mx-mn, gradient: mxp.clone().sub(mnp).normalize()};
	};
	
  this.addTree = function(color) {
	  //TODO add some randomness to these variables to get something good going on
	  //TODO add variables to control branch direction, number branches, etc.
	    //This should tie into quality settings
    var trunk;
    var nodes = [];
    if (quality.medium) {
			var att = 0.5;
			var latt = 0.75;
			var length = 2+Math.random()*3;
			var rad = 0.15+Math.random()*0.1;
			var num_segments = 3;
			var cyl = new THREE.CylinderGeometry( rad*att, rad, length, 4, 1, true );
			var stack = [];
			stack.push(new THREE.Matrix4().makeTranslation(0, -0.5*length, 0));
			trunk = new THREE.Geometry();//cyl.clone();
			//trunk.applyMatrix(stack[0]);
			var cube;

			var branch = function(depth, Y){
			  var local = stack[0].clone();
			  local.multiply(new THREE.Matrix4().makeTranslation(0, 0.5*length, 0));
			  local.multiply(new THREE.Matrix4().makeScale(att, latt, att));
			  var Z = -Math.PI*0.4*Math.random();
			  local.multiply(new THREE.Matrix4().makeRotationY(Y));
			  local.multiply(new THREE.Matrix4().makeRotationZ(Z));
			  local.multiply(new THREE.Matrix4().makeTranslation(0, 0.5*length, 0));
			  stack.unshift(local);

			  geo = cyl.clone();
			  geo.applyMatrix(stack[0]);
			  trunk.merge(geo);
			  if (depth>0) {
			    var num_branches = 1+Math.random()*1*(((depth-1)/2));
			    var Ya = [-Math.PI*Math.random(), Math.PI*Math.random()];
			    for (let j=0;j<num_branches;j++) {
			      branch(depth-1, Ya[j]);
			      stack.shift();
			    }
			  } else {
			    nodes.push(trunk.vertices[trunk.vertices.length-3]);
			  }
			  if (Math.random()>0.7) {
			    nodes.push(trunk.vertices[trunk.vertices.length-3]);
			  }
			};
			var fYa = [-Math.PI*Math.random()*0.667, Math.PI*Math.random()*0.667,Math.PI*0.667+0.667*Math.PI*Math.random()];
			for (let j=0;j<Math.random()*3;j++) {
        branch(num_segments, fYa[j]);
        stack.shift();
      }
	  } else {
	    var height = Math.random()*4+3
	    var trunk = new THREE.CylinderGeometry(0.005*height, 0.017*height, height, 4, 1, true);
  	  trunk.translate(0,height*0.5,0);
  	  nodes.length = 20;
	  }
  	//add 20 leaf planes
  	var leaves = new THREE.Geometry();
  	for (let i =0;i<nodes.length;i++) {
  		var pg = makeTri( 4.0, 4.0);
  		var h = Math.random();
  		pg.scale(1-h*0.7, 1, 1-h*0.7);
  		pg.rotateY(Math.random()*Math.PI*2);
  		pg.rotateX(Math.random()*1.0-0.5);
  		pg.rotateZ(Math.random()*1.0-0.5);
  		if (quality.medium) {
  		  pg.translate(nodes[i].clone().x, nodes[i].clone().y, nodes[i].clone().z);

  		} else {
  		  pg.translate(0, h*height*0.5+height*0.5, 0);
      }
  		leaves.merge(pg);
  	}
  	
  	var tree = new THREE.InstancedBufferGeometry().fromGeometry(leaves);
  	tree.removeAttribute("normal");
  	tree.removeAttribute("color");
  	
  	var ll = leaves.vertices.length;
  	var tl = trunk.faces.length;
  	var pal = new Float32Array(ll+tl*3);
  	pal.fill(color);
  
  	var verts = new Float32Array(ll*3+tl*9);
  	//replace these with THREE.BufferGeometryUtils.mergeBufferGeometries()
  	//add pal as an attribute to each when creating
  	//and change the egeneration into buffer geometries
  	//make sure to set up a timer before doing this so speed can be compared
  	//copy over leaves
  	for (let i=0;i<ll*3;i++) {
  	  verts[i] = tree.attributes.position.array[i];
  	}
  	//copy over trunk of tree
  	for (let i=ll*3,j=0, k=ll; i<ll*3+tl*9; i+=9,j++, k+=3) {
  	  pal[k] = 1;
  	  pal[k+1] = 1;
  	  pal[k+2] = 1;
  	  var vec = trunk.faces[j];
  	  verts[i] = trunk.vertices[vec.a].x;
  	  verts[i+1] = trunk.vertices[vec.a].y;
  	  verts[i+2] = trunk.vertices[vec.a].z;
  	  verts[i+3] = trunk.vertices[vec.b].x;
  	  verts[i+4] = trunk.vertices[vec.b].y;
  	  verts[i+5] = trunk.vertices[vec.b].z;
  	  verts[i+6] = trunk.vertices[vec.c].x;
  	  verts[i+7] = trunk.vertices[vec.c].y;
  	  verts[i+8] = trunk.vertices[vec.c].z;
  	}
  
  	tree.removeAttribute("position");
    tree.addAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  	tree.addAttribute("palette", new THREE.Float32BufferAttribute(pal, 1));
  	return tree;
	};
	
	this.addTrees = function(color, groups, density) {
	  var tree = this.addTree(color);
  	//define a max number of trees that does not have to be reached
  	//each clump should have a density variable
  	//then I can make it responsive to other factors height, water, etc.
  	var ipos = [];
  	for (let i=0;i<groups;i++) {
  	  var radius = (Math.random()*0.2+0.1)*tileSize;
  	  var gpos = new THREE.Vector2(radius+Math.random()*(tileSize-radius*2), radius+Math.random()*(tileSize-radius*2));//constraint this to be within tile more
  	  for (let j=0;j<density;j++) {
  	    var angle = Math.random()*Math.PI*2;
  	    var dist = Math.sqrt(Math.random())*radius*(0.6+0.4*noise.simplex2(angle*0.5, 0.1*gpos.x+gpos.y));
  	    var pos = new THREE.Vector2(Math.sin(angle)*dist, Math.cos(angle)*dist).add(gpos);
  	    var pos2 = pos.clone().add(new THREE.Vector2(tx, ty));
  	    var height = map(pos2);
  	    if (height.height >-30 && height.slope <15) {
  	      ipos.push(pos.x, height.height, pos.y, Math.random()*Math.PI*2);
  	    }
  	  }
  	}
  	
  	tree.addAttribute( 'ipos', new THREE.InstancedBufferAttribute( new Float32Array( ipos ), 4 ) );
  	
  	this.trees = new THREE.Mesh(tree, this.imat);
  	this.add(this.trees);
  	//have to custom set bounding sphere for instances//radius = width*sqrt(2)
  	this.trees.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), tileSize*1.44);
	};
	
	this.addRocks = function() {
	  //Now generate rock geometry
  	//the number of points should be variable
  	var rockpts = []
  	var min = 1;
    for (let i=0;i<20;i++) {
    var pnt = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1);
  	  if (pnt.lengthSq()<1) {
  	    rockpts.push(pnt);
  	    min = Math.min(pnt.y, min);
  	  }
  	}
  	
    if (rockpts.length>4) {
    	var rockGeo = new THREE.ConvexBufferGeometry(rockpts);
    	var rock = new THREE.InstancedBufferGeometry();
    	rock.attributes.position = rockGeo.attributes.position;
    	rock.removeAttribute("normal");
    	rock.removeAttribute("color");
    	var rpal = new Float32Array(rock.attributes.position.array.length);
    	rpal.fill(3);
    	rock.addAttribute("palette", new THREE.Float32BufferAttribute(rpal, 1));
  
    	var ripos = [];
  	  for (let j=0;j<250;j++) {
  	    var pos = new THREE.Vector2(Math.random()*tileSize, Math.random()*tileSize);
  	    var pos2 = pos.clone().add(new THREE.Vector2(tx, ty));
  	    var height = map(pos2);
  	    if (height.height >-30 && height.height<-10 && height.slope < 10) {
  	      ripos.push(pos.x, height.height-min-0.2, pos.y, Math.random()*Math.PI*2);
  	    }
  	  }
    	
    	rock.addAttribute( 'ipos', new THREE.InstancedBufferAttribute( new Float32Array( ripos ), 4 ) );
    	
  	  this.rocks = new THREE.Mesh(rock, this.imat);
  	  this.add(this.rocks);
      this.rocks.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), tileSize*1.44);
    }
	};
	
	this.addGrass = function() {
    //make single blade archetype
    var blade = new THREE.InstancedBufferGeometry();
    var sqrt3 =  1.73205080757;
    var w = 0.3;
    var l = 0.5;
    var bgeo = new THREE.Geometry();
    for (let i=0;i<15;i++) {
      var pg = makeTri( 0.3,0.7);
      pg.rotateX(Math.random()*1.0-0.5-Math.PI*0.5);
  		pg.rotateY(Math.random()*Math.PI*2);
  		pg.translate((Math.random()-0.5)*1.5, 0.2, (Math.random()-0.5)*1.5);
  		bgeo.merge(pg);
  	}
    
    blade = blade.fromGeometry(bgeo);
  	blade.removeAttribute("normal");
  	blade.removeAttribute("color");
  	var bpal = new Float32Array(blade.attributes.position.array.length);
  	bpal.fill(5);
  	blade.addAttribute("palette", new THREE.Float32BufferAttribute(bpal, 1));

  	var bipos = [];
    for (let i=0;i<5;i++) {
      var radius = (Math.random()*0.1+0.2)*tileSize;
      var gpos = new THREE.Vector2(Math.random()*(tileSize-radius), Math.random()*(tileSize-radius));//constraint this to be within tile more
      for (let j=0;j<500;j++) {
        var pos = new THREE.Vector2(Math.random()*radius, Math.random()*radius).add(gpos);
        var pos2 = pos.clone().add(new THREE.Vector2(tx, ty));
        var height = map(pos2);
        if (height.height >-20 && height.slope <15) {
          bipos.push(pos.x, height.height, pos.y, Math.random()*Math.PI*2);
        }
      }
    }
    	
  	blade.addAttribute( 'ipos', new THREE.InstancedBufferAttribute( new Float32Array( bipos ), 4 ) );
  	
	  this.grass = new THREE.Mesh(blade, this.imat);
	  this.add(this.grass);
    this.grass.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), tileSize*1.44);
	};
	
	this.addFlowers = function() {
	  
	};
	
	this.addStuff = function() {
	  if (quality.medium) {
	    this.addGrass();
	  }
  	this.addTrees(0, 5, 250);
  	this.addTrees(6, 3, 100);
  	if (quality.high) {
  	  this.addTrees(7, 3, 100);
  	}
  	this.addRocks();
  	this.populated = true;
	};
  	
}

Flora.prototype = Object.create( THREE.Group.prototype );
Flora.prototype.constructor = Flora;

//nice color r: 0.9977014595340266, g: 0.7429097985034006, b: 0.6724113927954039}