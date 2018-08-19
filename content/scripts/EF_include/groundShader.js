/*define shaders here. Use standard Threejs method so I can use their lighting and fog code*/

THREE.groundShader = {

uniforms: THREE.UniformsUtils.merge( [

    THREE.UniformsLib[ "fog" ],

    {

    "meshRes" : { type: 'v2', value: new THREE.Vector2(0.0, 0.0) }

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

vertexShader: [
  "uniform vec2 meshRes;",

  "varying vec3 vColor;",
  
	THREE.ShaderChunk[ "fog_pars_vertex" ],
  THREE.ShaderChunk[ "common" ],

    "void main() {",

      "vColor = color;",
      "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
      "gl_Position = projectionMatrix * mvPosition;",
	     THREE.ShaderChunk[ "fog_vertex" ],
    "}"

].join("\n")

};