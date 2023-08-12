import {
  Engine,
  Render,
  Runner,
  Bodies,
  Body,
  Composite,
  Events,
  Vector,
} from "matter-js";
import {
  getObjectWidth,
  getVerticesFromSvg,
  setPositionFromTopLeft,
} from "../../helper";
import ChottySvg from "../../assets/chotty/chotty.svg";
import ChottyPng from "../../assets/chotty/chotty.png";
import ChottyDanceSvg from "../../assets/chotty/dance.svg";
import ChottyDancePng from "../../assets/chotty/dance.png";
import ChottyMogumoguSvg from "../../assets/chotty/mogumogu.svg";
import ChottyMogumoguPng from "../../assets/chotty/mogumogu.png";
import ChottyOmedetouSvg from "../../assets/chotty/omedetou.svg";
import ChottyOmedetouPng from "../../assets/chotty/omedetou.png";

const engine = Engine.create();

const aspectRatio = 320 / 568;

// ビューポートのサイズを取得
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

// canvas のサイズを計算
let canvasWidth: number, canvasHeight: number;
if (viewportWidth / viewportHeight > aspectRatio) {
  canvasHeight = viewportHeight;
  canvasWidth = canvasHeight * aspectRatio;
} else {
  canvasWidth = viewportWidth;
  canvasHeight = canvasWidth / aspectRatio;
}

const render = Render.create({
  element: document.getElementById("app")!,
  engine: engine,
  options: {
    width: canvasWidth,
    height: canvasHeight,
    background: "#83DFF3",
    wireframes: false,
    showVelocity: true,
    showCollisions: true,
  },
});

Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);

const ground = Bodies.rectangle(0, 0, canvasWidth - 80, 32, {
  isStatic: true,
  render: {
    fillStyle: "#44AD33",
  },
  friction: 1,
  restitution: 0,
});
setPositionFromTopLeft(
  ground,
  // center
  (canvasWidth - getObjectWidth(ground)) / 2,
  canvasHeight - 104,
);

Composite.add(engine.world, ground);

let placeholderPosition = { x: 0, y: 0 };
render.canvas.addEventListener("mousemove", function(event) {
  const rect = render.canvas.getBoundingClientRect();
  const scaleX = render.canvas.width / rect.width;
  const mouseX = (event.clientX - rect.left) * scaleX;

  placeholderPosition = { x: mouseX, y: 100 };
});
let index = 0;
const images = [
  ChottyPng,
  ChottyDancePng,
  ChottyMogumoguPng,
  ChottyOmedetouPng,
];
Events.on(render, "afterRender", function() {
  if (placeholderPosition) {
    var context = render.context;
    const imageData = images[index % images.length];
    const image = new Image();
    image.src = imageData;
    const scale = 0.5;

    context.drawImage(
      image,
      placeholderPosition.x - (image.width / 2) * scale,
      placeholderPosition.y - (image.height / 2) * scale,
      image.width * scale,
      image.height * scale,
    );
  }
});

const loadAssets = async (url: string[]) => {
  return Promise.all(url.map((v) => getVerticesFromSvg(v)));
};

let chottyVertices: Vector[][] | undefined;
let chottyDanceVertices: Vector[][] | undefined;
let chottyMogumoguVertices: Vector[][] | undefined;
let chottyOmedetouVertices: Vector[][] | undefined;

const save = () => {
  localStorage.setItem(
    "chotty-tower-battle",
    JSON.stringify({
      chottyVertices,
      chottyDanceVertices,
      chottyMogumoguVertices,
      chottyOmedetouVertices,
    }),
  );
};
(async function() {
  console.log("init!");
  const cache = localStorage.getItem("chotty-tower-battle");
  if (cache) {
    const data = JSON.parse(cache);
    chottyVertices = data.chottyVertices;
    chottyDanceVertices = data.chottyDanceVertices;
    chottyMogumoguVertices = data.chottyMogumoguVertices;
    chottyOmedetouVertices = data.chottyOmedetouVertices;
  } else {
    [
      chottyVertices,
      chottyDanceVertices,
      chottyMogumoguVertices,
      chottyOmedetouVertices,
    ] = await loadAssets([
      ChottySvg,
      ChottyDanceSvg,
      ChottyMogumoguSvg,
      ChottyOmedetouSvg,
    ]);
    save();
  }
  console.log("loaded");
})();

const createChotty = (
  x: number,
  y: number,
  vertices: Vector[][],
  texture: string,
) => {
  const chotty = Bodies.fromVertices(x, y, vertices, {
    render: {
      sprite: {
        single: true,
        texture: texture,
        xScale: 0.5,
        yScale: 0.5,
      },
    },
    friction: 1,
    frictionAir: 0.05,
    restitution: 0.1,
  });
  Body.scale(chotty, 0.5, 0.5);
  return chotty;
};
render.canvas.addEventListener("mouseup", function() {
  const vertices = [
    chottyVertices,
    chottyDanceVertices,
    chottyMogumoguVertices,
    chottyOmedetouVertices,
  ][index % 4];
  const image = images[index % 4];
  if (!vertices) return;
  const chotty = createChotty(
    placeholderPosition.x,
    placeholderPosition.y,
    vertices,
    image,
  );
  Composite.add(engine.world, chotty);
  index++;
});
