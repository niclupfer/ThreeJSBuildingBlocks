
// Some enums and constants
const BLOCKY_TYPES = {
	CUBE: "cube",
	CONE: "cone",
	SPHERE: "sphere",
	CYLINDER: "cylinder",
	ICOS: "icos",
}

const UP_VECTOR = new THREE.Vector3(0, 1, 0)

const CARDINAL_VECTORS = {
	NORTH: new THREE.Vector3(0, 0, 1),
	SOUTH: new THREE.Vector3(0, 0, -1),
	EAST: new THREE.Vector3(1, 0, 0),
	WEST: new THREE.Vector3(-1, 0, 0),
}

function Blocky(id, type, color, x, y, z, angle) {

	this.id = id ?? crypto.randomUUID()
	this.type = type
	this.color = color
	this.pos = new THREE.Vector3(x, y, z)
	this.angle = angle

	this.mesh = new THREE.Mesh(this.getGeoForType(type), this.getMaterialForColor(color))
	this.mesh.position.copy(this.pos)
	this.mesh.rotateY(this.angle)

	this.mesh.scale.set(0.2, 0.2, 0.2)
	let goalScale = new THREE.Vector3(1, 1, 1)
	gsap.to(this.mesh.scale, {duration: 0.2, x: goalScale.x, y: goalScale.y, z: goalScale.z, ease: "back.out(1.7)"})
}

Blocky.prototype.scoot = function(camForward, xDelta = 0, zDelta = 0, gridded = false) {
	let camRight = camForward.clone().applyAxisAngle(UP_VECTOR, -Math.PI / 2)
	if(gridded) {
		camForward = this.findNearestCardinalVector(camForward)
		camRight = this.findNearestCardinalVector(camRight)
		xDelta *= -1
		zDelta *= -1
	}
	this.pos.addScaledVector(camForward, zDelta)
	this.pos.addScaledVector(camRight, xDelta)
	gsap.to(this.mesh.position, {duration: 0.2, x: this.pos.x, y: this.pos.y, z: this.pos.z, ease: "back.out(1.7)"})
}

Blocky.prototype.rotate = function(rotationDelta = 0) {
	this.angle += rotationDelta
	gsap.to(this.mesh.rotation, {duration: 0.2, y: this.angle, ease: "back.out(1.7)"})
}

Blocky.prototype.serialize = function() {
	return {
		id: this.id,
		type: this.type,
		color: this.color,
		pos: this.pos,
		angle: this.angle
	}
}

Blocky.prototype.getGeoForType = function(type) {
	switch(type) {
		case BLOCKY_TYPES.CUBE:
			return new THREE.BoxGeometry(1, 1, 1)

		case BLOCKY_TYPES.CONE:
			return new THREE.ConeGeometry(0.5, 1, 6)

		case BLOCKY_TYPES.SPHERE:
			return new THREE.SphereGeometry(0.5, 32, 16)

		case BLOCKY_TYPES.CYLINDER:
			return new THREE.CylinderGeometry(0.5, 0.5, 1, 16)

		case BLOCKY_TYPES.ICOS:
			return new THREE.IcosahedronGeometry(0.5)
	}
}

Blocky.prototype.getMaterialForColor = function(color) {
	switch(color) {
		case "red":
			return new THREE.MeshStandardMaterial({ color: 0xff6663 })

		case "orange":
			return new THREE.MeshStandardMaterial({ color: 0xfeb144 })

		case "yellow": 
			return new THREE.MeshStandardMaterial({ color: 0xfdfd97 })

		case "green":
			return new THREE.MeshStandardMaterial({ color: 0x9ee09e })

		case "blue":
			return new THREE.MeshStandardMaterial({ color: 0x9ec1cf })

		case "purple":
			return new THREE.MeshStandardMaterial({ color: 0xcc99c9 })
	}
}

Blocky.prototype.findNearestCardinalVector = function(vec) {
	let minDot = 1
	let bestCardinal = vec

	Object.values(CARDINAL_VECTORS).forEach(cardinal => {
		let dot = vec.dot(cardinal)
		if(dot < minDot) {
			minDot = dot
			bestCardinal = cardinal
		}
	});

	return bestCardinal
}