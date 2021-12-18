AFRAME.registerComponent('lever', {
  multiple: true,
  schema: {
    target: {type: "selector", default: ""},
    leverAxis: {type: "string", default: "x"},
    direction: {type: "vec3", default: {x: 1, y: 0, z: 0}},
    controls: {type: "string"},
    inverted: {type: "boolean", default: false}
  },
  init: function() {
    let el = this.el;
    this.dragged = false;
    this.leverRot = el.object3D.rotation;
    this.pos = new THREE.Vector3();
    this.oldPos = new THREE.Vector3();
    this.dist = new THREE.Vector3();
    this.leverRot = 0;
    this.el.setAttribute('clickable', "");
    this.calcPos = function(pos, quat = null) {
      if (quat) {
        this.pos.set(0, 0, -1);
        this.pos.applyQuaternion(quat);
        this.pos.add(pos);
      } else {
        this.pos.copy(pos);
        this.pos.multiplyScalar(2); // make it more sensative
      }
    }
    this.calcDist = function() {
      this.dist.copy(this.pos);
      this.dist.sub(this.oldPos);
    }
  },
  tick: function() {
    let el = this.el;

    if (this.camPos || this.handPos) {
      if (this.camPos) {
        this.calcPos(this.camPos, this.camQuat);
      } else {
        this.calcPos(this.handPos);
      }
      this.calcDist();
      let newRot = this.oldLeverRot + 4 * this.dist.dot(this.data.direction);
      newRot = Math.max(Math.min(newRot, 0.5), -0.5);
      this.el.object3D.rotation[this.data.leverAxis] = - newRot;
      let input = {};
      input[this.data.controls] = newRot * 2 * (this.data.inverted ? -1 : 1);
      this.data.target.emit('process', input);
    } else {
      this.el.object3D.rotation[this.data.leverAxis] *= 0.9;
    }
  },
  events: {
    "grab-start": function(event) {
      if (event.detail.hand.getAttribute('hand-controls')) {
        this.camPos = null;
        this.camQuat = null;
        this.handPos = event.detail.hand.object3D.position;
        this.handQuat = event.detail.hand.object3D.quaternion;
        this.calcPos(this.handPos);
      } else {
        this.handPos = null;
        this.handQuat = null;
        this.camPos = this.el.sceneEl.camera.el.object3D.position;
        this.camQuat = this.el.sceneEl.camera.el.object3D.quaternion;
        this.calcPos(this.camPos, this.camQuat);
      }
      this.oldPos.copy(this.pos)
      this.oldLeverRot = this.el.object3D.rotation[this.data.leverAxis];
    },
    "grab-end": function(event) {
      this.camPos = null;
      this.camQuat = null;
      this.handPos = null;
      this.handQuat = null;
    },
  }
});

AFRAME.registerComponent("button", {
  schema: {
    target: {type: "selector"},
    event: {type: "string"}
  },
  events: {
    'hover-start': function() {
      if (this.data.event) {
        this.data.target.emit(this.data.event);
      }
    }
  }
});
