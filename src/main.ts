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
  isMobileDevice,
  setPositionFromTopLeft,
} from "@/helper";
import ChottyPng from "@/assets/chotty/chotty.png";
import ChottyDancePng from "@/assets/chotty/dance.png";
import ChottyMogumoguPng from "@/assets/chotty/mogumogu.png";
import data from "@/assets/data.json"

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

const app = document.getElementById("app")!;
app.style.width = `${canvasWidth}px`;
app.style.height = `${canvasHeight}px`;

const logo = document.getElementById("logo")!;
const startButton = document.getElementById("start")!;
const cover = document.getElementById("cover")!;
startButton.addEventListener("click", () => {
  startButton.style.display = "none";
  logo.style.display = "none";
  cover.style.display = "none";
});

const render = Render.create({
  element: document.getElementById("app")!,
  engine: engine,
  options: {
    width: canvasWidth,
    height: canvasHeight,
    background: "#83DFF3",
    wireframes: false,
    // showVelocity: true,
    // showCollisions: true,
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

let placeholderPosition = { x: 100, y: 100 };
const handleMove = (event: TouchEvent | MouseEvent) => {
  if (event.type === "touchmove") {
    event.preventDefault();
    // @ts-ignore
    var touch = event.touches[0];
    const rect = render.canvas.getBoundingClientRect();
    const scaleX = render.canvas.width / rect.width;
    const mouseX = (touch.clientX - rect.left) * scaleX;

    placeholderPosition = { x: mouseX, y: 100 };
  } else {
    const rect = render.canvas.getBoundingClientRect();
    const scaleX = render.canvas.width / rect.width;
    // @ts-ignore
    const mouseX = (event.clientX - rect.left) * scaleX;

    placeholderPosition = { x: mouseX, y: 100 };
  }
};
render.canvas.addEventListener("touchmove", handleMove);
if (!isMobileDevice()) {
  render.canvas.addEventListener("mousemove", handleMove);
}

let index = 0;
const images = [
  ChottyPng,
  ChottyDancePng,
  ChottyMogumoguPng,
];
Events.on(render, "afterRender", function() {
  if (placeholderPosition) {
    var context = render.context;
    const imageData = images[index % images.length];
    const image = new Image();
    image.src = imageData;
    const scale = 0.2;
    context.globalAlpha = 0.5;
    context.drawImage(
      image,
      placeholderPosition.x - (image.width / 2) * scale,
      placeholderPosition.y - (image.height / 2) * scale,
      image.width * scale,
      image.height * scale,
    );
    context.globalAlpha = 1;
  }
});

let chottyVertices: Vector[][] | undefined;
let chottyDanceVertices: Vector[][] | undefined;
let chottyMogumoguVertices: Vector[][] | undefined;

(async function() {
  console.log("init!");
  chottyVertices = data.chottyVertices;
  chottyDanceVertices = data.chottyDanceVertices;
  chottyMogumoguVertices = data.chottyMogumoguVertices;
  console.log("loaded");
})();

const createChotty = (
  x: number,
  y: number,
  vertices: Vector[][],
  texture: string,
) => {
  const chotty = Bodies.fromVertices(x, y, vertices, {
    label: "chotty",
    render: {
      sprite: {
        single: true,
        texture: texture,
        xScale: 0.2,
        yScale: 0.2,
      },
    },
    friction: 1,
    frictionAir: 0.05,
    restitution: 0.1,
  });
  Body.scale(chotty, 0.2, 0.2);
  return chotty;
};
const handleTouch = () => {
  const vertices = [
    chottyVertices,
    chottyDanceVertices,
    chottyMogumoguVertices,
    // chottyOmedetouVertices,
  ][index % 3];
  const image = images[index % 3];
  if (!vertices) return;
  const chotty = createChotty(
    placeholderPosition.x,
    placeholderPosition.y,
    vertices,
    image,
  );
  Composite.add(engine.world, chotty);
  index++;
};
render.canvas.addEventListener("touchend", handleTouch);
if (!isMobileDevice()) {
  render.canvas.addEventListener("mouseup", handleTouch);
}

// let offsetY = 0;
// const isStopped = (object: Matter.Body) => {
//   // オブジェクトの速度が非常に小さいかどうかを確認
//   if (
//     Math.abs(object.velocity.x) < 0.01 &&
//     Math.abs(object.velocity.y) < 0.01
//   ) {
//     return true;
//   }
//   return false;
// };
Events.on(engine, "beforeUpdate", function() {
  let allBodies = Composite.allBodies(engine.world);
  allBodies = allBodies.filter((body) => body.label === "chotty");
  if (!allBodies) return;
  // すべてのオブジェクトが停止しているかどうかを確認
  // const allStopped = allBodies.every(isStopped);
  // if (allStopped) {
  //   console.log("all stopped");
  //   let topMostObject = allBodies.reduce((topmost, body) => {
  //     return body.position.y < topmost.position.y ? body : topmost;
  //   }, allBodies[0]);
  //   if (!topMostObject) return;
  //   const objectY = topMostObject.position.y;
  //   if (objectY < canvasHeight / 2) {
  //     // 例：オブジェクトが画面の半分より上にある場合
  //     offsetY = objectY - canvasHeight / 2; // オブジェクトが中心になるようにオフセットを調整
  //   }
  //   console.log(offsetY);
  // }
});
Events.on(engine, "afterUpdate", function() {
  checkIfBoxesFell();
  // render.context.translate(0, offsetY); // 描画コンテキストをオフセットに従って移動
});
let count = 0;
const countElement = document.getElementById("count");

function checkIfBoxesFell() {
  // エンジンの世界にあるすべての物体を取得
  var bodies = Composite.allBodies(engine.world);
  // label: chotty count
  count = bodies.filter((v) => v.label === "chotty").length;
  countElement!.innerHTML = count.toString();

  bodies.forEach(function(body) {
    // 床のY座標よりも下にある場合
    if (body.position.y > ground.position.y) {
      // ボックスが床から落ちたと判定
      // 必要に応じて、ボックスを世界から削除
      Composite.remove(engine.world, body);
    }
  });
}
