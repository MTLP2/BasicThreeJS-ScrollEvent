import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui.addColor(parameters, 'materialColor').onChange(()=>{
    material.color.set(parameters.materialColor),
    particleMaterial.color.set(parameters.materialColor)
})



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */

const textureloader = new THREE.TextureLoader()

const gradienttexture = textureloader.load('textures/gradients/3.jpg')
gradienttexture.magFilter = THREE.NearestFilter

const material = new THREE.MeshToonMaterial({
    color : parameters.materialColor,
    gradientMap : gradienttexture
})


const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)

const objectdistance = 4 

mesh1.position.y = - objectdistance * 0
mesh2.position.y = - objectdistance * 1
mesh3.position.y = - objectdistance * 2

mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2


scene.add(mesh1,mesh2,mesh3)
const sectionsMeshes = [mesh1, mesh2, mesh3]

const particlecount = 500

const positions = new Float32Array(particlecount * 3)

for (let i = 0; i < particlecount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectdistance * 0.5 - Math.random() * objectdistance * sectionsMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    
}

const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particleMaterial = new THREE.PointsMaterial({
    color : parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

const particle = new THREE.Points(particleGeometry,particleMaterial)
scene.add(particle)


const light = new THREE.DirectionalLight('#ffffff', 3)
light.position.set(1,1,0)
scene.add(light)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera

const cameragroup = new THREE.Group()
scene.add(cameragroup)

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameragroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

let scrollY = window.scrollY
let currentSection = 0

window.addEventListener("scroll",() =>{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)
    if (newSection != currentSection){
        currentSection = newSection
        gsap.to(
            sectionsMeshes[currentSection].rotation,
            {
                duration:1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3'
            }
        )
    }
})

const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event)=>{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})


/**
 * Animate
 */
const clock = new THREE.Clock()
let previoustime = 0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltatime = elapsedTime - previoustime
    previoustime = elapsedTime

    camera.position.y = - scrollY / sizes.height * objectdistance

    const paralaxX = cursor.x * 0.3
    const paralaxY = - cursor.y * 0.3


    cameragroup.position.x += (paralaxX - cameragroup.position.x) * 5 * deltatime
    cameragroup.position.y += (paralaxY - cameragroup.position.y) * 5 * deltatime

    for(const mesh of sectionsMeshes){
        mesh.rotation.x += deltatime * 0.1
        mesh.rotation.y += deltatime * 0.12

    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()