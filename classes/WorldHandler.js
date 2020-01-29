class WorldHandler {
    constructor(){
        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();
   
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.physicsWorld.setGravity(new Ammo.btVector3(0, -40, 0));
        this.renderer =  new THREE.WebGLRenderer({antialias:false});
        this.renderer.setSize();

        this.camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,30000);
        this.camera.rotation.y = -Math.PI/2


        document.body.appendChild(this.renderer.domElement);
        controls = new THREE.PointerLockControls( camera, renderer.domElement);
        
        // TODO: ADD EVENT LISTENER FOR WINDOW RESIZE

        this.scene = new THREE.Scene(); 
        this.scene.background = new THREE.CubeTextureLoader()
            .setPath('../assets/')
            .load([
                "arid_bk.jpg",
                "arid_ft.jpg",
                "arid_up.jpg",
                "arid_dn.jpg",
                "arid_lf.jpg",
                "arid_rt.jpg",
            ])
    }


}