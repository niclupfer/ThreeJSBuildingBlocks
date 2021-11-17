# ThreeJSBuildingBlocks

Check it out here:
https://niclupfer.github.io/ThreeJSBuildingBlocks/

The code is divided between 3 singletons and 1 "class"
- Space.js - main controller which creates the scene and handles scene-wide functions
- Cam.js - a wrapper around the ThreeJS camera and OrbitContols
- Tools.js - controls the basic UI and user interactions
- Blocky.js - class wrapping the ThreeJS meshes for object manipulations

Some extra stuff:
- blocks are auto saved to local storage and loaded on page reload
- placing and scooting blocks is snapped to the grid, though you can toggle this off
- added some gsap animation for a bit of juice
- anti-aliasing shader (tho there is a bug, I havent been able to get the shader texture to resize on window resize)

HTML and CSS aren't great, but I wanted to keep it vanilla for easy deploying and sharing.

To run locally, clone the repo and open index.html, no building needed. ThreeJS and Greensock are loaded from the web.
