const Tools = {

	rotationAmount: Math.PI / 4, // 45 degrees
	snapToGrid: false,
	mirrorToggle: false,

	create: function() {
		const geometry = new THREE.PlaneGeometry(0.8, 0.8)
		const material = new THREE.MeshBasicMaterial( {
			color: 0xcccccc,
			opacity: 0.5,
			transparent: true,
		})
		this.selector = new THREE.Mesh(geometry, material)
		this.selector.position.set(1, -0.499, 0)
		this.selector.rotateX(-Math.PI/2)

		this.raycaster = new THREE.Raycaster()
		this.mouse = new THREE.Vector2()
		Space.container.addEventListener('mousemove', this.onMouseMove)
		Space.container.addEventListener('mousedown', this.onMouseDown)
		
		this.cameraForward = new THREE.Vector3

		this.selectionInfo = document.getElementById("selectedInfo")

		this.update()
		return this.selector
	},

	onMouseDown: function(event) {
		if(event.button == 0 && Tools.canPlace) {
			const point = Tools.getIntersectionPoint(event.layerX, event.layerY)
			if(point) {
				Tools.selection = Space.addBlockyAt(point.x, point.y, point.z)
			}
		}
		Tools.update()
	},

	onMouseMove: function(event) {
		if(Tools.canPlace) {
			const point = Tools.getIntersectionPoint(event.layerX, event.layerY)
			if(point) {
				point.y -= 0.499
				Tools.selector.visible = true
				gsap.to(Tools.selector.position, { duration: 0.1, x: point.x, y: point.y, z: point.z })
			} else {
				Tools.selector.visible = false
			}
		}
	},

	scoot: function(xDelta = 0, zDelta = 0) {
		if(this.selection) {
			Cam.camera.getWorldDirection(this.cameraForward)
			this.cameraForward.y = 0
			this.cameraForward.normalize()
			this.selection.scoot(this.cameraForward, xDelta, zDelta, this.snapToGrid)
			Space.save()
		}
	},

	rotate: function(direction = 0) {
		if(this.selection) {
			this.selection.rotate(direction * this.rotationAmount)
			Space.save()
		}
	},

	remove: function() {
		if(this.selection) {
			Space.remove(this.selection.id)
			this.selection = null
			this.update()
		}
	},
	
	update: function() {
		this.snapToGrid = document.querySelector('input[name="gridSnap"]').checked

		this.mirrorToggle = document.querySelector('input[name="mirrorToggle"]').checked
		Space.mirror.visible = this.mirrorToggle

		let selectedShape = document.querySelector('input[name="shapeList"]:checked').value
		if(selectedShape === "none") {
			Tools.canPlace = false
			Cam.controls.enablePan = true
			Tools.selector.visible = false
		} else {
			Tools.canPlace = true
			Cam.controls.enablePan = false
			Tools.selector.visible = true
		}
		
		let selectedColor = document.querySelector('input[name="colorList"]:checked').value

		if(this.selection) this.selectionInfo.innerText = this.selection.type + " - " + this.selection.id.substr(0, 4)
		else this.selectionInfo.innerText = "nothing"
	},

	getIntersectionPoint: function(x, y) {
		Tools.mouse.x = (x / Space.width) * 2 - 1
		Tools.mouse.y = -(y / Space.height) * 2 + 1

		Tools.raycaster.setFromCamera(Tools.mouse, Cam.camera)
		const intersects = Tools.raycaster.intersectObjects([Space.groundPlane, ...Space.group.children])

		if (intersects.length > 0) {
			if(this.snapToGrid) return Tools.flatRoundVec3(intersects[0].point)
			else {
				intersects[0].point.y += 0.5
				return intersects[0].point
			}			
		} else {
			return null
		}
	},

	flatRoundVec3: function(vec) {
		vec.x = Math.round(vec.x)
		vec.y = Math.round(vec.y + 0.5)
		vec.z = Math.round(vec.z)
		return vec
	},
}