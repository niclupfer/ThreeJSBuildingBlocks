/**
 * Camera singleton to wrap the ThreeJS camera and OrbitControls
 */
const Cam = {

	Y_VIEW: "y view",
	X_VIEW: "x view",
	Z_VIEW: "z view",

	lookDistance: 24,
	fov: 24,
	startOffset: new THREE.Vector3(9, 12, 10),
	lookCenter: new THREE.Vector3(0, 0, 0),

	init: function (aspect = 1) {
		this.camera = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 1000)
		
		this.controls = new THREE.OrbitControls(this.camera, Space.renderer.domElement)
		this.controls.mouseButtons = {
			LEFT: THREE.MOUSE.PAN,
			MIDDLE: THREE.MOUSE.DOLLY,
			RIGHT: THREE.MOUSE.ROTATE
		}

		this.setAspect(aspect)
		this.setView(Cam.Y_VIEW)
	},

	setView: function(view = "") {
		let camPos = this.startOffset
		switch(view) {
			case this.Y_VIEW:
				camPos = UP_VECTOR.clone().multiplyScalar(this.lookDistance)
				break;
			case this.X_VIEW:
				camPos = CARDINAL_VECTORS.EAST.clone().multiplyScalar(this.lookDistance)
				break;
			case this.Z_VIEW:
				camPos = CARDINAL_VECTORS.NORTH.clone().multiplyScalar(this.lookDistance)
				break;
		}
		this.camera.position.copy(camPos)
		this.controls.target.copy(this.lookCenter)
		this.controls.update()
	},

	setAspect: function(aspect) {
		this.camera.aspect = aspect
		this.camera.updateProjectionMatrix()
	}
}