import * as Zdog from "zdog";

let isSpinning = true;

let illo = new Zdog.Illustration({
    element: document.getElementById("zdog-canvas") as HTMLCanvasElement,
    zoom: 5,
    dragRotate: true,
    // stop spinning when drag starts
    onDragStart: function() {
        isSpinning = false;
    },
});

// circle
new Zdog.Ellipse({
    addTo: illo,
    diameter: 20,
    translate: { z: 10 },
    stroke: 5,
    color: 'rgba(0.5, 0.4, 0.8, 0.2)',
});

// square
new Zdog.Rect({
    addTo: illo,
    width: 20,
    height: 20,
    translate: { z: -10 },
    stroke: 5,
    color: '#E62',
    fill: false,
});

function animate() {
    illo.rotate.y += isSpinning ? 0.03 : 0;
    illo.updateRenderGraph();
    requestAnimationFrame( animate );
}
animate();
