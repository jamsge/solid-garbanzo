
const STATE = { DISABLE_DEACTIVATION : 4 };   

export default class Player {
    constructor(physicsWorld){
        this.pos = {x: 0, y: 3, z:0};
        this.scale = {x: 4, y:4, z:4}
        this.quat = {x: 0, y: 0, z: 0, w: 1};
        this.mass = 2;
        this.physicsWorld = physicsWorld;
        this.moveDirection = { left: 0, right: 0, forward: 0, back: 0, up: 0};
        this.playerModel = this.playerObject = 
        new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xff0000}));
        this.playerModel.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.playerModel.rotation.set(this.quat.x, this.quat.y, this.quat.z);
        this.playerModel.scale.set(this.scale.x, this.scale.y, this.scale.z);
        this.playerModel.castShadow = true;
        this.playerModel.receiveShadow = true;
        this.playerModel.visible = true;

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
        body.setFriction(1);
        body.setDamping(0.5, 1000000)
        body.setActivationState( STATE.DISABLE_DEACTIVATION);
        this.physicsWorld.addRigidBody(body);
        this.playerModel.userData.physicsBody = body;
    }
    getPlayerModel (){
        return this.playerModel;
    }
    getMoveDirection(){
        return this.moveDirection;
    }    
    getPhysicsBody(){
        return this.playerModel.userData.physicsBody;
    }
    getWorldTransform(){
        return this.getPhysicsBody().getWorldTransform();
    }
    getXPos(){
        return this.getWorldTransform().getOrigin().x();
    }
    getYPos(){
        return this.getWorldTransform().getOrigin().y();
    }
    getZPos(){
        return this.getWorldTransform().getOrigin().z();
    }
    getXVel(){
        return this.getPhysicsBody().getLinearVelocity().x();
    }
    getZVel(){
        return this.getPhysicsBody().getLinearVelocity().z()
    }
    getYVel(){
        return this.getPhysicsBody().getLinearVelocity().y();
    }
    getVel(){
        return this.getPhysicsBody().getLinearVelocity().length();
    }
    setLinearVelocity(x, y, z){
        this.getPhysicsBody().setLinearVelocity(new Ammo.btVector3(x, y, z))
    }
    lockXYZRotation(){
        this.getPhysicsBody().setAngularFactor( 0, 0, 0 );
    }
    applyCentralImpulse(vector){
        this.getPhysicsBody().applyCentralImpulse(vector);
    }
    isOnGround(){
        
    }
    controlPlayer(direction){
        let maxSpeed = 25;
        // if speed limit is surpassed, don't do anything
        if(Math.abs(this.getVel()) > maxSpeed){
            this.setLinearVelocity(this.getXVel(), this.getYVel(), this.getZVel());
            return
        }

        let scalingFactor = 40;
        let jumpScale = 2.5;
        let moveLR =  this.getMoveDirection().right - this.getMoveDirection().left;
        let moveFB =  this.getMoveDirection().forward - this.getMoveDirection().back;
        let moveY =  this.getMoveDirection().up; 
    
        if( moveLR == 0 && moveY == 0 && moveFB == 0) return;

        let leftAngle = new THREE.Euler(0, Math.PI/2, 0);
        let rightAngle = new THREE.Euler(0, -Math.PI/2, 0)

        let playerForward = new THREE.Vector3(direction.x, 0, direction.z).normalize();
        let playerBack = new THREE.Vector3(-direction.x, 0, -direction.z).normalize();
        let playerLeft = new THREE.Vector3(direction.x, 0, direction.z).normalize().applyEuler(leftAngle);
        let playerRight = new THREE.Vector3(direction.x, 0, direction.z).normalize().applyEuler(rightAngle);
        let playerUp = new THREE.Vector3(0, 1, 0);
        let finalVector = new THREE.Vector3(0,0,0);

        // Forwards and backwards vectors
        if (moveFB === 1){
            // resultantImpulse = new Ammo.btVector3(direction.x, 0, direction.z)
            finalVector.add(playerForward);
        } else if (moveFB === -1){
            // resultantImpulse = new Ammo.btVector3(-direction.x, 0, -direction.z)
            finalVector.add(playerBack);
        }

        // Left and right vectors
        if (moveLR === 1){
            finalVector.add(playerRight);
        } else if (moveLR === -1){
            finalVector.add(playerLeft);
        }


        // ALL THE JUMP CODE IS PROBABLY BROKEN OH MY GOD
        // Jump vectors
        // console.log(this.getYVel())
        if (moveY === 1 /*&& Math.abs(this.getYVel()) <= 0.5*/ ){

			var tempVRayOrigin = new Ammo.btVector3();
			var tempVRayDest = new Ammo.btVector3();
			var closestRayResultCallback = new Ammo.ClosestRayResultCallback( tempVRayOrigin, tempVRayDest );
            var rayCallBack = Ammo.castObject( closestRayResultCallback, Ammo.RayResultCallback );

            rayCallBack.set_m_closestHitFraction(1);
            rayCallBack.set_m_collisionObject( null );


            tempVRayOrigin.setValue( this.getXPos(), this.getYPos(), this.getZPos() );
            tempVRayDest.setValue( this.getXPos(), this.getYPos()-100, this.getZPos() );
            closestRayResultCallback.get_m_rayFromWorld().setValue( this.getXPos(), this.getYPos(), this.getZPos() );
            closestRayResultCallback.get_m_rayToWorld().setValue( this.getXPos(), this.getYPos()-100, this.getZPos() );

            this.physicsWorld.rayTest( tempVRayOrigin, tempVRayDest, closestRayResultCallback );

            if ( closestRayResultCallback.hasHit() ) {
                var dist = Math.abs(this.getYPos() - this.scale.y/2 - closestRayResultCallback.get_m_hitPointWorld().y());
                console.log(this.getYPos() - this.scale.y/2 - closestRayResultCallback.get_m_hitPointWorld().y())
                if (dist < 0.05){
                    this.setLinearVelocity(this.getXVel(), 60, this.getZVel())
                }
                //if ( intersectionPoint ) {
                    // var point = closestRayResultCallback.get_m_hitPointWorld();
                    // intersectionPoint.set( point.x(), point.y(), point.z() );
                //}
                // if ( intersectionNormal ) {
                    // var normal = closestRayResultCallback.get_m_hitNormalWorld();
                    // intersectionNormal.set( normal.x(), normal.y(), normal.z() );
                // }
            }

            // this.getPhysicsBody().applyForce(new Ammo.btVector3(0, 60, 0), new Ammo.btVector3(0,0,0));

            // this.setLinearVelocity(this.getXVel(), 60, this.getZVel())

            // finalVector.add(playerUp);
            /*
            console.log("attempting to jump")
            // console.log(this.physicsWorld.getDispatcher().getManifoldByIndexInternal(0))
            
            let numManifolds = this.physicsWorld.getDispatcher().getNumManifolds();
            for (var i = 0; i < numManifolds; i++){
                var contactManifold = this.physicsWorld.getDispatcher().getManifoldByIndexInternal(i);
                
                // console.log(body1.getWorldTransform().getOrigin().y());
                // console.log(body2.getWorldTransform().getOrigin().y())

                var numContacts = contactManifold.getNumContacts();
                console.log("number of contacts: " + numContacts);
                if (numContacts > 0){
                    var objectA = contactManifold.getBody0();
                    var objectB = contactManifold.getBody1();

                    var otherBody = null;
                    var sign = 1.0;
                    console.log(objectA.getUserPointer())
                    if (objectA.getUserIndex() === this.getPhysicsBody().getUserIndex()){
                        otherBody = objectA;
                    } else if (objectB.getUserIndex() === this.getPhysicsBody().getUserIndex()){
                        otherBody = objectB;
                    }

                    if (otherBody){
                        var normal = contactManifold.getContactPoint(0).m_normalWorldOnB.op_mul(sign);
                        if (normal.length() > 0){
                            finalVector.add(playerUp);
                        }
                    }
                }
            }
            */
        }
        // shitty breakage ends here
        

        finalVector.normalize();
        let finalVectorBullet = new Ammo.btVector3(finalVector.x, finalVector.y * jumpScale,finalVector.z)
        finalVectorBullet.op_mul(scalingFactor);
        this.lockXYZRotation();
        this.applyCentralImpulse( finalVectorBullet );
    }
}