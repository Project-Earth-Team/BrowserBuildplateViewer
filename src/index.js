/* global THREE, fetch, atob */
import './index.scss'

const { WorldView, Viewer, MapControls } = require('prismarine-viewer/viewer')
const { Vec3 } = require('vec3')
global.THREE = require('three')

const version = '1.12' // This is because bedrock is pre-flattening
let data
let modelData
let offset

const Chunk = require('prismarine-chunk')(version)
const mcData = require('minecraft-data')(version)

const maxX = 16
const maxY = 16

function to3D (i) {
  const x = i % maxX
  const y = Math.floor((i / maxX) % maxY)
  const z = Math.floor(i / (maxX * maxY))
  return new Vec3(x, y, z)
}

function generateBuildplateChunks (chunkX, chunkZ) {
  const chunk = new Chunk()

  modelData.sub_chunks.forEach(subChunk => {
    if (subChunk.position.z === chunkX && subChunk.position.x === chunkZ) {
      subChunk.blocks.forEach((block, i) => {
        try {
          let blockName = subChunk.block_palette[block].name.replace('minecraft:', '')
          if (blockName === 'border_constraint') {
            blockName = 'bedrock'
          } else if (blockName === 'invisible_constraint') {
            blockName = 'glass'
          }
          const blockPos = offset.plus(to3D(i)).plus(new Vec3(0, subChunk.position.y * 16, 0))
          chunk.setBlockType(blockPos, mcData.blocksByName[blockName].id)
          chunk.setBlockData(blockPos, subChunk.block_palette[block].data)
        } catch (e) {
          console.log(`[Missing block] Index: ${i}, SubChunk: (${subChunk.position.x}, ${subChunk.position.y}, ${subChunk.position.z}), Pos: ${to3D(i)}, Block: ${subChunk.block_palette[block].name}, Data: ${subChunk.block_palette[block].data}`)
        }
      })
    }
  })

  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      for (let y = 0; y < 256; y++) {
        chunk.setSkyLight(new Vec3(x, y, z), 15)
      }
    }
  }

  return chunk
}

async function main () {
  data = await fetch('bqjezwx9gtd.json').then(r => r.json())
  data = data.result
  modelData = JSON.parse(atob(data.buildplateData.model))
  offset = new Vec3(data.buildplateData.offset.x, data.buildplateData.offset.y, data.buildplateData.offset.z)

  const viewDistance = 6
  const center = new Vec3(0, 96, 0)

  const World = require('prismarine-world')(version)

  const world = new World(generateBuildplateChunks)

  const worldView = new WorldView(world, viewDistance, center)

  // Create three.js context, add to page
  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio || 1)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Create viewer
  const viewer = new Viewer(renderer)
  viewer.setVersion(version)
  // Attach controls to viewer
  const controls = new MapControls(viewer.camera, renderer.domElement)

  // Link WorldView and Viewer
  viewer.listen(worldView)
  // Initialize viewer, load chunks
  worldView.init(center)

  viewer.camera.position.set(-offset.y * 0.5, center.y, -offset.y * 0.5)
  viewer.camera.lookAt(offset.x, offset.y * 2, offset.z)
  controls.target.set(offset.x, offset.y * 2, offset.z)
  controls.update()

  // Browser animation loop
  const animate = () => {
    window.requestAnimationFrame(animate)
    if (controls) controls.update()
    worldView.updatePosition(controls.target) // We don't need to render more than the initial chunks
    viewer.update()
    renderer.render(viewer.scene, viewer.camera)
  }
  animate()
}
main()
