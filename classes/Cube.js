const STATE = { DISABLE_DEACTIVATION : 4 };   
const loader = new THREE.TextureLoader();

export default class Cube {
    constructor (physicsWorld){

        this.pos = {x: 20, y: 4, z:0};
        this.scale = {x: 10, y:10, z:10}
        this.quat = {x: 0, y: 0, z: 0, w: 1};
        this.mass = 1000;
        this.physicsWorld = physicsWorld;
        this.moveDirection = { left: 0, right: 0, forward: 0, back: 0 };
        this.cube = this.playerObject = 
        new THREE.Mesh(new THREE.BoxBufferGeometry()
        , new THREE.MeshLambertMaterial({map: loader.load("../assets/unloaded.png")}));
        this.cube.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.cube.rotation.set(this.quat.x, this.quat.y, this.quat.z);
        this.cube.scale.set(this.scale.x, this.scale.y, this.scale.z);
        this.cube.castShadow = true;
        this.cube.receiveShadow = true;

        // physics
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( this.pos.x, this.pos.y, this.pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( this.quat.x, this.quat.y, this.quat.z, this.quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );
        let colShape = new Ammo.btBoxShape( new Ammo.btVector3(this.scale.x * 0.5, this.scale.y * 0.5, this.scale.z * 0.5 ) );
        colShape.setMargin( 0.05 );
        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( this.mass, localInertia );
        let rbInfo = new Ammo.btRigidBodyConstructionInfo( this.mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );
        body.setFriction(1.8);
        body.setDamping(20, 20)
        body.setActivationState( STATE.DISABLE_DEACTIVATION );
        this.physicsWorld.addRigidBody(body);
        this.cube.userData.physicsBody = body;
    }
    getModel (){
        return this.cube;
    }
    getPhysicsBody(){
        return this.cube.userData.physicsBody;
    }
}