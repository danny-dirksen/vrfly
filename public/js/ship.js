AFRAME.registerComponent('wasd-ship', {
  init: function () {
    this.controls = {
      turnUp: "83",
      turnDown: "87",
      turnLeft: "81",
      turnRight: "69",
      rollLeft: "65",
      rollRight: "68",
      forward: "32",
      back: "16",
    };
  },

  tick: function () {
    let el = this.el;
    let engineAtt = el.getAttribute('ship-engines');
    if (engineAtt) {
      let inputs = {
        upDown: 0,
        leftRight: 0,
        rollLeftRight: 0,
        backForward: 0,
      };
      if (pressedKeys[this.controls.turnUp]) {
        inputs.upDown ++;
      }
      if (pressedKeys[this.controls.turnDown]) {
        inputs.upDown --;
      }
      if (pressedKeys[this.controls.turnLeft]) {
        inputs.leftRight --;
      }
      if (pressedKeys[this.controls.turnRight]) {
        inputs.leftRight ++;
      }
      if (pressedKeys[this.controls.rollLeft]) {
        inputs.rollLeftRight --;
      }
      if (pressedKeys[this.controls.rollRight]) {
        inputs.rollLeftRight ++;
      }
      if (pressedKeys[this.controls.back]) {
        inputs.backForward --;
      }
      if (pressedKeys[this.controls.forward]) {
        inputs.backForward ++;
      }
      el.emit('process', inputs);
    }
  }
});

AFRAME.registerComponent('ship-engines', {
  init: function() {
    let el = this.el;
    let forceVec = this.forceVec = new CANNON.Vec3();
    let forcePos = this.forcePos = new CANNON.Vec3();
    el.addEventListener("process", function(event) {
      let inputs = {
        upDown: 0,
        leftRight: 0,
        rollLeftRight: 0,
        backForward: 0,
        ...event.detail
      };
      if (el.body) {
        let power = 3000;
        let dist = 2000;
        forceVec.set(
          power / dist * inputs.leftRight,
          power / dist * inputs.upDown,
          -power * inputs.backForward
        );
        forcePos.set(0, 0, -dist);
        el.body.applyLocalForce(forceVec, forcePos);

        forceVec.set(0, - power / dist * inputs.rollLeftRight, 0);
        forcePos.set(dist, 0, 0);
        el.body.applyLocalForce(forceVec, forcePos);
      }
    });
  }
});

AFRAME.registerComponent('dynamic-body-ship', {
  init: function () {
    let el = this.el;
    el.addEventListener("model-loaded", (event) => {
      setTimeout(() => {
        if (el.components["gltf-model"].model === event.detail.model) {
          el.setAttribute("dynamic-body", {
            shape: "none",
            mass: 1000
          });
          el.setAttribute("shape__main", {
            shape: "box",
            offset: {x: 0, y: 0.1, z: -0.6},
            halfExtents: {x: 0.5, y: 0.9, z: 1.5}
          });
          el.setAttribute("shape__back", {
            shape: "box",
            offset: {x: 0, y: 0.1, z: 2.2},
            halfExtents: {x: 0.5, y: 0.9, z: 0.1}
          });
          el.setAttribute("shape__wings", {
            shape: "box",
            offset: {x: 0, y: 0.3, z: 1.5},
            halfExtents: {x: 1.6, y: 0.1, z: 0.5}
          });
        }
      }, 1000);
    });
  }
});

AFRAME.registerComponent('directional-drag', {
  schema: {
    intensity: {type: 'number', default: 1},
    angularDamping: {type: 'number', default: 0.5},
  },
  init: function() {
    this.on = true;
    this.vector = new CANNON.Vec3(0, 0, -1);
  },
  tick: function(time, timeDelta) {
    let el = this.el;
    if (this.on && el.getAttribute('dynamic-body')) {
      this.vector.set(0, 0, -1);
      el.body.quaternion.vmult(this.vector, this.vector)
      let dot = this.vector.dot(el.body.velocity);
      this.vector.scale(dot, this.vector);
      el.body.velocity.lerp(this.vector, timeDelta / 1000 * this.data.intensity, el.body.velocity);
    }
  },
  events: {
    'body-loaded': function(event) {
      if (this.el.body) {
        this.el.body.angularDamping = this.data.angularDamping;
      }
    },
    'damp-off': function() {
      this.on = false;
      if (this.el.body) {
        this.el.body.angularDamping = 0.01;
      }
    },
    'damp-on': function() {
      this.on = true;
      if (this.el.body) {
        this.el.body.angularDamping = this.data.angularDamping;
      }
    }
  }
});

AFRAME.registerComponent("hp", {
  schema: {
    max: {type: "number", default: 5}
  },
  init: function() {
    this.hp = this.data.max;
    this.healthBar = null;
  },
  events: {
    collide: function(event) {

      let other = event.detail.body.el
      let bullAtt = other.getAttribute('bullet');
      if (bullAtt) {
        other.emit('kill');
        this.el.emit('oof');
        this.hp -= bullAtt.damage;
        this.hp = Math.max(this.hp, 0);
        if (this.healthBar) {
          this.healthBar.object3D.scale.x = this.hp / this.data.max;
        }
        //console.log("Ouch. " + this.hp + " hp left.");
        if (this.hp <= 0) {
          //console.log("BOOM");
        }
      } else {
        this.el.emit('bump');
      }
    },
    setHealthBar: function(event) {
      this.healthBar = event.detail;

    }
  }
});

AFRAME.registerComponent("health-bar", {
  tick: function() {
    if (!this.found) {
      this.target = document.querySelector(this.data);
      if (this.target) {
        this.target.emit('setHealthBar', this.el);
        this.found = true;
      }
    }

  }
});
