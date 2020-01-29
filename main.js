
import Player from "./classes/Player.js"
import Level from "./classes/Level.js";
import Cube from "./classes/Cube.js"

Ammo().then(function(Ammo){

    let renderer, camera, scene, controls, physicsWorld, rigidBodies=[], tmpTrans = null, 
    time = 0, player, level, cube;
    var clock = new THREE.Clock();

    setInterval(function(){
        /*
        var vec = new THREE.Vector3(0,0,0)
        camera.getWorldDirection(vec)
        console.log(camera.rotation)
        console.log("x velocity: " + player.getXVel());
        console.log("z velocity: " + player.getZVel());
        console.log("y velocity: " + player.getYVel());
        */
    }, 1000)
    start();

    function start(){
        tmpTrans = new Ammo.btTransform();
        initPhysics();
        initWorld();
        setupEventHandlers();
        animate();
    }

    function initPhysics(){
        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();
   
        physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, -140, 0));   
    }

    function initWorld(){
        // Create and add renderer with resize listener
        renderer = new THREE.WebGLRenderer({antialias:false});
        renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(renderer.domElement);
        window.addEventListener( 'resize', onWindowResize, false );

        // Create camera
        camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,30000);
        camera.rotation.y = -Math.PI/2

        // Add pointer lock controls
        controls = new THREE.PointerLockControls( camera, renderer.domElement);
        
        // Create scene
        scene = new THREE.Scene();

        // Add ugly scene skybox
        scene.background = new THREE.CubeTextureLoader()
            .setPath('./assets/')
            .load([
                "arid_bk.jpg",
                "arid_ft.jpg",
                "arid_up.jpg",
                "arid_dn.jpg",
                "arid_lf.jpg",
                "arid_rt.jpg",
            ])
        
        // Add lighting
        var light = new THREE.DirectionalLight( 0xffffff);
        light.position.set( 3, 10, 3);
        scene.add( light );
    
        light = new THREE.DirectionalLight( 0x002288 );
        light.position.set( -1, -1, -1 );
        scene.add( light );
    
        light = new THREE.AmbientLight( 0x222222, 2);
        scene.add( light );

        // get the plane that holds everything up
        level = new Level(physicsWorld)
        scene.add(level.getLevelModel());

        // get the player's model, add to rigidbodies array
        player = new Player(physicsWorld)
        scene.add(player.getPlayerModel());
        rigidBodies.push(player.getPlayerModel());
        player.getPlayerModel().add(controls.getObject())
        controls.getObject().position.y += 2

        // add other stuff
        cube = new Cube(physicsWorld)
        scene.add(cube.getModel())
        rigidBodies.push(cube.getModel())

    }
    
    function render(){
        var deltaTime = clock.getDelta();
        var direction = new THREE.Vector3(0,0,0);
        camera.getWorldDirection(direction)
        camera.updateProjectionMatrix()
        player.controlPlayer(direction);
        updatePhysics(deltaTime)
        renderer.render(scene, camera);
        time += deltaTime;
    }
    
    function animate(){
        requestAnimationFrame(animate)
        render();
    }

    function updatePhysics( deltaTime ){
        // Step world
        physicsWorld.stepSimulation( deltaTime, 10 );
        
        // Update rigid bodies
        for ( let i = 0; i < rigidBodies.length; i++ ) {
            let objThree = rigidBodies[ i ];
            let objAmmo = objThree.userData.physicsBody;
            let ms = objAmmo.getMotionState();
            if ( ms ) {

                ms.getWorldTransform( tmpTrans );
                let p = tmpTrans.getOrigin();
                let q = tmpTrans.getRotation();
                objThree.position.set( p.x(), p.y(), p.z() );
                objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

            }
        }
    }
     
    function handleKeyDown(event){
        let keyCode = event.keyCode;
        switch(keyCode){
    
            case 87: //W: FORWARD
                player.moveDirection.forward = 1
                break;
    
            case 83: //S: BACK
                player.moveDirection.back = 1
                break;
    
            case 65: //A: LEFT
                player.moveDirection.left = 1
                break;
    
            case 68: //D: RIGHT
                player.moveDirection.right = 1
                break;

            case 32:
                player.moveDirection.up = 1;
                /*
                let raycaster = new THREE.Raycaster(
                    new THREE.Vector3(player.getXPos(), player.getYPos(), player.getZPos()),
                    new THREE.Vector3(0, -1, 0))
                console.log(raycaster.intersectObjects(scene.children))
                console.log(Math.abs(raycaster.intersectObjects(scene.children)[0].distance - player.scale.y/2))
                if (Math.abs(raycaster.intersectObjects(scene.children)[0].distance - player.scale.y/2)
                    < 0.015){
                    console.log("can jump" )
                    player.moveDirection.up = 1;
                } else {
                    player.moveDirection.up = 0;
                }
                */
                break;
            
            case 70:
                console.log("Locking pointer");
                controls.lock();
                break;
        }
    }
    
    
    function handleKeyUp(event){
        let keyCode = event.keyCode;
    
        switch(keyCode){
            case 87: //FORWARD
                player.moveDirection.forward = 0
                break;
    
            case 83: //BACK
                player.moveDirection.back = 0
                break;
    
            case 65: //LEFT
                player.moveDirection.left = 0
                break;
    
            case 68: //RIGHT
                player.moveDirection.right = 0
                break;
            case 32:
                player.moveDirection.up = 0
                break;
        }
    } 

    function handleMouseDown(event){
        
    }

    function setupEventHandlers(){
        window.addEventListener( 'keydown', handleKeyDown, false);
        window.addEventListener( 'keyup', handleKeyUp, false);
        window.addEventListener( 'mouseDown', handleMouseDown, false);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
      render();
    }
})

