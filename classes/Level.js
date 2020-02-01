export default class Level {
    constructor(physicsWorld){
        this.pos = {x: 0, y: -4, z: 0};
        this.scale = {x: 80, y: 2, z: 80};
        this.quat = {x: 0, y: 0, z: 0, w: 1};
        this.mass = 0;
        this.physicsWorld = physicsWorld
    
        //threeJS Section
        this.blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), 
                        new THREE.MeshPhongMaterial({color: 0x4545cc}));

        this.blockPlane.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.blockPlane.scale.set(this.scale.x, this.scale.y, this.scale.z);
        
        this.blockPlane.castShadow = true;
        this.blockPlane.receiveShadow = true;
        
        // physics
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( this.pos.x, this.pos.y, this.pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( this.quat.x, this.quat.y, this.quat.z, this.quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( this.scale.x * 0.5, this.scale.y * 0.5, this.scale.z * 0.5 ) );
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( this.mass, localInertia );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( this.mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );
        body.setFriction(0.1);

        this.physicsWorld.addRigidBody(body)
    }
    
    getLevelModel(){
        return this.blockPlane
    }
}