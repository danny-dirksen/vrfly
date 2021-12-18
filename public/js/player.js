AFRAME.registerComponent('player', {
  schema: {
    vehicle: {type: 'selector'}
  },
  init: function() {
    console.log(this.data.vehicle)
  },
  events: {
    "switch-vehicle": function(event) {
      this.el.setAttribute('player', 'vehicle', event.detail.vehicle);
    },
    "exit-vehicle": function() {
      this.el.setAttribute('player', 'vehicle', null);
    }
  }
});

AFRAME.registerComponent('custom-hand-model', {
  dependencies: ['hand-controls'],
  schema: {
    type: "selector",
  },
  init: function() {
    this.el.object3DMap.mesh = this.data.object3DMap.mesh;
    debug(this.data.object3DMap);
  }
});
