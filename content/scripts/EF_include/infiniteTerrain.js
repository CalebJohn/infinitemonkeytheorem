//this should be updated to stop using per-vertex colors

var Terrain = function(tw, tr, cam, scene) {
  this.tileSize = tw;
  this.tileResolution = tr;
  this.size = tw/tr;
  this.group = new THREE.Group();
  scene.add(this.group);
  var lastTile = new THREE.Vector2();
  
  this.tiles = new Map();
  this.tilePool = new Map();

  this.shader = THREE.groundShader;
  this.shader.uniforms.meshRes.value.x = tr;
  this.shader.uniforms.meshRes.value.y = tr;
  this.material = new THREE.ShaderMaterial( {
    uniforms: this.shader.uniforms,
    vertexShader: this.shader.vertexShader,
    fragmentShader: this.shader.fragmentShader,
    vertexColors: THREE.FaceColors,
    flatShading: true,
    fog: true,
    side: THREE.DoubleSide
    });
    /*
    new THREE.MeshStandardMaterial({    vertexColors: THREE.FaceColors,
    flatShading: true,
    fog: true,
    side: THREE.DoubleSide});
*/

  this.Tile = function() {
    var w = this.size;
    var h = this.size;
    var s = this.tileResolution;
    geometry = new THREE.Geometry();
    for (var i = 0; i <= s; i++) {
      var x = i*w;
      var v = i/s;
      for (var j = 0; j <= s; j++) {
        var u = j/s;
        var z = j*h;
        var off = new THREE.Vector3(x, 0, z);
        var build = (i>0)&&(j>0);
        this.makeQuad(geometry, off, new THREE.Vector2(u, v), build, s+1);
      }
    }

    geometry.computeBoundingBox();
    var max = geometry.boundingBox.max,
        min = geometry.boundingBox.min;
	  
    return geometry;
  };

  this.makeQuad = function(geometry, offset, uv, build, verts) {
    geometry.vertices.push(offset);

    if (build) {
      var baseIndex = geometry.vertices.length - 1;

      var index0 = baseIndex;
      var index1 = baseIndex - 1;
      var index2 = baseIndex - verts;
      var index3 = baseIndex - verts - 1;

      geometry.faces.push(new THREE.Face3(index0, index2, index1));
      geometry.faces.push(new THREE.Face3(index2, index3, index1));
    }
  };


  this.map = function(x, z, s) {
    var n1 = noise.simplex2(x*0.01, z*0.01);
    var n2 = noise.simplex2(x*0.02, z*0.02);
    var n = noise.simplex2(x*0.002, z*0.002)*0.5
            +n1*0.1
            +noise.simplex2(x*0.007, z*0.007)*0.1
            +n2*0.1;

    return  (s*n*2-3);
  };
  var flatTile = this.Tile();

  this.updateTile = function(tile) {
    //var t = performance.now();
    var x = tile.position.x;
    var y = tile.position.z;

    for ( let i = 0, l = tile.geometry.vertices.length; i < l; i ++ ) {
      var offset = this.map(tile.geometry.vertices[ i ].x+x, tile.geometry.vertices[ i ].z+y, this.size );
      tile.geometry.vertices[ i ].y = offset;
    }

    tile.geometry.verticesNeedUpdate = true;
    
    //clear tile children//regenerate plant life on tile
    //TODO recycle the Flora, avoid creating entirely new buffers and instead just update the ones present
    for (let i=tile.children.length-1;i>=0;i--) {
      tile.remove(tile.children[i]);
    }

    tile.visible = true;
    var flora = new Flora(x, y, this.tileSize, tile, this.map, this.size);
    tile.add(flora);
    this.updateTileColor(tile);
    //console.log("update took: "+(performance.now()-t));

  };
  
  this.updateTileColor = function(tile) {
    for (let k=0;k<tile.geometry.faces.length;k++) {
        tile.geometry.faces[k].color = tile.children[0].groundColor;
    }
    
    tile.geometry.colorsNeedUpdate = true;
    tile.geometry.elementsNeedUpdate = true;
  };

  this.update = function(camPos) {
    var step = camPos.clone().divideScalar(this.tileSize).floor().multiplyScalar(this.tileSize);
    var currentTile;
    var viewDistance = 2.0;
    var detailDistance = 1.1;
    //check the active tiles and determine which are still visible
    for (var [key, value] of this.tiles) {
      var box = new THREE.Box3().setFromObject(value);
      var distToBox = box.distanceToPoint(new THREE.Vector3(camPos.x, 0, camPos.z));//only want to measure distance in x and y directions
      if (distToBox > this.tileSize*viewDistance) {
        value.visible = false;
        this.tilePool.set(key, value);
      } else if (distToBox>this.tileSize&&distToBox<this.tileSize*detailDistance) {
        //value.visible = false;
        if (value.children[0].populated === false) {
          //var tt = performance.now();
          value.children[0].addStuff();
          //this.updateTileColor(value);
          //console.log(performance.now()-tt);
        }
      } else {
        value.visible = true;
        if (distToBox == 0) {
          currentTile = value;
        }
      }
    }
    //remove pooled tiles from regular tiles
    for (let [key, value] of this.tilePool) {
      if (this.tiles.has(key)) {
        this.tiles.delete(key);
      }
    }
    //console.log(this.tiles.size+this.tilePool.size);
    var tileIterator = this.tilePool.entries();
    //check if empty tiles needs to be activated
    for (let i=-viewDistance;i<=viewDistance;i++) {
      for(let j = -viewDistance;j<=viewDistance;j++) {
        var tpos = new THREE.Vector2(step.x+i*this.tileSize, step.z+j*this.tileSize);
        var tbb = new THREE.Box2(tpos, tpos.clone().add(new THREE.Vector2(this.tileSize, this.tileSize)));
        var distToTile = tbb.distanceToPoint(new THREE.Vector2(camPos.x, camPos.z));
        var match = false;
        for(let key of this.tiles.keys()) {
          if (key.equals(tpos) === true) {
            match = true;
          }
        }
        if (match === false && distToTile < this.tileSize*viewDistance) {
          var next = tileIterator.next();
          if (next.done === false) {
            //reuse a tile from the pool
            var ntile = next.value[1];
            ntile.position.x = tpos.x;
            ntile.position.z = tpos.y;
            ntile.updateMatrixWorld(true);
            this.updateTile(ntile);
            this.tiles.set(tpos, ntile);
            this.tilePool.delete(next.value[0]);
          } else {
            //add a tile into the pool
            tileMesh = new THREE.Mesh(flatTile.clone(), this.material);
            tileMesh.translateX(tpos.x);
            tileMesh.translateZ(tpos.y);
            tileMesh.updateMatrixWorld(true);
            this.updateTile(tileMesh);
            this.updateTileColor(tileMesh);
            if (distToTile < this.tileSize*detailDistance) {
              tileMesh.children[0].addStuff();
            }
            tileMesh.updateMatrixWorld(true);

            this.tiles.set(new THREE.Vector2(tpos.x, tpos.y), tileMesh);
            this.group.add(tileMesh);
            this.group.updateMatrixWorld(true);
          }
        }
      }
    }
    if (step.equals(lastTile) === false && currentTile != undefined) {
      lastTile = step.clone();
      new TWEEN.Tween( scene.background ).to( currentTile.children[0].sky, 2000 ).easing( TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween( scene.fog.color ).to( currentTile.children[0].sky, 2000 ).easing( TWEEN.Easing.Cubic.Out).start();
    }
  };

};