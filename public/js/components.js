function containsObject(list, obj) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true;
    }
  }
  return false;
}

var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; };
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; };

function playSounds() {
  let elsToPlay = Array.from(document.querySelectorAll(".autoplay"));
  if (elsToPlay.length != 0 && elsToPlay.every(el => {
    if (el != null && el.components != null && el.components.sound != null) {
      el.components.sound.playSound();
      return true;
    } else {
      return false;
    }
  })) {
    document.removeEventListener("keydown", playSounds);
  }
}


function debug(thing) {
  this.log = this.log || "";
  this.log += thing + "\n";
  this.el = document.querySelector("#debug");
  if (this.el) {
    this.el.setAttribute('text', {value: this.log});
  }
  
}

window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener("keydown", playSounds);
});

AFRAME.registerComponent('passive-collide', {
  events: {
    "body-loaded": function() {
      this.el.body.collisionResponse = false;
    },
  }
});

AFRAME.registerComponent('imitate-position', {
  tick: function() {
    document.querySelector(this.data).object3D.getWorldPosition(this.el.object3D.position);
  }
});

AFRAME.registerComponent('asteroid-field', {
  schema: {
    count: {type: "number", default: 10}
  },
  init: function() {
    for (let i = 0; i < this.data.count; i ++) {
      let asteroidCollider = document.createElement('a-entity');
      asteroidCollider.setAttribute('mixin', 'asteroid-collider');
      asteroidCollider.setAttribute('position', {x: 50 - 100 * Math.random(), y: 50 - 100 * Math.random(), z: -50 - 100 * (i / 10)});
      asteroidCollider.setAttribute('rotation', {x: 360 * Math.random(), y: 360 * Math.random(), z: 360 * Math.random()});
      asteroidCollider.setAttribute('static-body', {shape: "sphere", sphereRadius: 18});
      asteroidCollider.setAttribute('scale', {x: 2, y:2, z:2});
      let asteroid = document.createElement('a-entity');
      asteroidCollider.setAttribute('mixin', 'asteroid');
      asteroidCollider.appendChild(asteroid);
      this.el.appendChild(asteroidCollider);
    }
  }
});

AFRAME.registerComponent("turret-mount", {
  tick: function() {
    this.el.object3D.rotation.y += 0.01;
  }
});

AFRAME.registerComponent("gun", {
  schema: {
    container: {type: "selector", default: "a-scene"},
    reload: {type: "number", default: 1000},
    power: {type: "number", default: 1},
    autoFire: {default: false}
  },
  init: function() {
    this.cooldown = 0;
    let el = this.el;
    this.velocity = new THREE.Vector3();
    this.oldWorldPos = new THREE.Vector3();
    this.newWorldPos = new THREE.Vector3();
    this.fire = function() {
      let bullet = document.createElement("a-entity");
      el.object3D.getWorldQuaternion(bullet.object3D.quaternion);
      bullet.object3D.position.copy(this.newWorldPos);
      bullet.setAttribute('bullet', {damage: this.data.power, startingVelocity: this.velocity});
      bullet.setAttribute('geometry', {primitive: 'tetrahedron', radius: 0.2});
      bullet.setAttribute('dynamic-body', {shape: 'sphere', mass: 10});
      this.data.container.appendChild(bullet);
      this.cooldown = this.data.reload;
    }
  },
  tick: function (time, timeDelta) {
    let el = this.el;

    el.object3D.getWorldPosition(this.newWorldPos);
    this.velocity.copy(this.newWorldPos);
    this.velocity.sub(this.oldWorldPos);
    if (timeDelta) {
      this.velocity.divideScalar(timeDelta / 1000);
    }


    this.oldWorldPos.copy(this.newWorldPos);

    if (this.cooldown <= 0) {
      if (this.data.autoFire) {
        this.fire();
      }
    }
    this.cooldown -= timeDelta;
  },
  events: {
    fire: function() {
      this.fire();
    }
  }
});

AFRAME.registerComponent("bullet", {
  dependencies: ['dynamic-body'],
  schema: {
    damage: {type: "number", default: 1},
    startingVelocity: {type: "vec3"}
  },
  init: function() {
    let el = this.el;
    this.age = 0;
  },
  tick: function(time, timeDelta) {
    let el = this.el;
    if (this.age == 0) {
      let q = new CANNON.Quaternion();
      let vel = el.body.velocity;
      vel.set(0, 0, -20);
      q.copy(el.object3D.quaternion);
      q.vmult(vel, vel);
      vel.vadd(this.data.startingVelocity, vel)
    }
    this.age += timeDelta;
    if (this.age > 5000) {
      el.parentNode.removeChild(el);
      el.destroy();
    }
  },
  events: {
    kill: function(event) {
      let el = this.el;
      if (el.parentNode) {
        el.parentNode.removeChild(el);
        el.destroy();
      }
    }
  }
});

AFRAME.registerComponent("model-for", {
  schema: {
    type: "selector",
  },
  events: {
    'model-loaded': function() {
      console.log(this);
      this.el.object3D.parent = this.data.object3D;
    }
  }
});
