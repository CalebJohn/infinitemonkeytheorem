/*define shaders here. Use standard Threejs method so I can use their lighting and fog code*/

THREE.instanceShader = {

uniforms: THREE.UniformsUtils.merge( [

    THREE.UniformsLib[ "fog" ],
    
    {

    bark: new THREE.Uniform(new THREE.Color(0.6, 0.35, 0.2)),
    leaves: new THREE.Uniform(new THREE.Color(0.4, 0.75, 0.6)),
    grass: new THREE.Uniform(new THREE.Color(0.7, 1.0, 0.7)),
    rock: new THREE.Uniform(new THREE.Color(1, 0, 0)),
    flower: new THREE.Uniform(new THREE.Color(1,0,0)),
    complement1: new THREE.Uniform(new THREE.Color(1,0,0)),
    complement2: new THREE.Uniform(new THREE.Color(1,0,0)),
    highlight1: new THREE.Uniform(new THREE.Color(1,0,0)),
    highlight2: new THREE.Uniform(new THREE.Color(1,0,0))
    
    }

] ),

fragmentShader: [
  "varying vec3 vColor;",

  THREE.ShaderChunk[ "common" ],
  THREE.ShaderChunk[ "fog_pars_fragment" ],
  
  "void main() {",
    "gl_FragColor = vec4(vColor, 1.0);",
    THREE.ShaderChunk[ "fog_fragment" ],
  "}"

].join("\n"),
//TODO add something that varies color slightly to add texture to stuff. Probably will not use
//But could extend into tile blending
vertexShader: [
  "varying vec3 vColor;",
  
  "attribute float palette;",
  "attribute vec4 ipos;",
  
  "uniform vec3 bark;",
  "uniform vec3 leaves;",
  "uniform vec3 grass;",
  "uniform vec3 rock;",
  "uniform vec3 flower;",
  "uniform vec3 complement1;",
  "uniform vec3 complement2;",
  "uniform vec3 highlight1;",
  "uniform vec3 highlight2;",

	THREE.ShaderChunk[ "fog_pars_vertex" ],
  THREE.ShaderChunk[ "common" ],

  "vec3 lookupPalette(float p) {",
  "if (palette < 1.0) {return leaves;}//0",
  "else if (palette < 2.0) {return bark;}//1",
  "else if (palette < 3.0) {return grass;}//2",
  "else if (palette < 4.0) {return rock;}//3",
  "else if (palette < 5.0) {return flower;}//4",
  "else if (palette < 6.0) {return complement1;}//5",
  "else if (palette < 7.0) {return complement2;}//6",
  "else if (palette < 8.0) {return highlight1;}//7",
  "else if (palette < 9.0) {return highlight2;}//8",

  " return vec3(1.0, 0.0, 0.0);",
  "}",
  
  "vec2 rotate(vec2 v, float a) {",
	  "float s = sin(a);",
	  "float c = cos(a);",
	  "mat2 m = mat2(c, -s, s, c);",
	  "return m * v;",
  "}",
  
  "void main() {",
    "vColor = lookupPalette(palette);",
    "vec3 npos = position;",
    "npos.xz = rotate(npos.xz, ipos.w);",
    "vec4 mvPosition = modelViewMatrix * vec4( npos+ipos.xyz, 1.0 );",
    "gl_Position = projectionMatrix * mvPosition;",
    THREE.ShaderChunk[ "fog_vertex" ],
  "}"

].join("\n")

};