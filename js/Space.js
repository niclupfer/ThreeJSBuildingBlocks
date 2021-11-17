// 1 hr  - 11/14 at home
// <1 hr - 11/14 gym

const Space = {
	
	init: function() {
		this.container = document.getElementById("renderingCanvas")
		this.getContainerSize()

		this.scene = new THREE.Scene()
		this.renderer = new THREE.WebGLRenderer()
		this.renderer.autoClear = false
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(this.width, this.height)
		this.container.appendChild(this.renderer.domElement)

		Cam.init(this.width / this.height)

		this.group = new THREE.Group()
		this.scene.add(this.group)

		this.addGrid()
		this.addLights()	
		this.addMirror()
		this.addPostProcessing()	
		
		this.scene.add(Tools.create())

		this.blocks = new Map(); // <string, Blocky> dictionary

		window.onresize = () => { Space.onResize() }

		if(localStorage["blocks"]) this.loadBlocks(JSON.parse(localStorage["blocks"]))

		render()
	},

	addGrid: function() {
		// invisible plane for ground level raycasts
		const geometry = new THREE.PlaneGeometry(61, 61)
		const material = new THREE.MeshBasicMaterial( {
			opacity: 0,
			transparent: true
		});
		this.groundPlane = new THREE.Mesh(geometry, material)
		this.groundPlane.position.set(0, -0.502, 0)
		this.groundPlane.rotateX(-Math.PI/2)
		this.scene.add(this.groundPlane)
		
		this.grid = new THREE.GridHelper( 61, 61, 0x000000,  0xcccccc )
		this.grid.position.y = -0.502
		this.scene.add(this.grid)
	},

	addLights: function() {
		this.hemisphereLight = new THREE.HemisphereLight('white', 'white', 0.3)
		this.scene.add(this.hemisphereLight)

		this.sunLight = new THREE.DirectionalLight('white', 0.7)
		this.sunLight.position.set(6, 10, 8)
		this.scene.add(this.sunLight)

		this.scene.background = new THREE.Color( 0xffffff )
		this.scene.fog = new THREE.Fog( 0xcccccc, 100, 1500 )
	},

	addMirror: function() {
		const geometry = new THREE.CircleGeometry(80, 32)
		this.mirror = new THREE.Reflector( geometry, {
			clipBias: 0.003,
			fragmentShader: THREE.Reflector.ReflectorShader.fragmentShader,
			textureWidth: this.width * window.devicePixelRatio,
			textureHeight: this.height * window.devicePixelRatio,
			color: 0x666666,
			opacity: 0.2,
			transparent: true,
			side: THREE.DoubleSide,
		} );
		this.mirror.position.y = -0.5001;
		this.mirror.rotateX(-Math.PI / 2)

		this.scene.add(this.mirror);
	},

	addPostProcessing: function() {
		const renderPass = new THREE.RenderPass(this.scene, Cam.camera)
		this.fxaaPass = new THREE.ShaderPass(THREE.FXAAShader)
		const pixelRatio = this.renderer.getPixelRatio()

		this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.width * pixelRatio)
		this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.height * pixelRatio)

		this.composer = new THREE.EffectComposer(this.renderer)
		this.composer.addPass(renderPass)
		this.composer.addPass(this.fxaaPass)
	},

	loadBlocks: function(blocksArray) {
		if(blocksArray.length) {
			blocksArray.forEach(blockData => {
				this.createBlocky(
					blockData.id,
					blockData.type,
					blockData.color,
					blockData.pos.x,
					blockData.pos.y,
					blockData.pos.z,
					blockData.angle)
			})
		}
	},

	addBlockyAt: function(x, y, z) {

		let selectedShape = document.querySelector('input[name="shapeList"]:checked').value
		let selectedColor = document.querySelector('input[name="colorList"]:checked').value

		let newBlock = this.createBlocky(null, selectedShape, selectedColor, x, y, z, 0)

		this.save()
		return newBlock
	},

	createBlocky: function(id, shape, color, x, y, z, angle) {
		let newBlock = new Blocky(id, shape, color, x, y, z, angle)
		this.group.add(newBlock.mesh)
		this.blocks.set(newBlock.id, newBlock)

		return newBlock
	},

	remove: function(blockyId) {
		this.group.remove(this.blocks.get(blockyId).mesh)
		this.blocks.delete(blockyId)
		this.save()
	},

	clearSpace: function() {
		while(this.group.children.length) {
			this.group.remove(this.group.children[0])
		}

		this.blocks.clear()
		this.save()
	},

	save: function() {
		let serializedBlocks = []

		this.blocks.forEach((blocky) => {
			serializedBlocks.push(blocky.serialize())
		}) 
		localStorage["blocks"] = JSON.stringify(serializedBlocks)
	},

	getContainerSize: function() {
		this.width = this.container.clientWidth
		this.height = this.container.clientHeight
	},

	onResize: function() {
		this.getContainerSize()
		
		this.renderer.setSize(this.width, this.height)
		Cam.setAspect(this.width / this.height)

		const pixelRatio = this.renderer.getPixelRatio()
		this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.width * pixelRatio)
		this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.height * pixelRatio)
		console.log(this.fxaaPass.material.uniforms['resolution'].value.x)
	},
}

function render() {
	requestAnimationFrame(render)
	Space.composer.render()
}

window.onload = () => { Space.init() }
