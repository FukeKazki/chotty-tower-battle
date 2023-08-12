import Matter from "matter-js";

export const getVerticesFromSvg = async (path: string) => {
  const svgDoc = await fetch(path)
    .then((response) => response.text())
    .then((svgString) => {
      // SVG文字列からpathデータを抽出
      const parser = new DOMParser();
      return parser.parseFromString(svgString, "image/svg+xml");
    });
  const pathDatas = svgDoc.querySelectorAll("path");
  if (!pathDatas) return;
  // pathデータをverticesに変換
  const vertices = Array.from(pathDatas).map((pathData) => {
    return Matter.Svg.pathToVertices(pathData, 10);
  });
  // const vertices = Matter.Svg.pathToVertices(pathData, 10); // 30はスケール、必要に応じて調整
  return vertices;
};

/**
 * Matter.Body.setPositionの代わりに、左上を基準にした位置を設定する
 *
 */
export const setPositionFromTopLeft = (body: Matter.Body, x = 0, y = 0) => {
  Matter.Body.setPosition(body, {
    x: x + body.position.x - body.bounds.min.x,
    y: y + body.position.y - body.bounds.min.y,
  });
};

/**
 * オブジェクトをcanvasに併せてスケールする
 */
export const fitCanvas = (body: Matter.Body, canvasHeight: number) => {
  const objectHeight = body.bounds.max.y - body.bounds.min.y;
  const scale = canvasHeight / objectHeight;
  Matter.Body.scale(body, scale, scale);
};

export const getObjectWidth = (body: Matter.Body) => {
  return body.bounds.max.x - body.bounds.min.x;
};
