"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import ForceGraph2D from "react-force-graph-2d";
import _ from "lodash";
import { Spinner } from "./Spinner";
import { getChainData } from "../lib/config";
import { toArray } from "../lib/parser";
import { isString, equalsIgnoreCase } from "../lib/string";
import { isNumber, toNumber } from "../lib/number";
import { chainData } from "../constants/ChainData";

const preloadImagePromise = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = img.onabort = () => reject();
    img.src = src;
    img.crossOrigin = "anonymous";
  });

const getImageAsync = async (url) => {
  try {
    return await preloadImagePromise(url);
  } catch (error) {
    return null;
  }
};

const useImagePreloader = (images) => {
  const [imagesMap, setImagesMap] = useState({});

  useEffect(() => {
    const preloadImages = async () => {
      images.forEach(async (url) => {
        if (imagesMap[url]) return;
        const image = await getImageAsync(url);
        if (image !== null) setImagesMap((d) => ({ ...d, [url]: image }));
      });
    };
    if (images) preloadImages();
  }, [images, imagesMap]);

  return imagesMap;
};

const drawNode = (node, ctx, globalScale, isSelected, image) => {
  let { x, y } = node;
  if (x === undefined || y === undefined) return;

  const radius =
    (TIERS.length + 1 + Math.pow(2, TIERS.length + 1 - (node.tier || 1))) / 2;
  const fillStyleOpecity = isSelected ? "1a" : "0d";

  if (node.color && isSelected) {
    ctx.strokeStyle = node.color;
    ctx.fillStyle = `${node.color}${fillStyleOpecity}`;
    ctx.beginPath();
    ctx.lineWidth = 4 / globalScale;

    const animatedPos = node.__animatedPos;
    if (animatedPos && animatedPos.length > 0) {
      const coord = animatedPos.splice(0, 1);
      node.__animatedPos = animatedPos;
      node.x = x = coord[0].x;
      node.y = y = coord[0].y;
    }

    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 16 * globalScale;
  } else {
    ctx.shadowColor = null;
    ctx.shadowBlur = null;
  }

  if (image) {
    const logoRadius = radius - 0.5;
    ctx.drawImage(
      image,
      x - logoRadius,
      y - logoRadius,
      logoRadius * 2,
      logoRadius * 2
    );
  }
};

const drawTitle = (node, ctx, isSelected, theme) => {
  const fontSize = 2;
  const { x, y } = node;
  if (x === undefined || y === undefined) return;

  const radius =
    (TIERS.length +
      1 +
      Math.pow(2, TIERS.length + 1 - (node.tier || 1)) +
      fontSize) /
    2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${
    isSelected ? "700" : "600"
  } ${fontSize}px Inter, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif`;
  ctx.fillStyle =
    theme === "dark"
      ? isSelected
        ? "#f4f4f5"
        : "#d4d4d8"
      : isSelected
      ? "#18181b"
      : "#3f3f46";
  ctx.fillText(node.label, x, y + radius);
};

const drawNodeCanvasObject = (
  node,
  ctx,
  globalScale,
  selectedNode,
  links,
  images,
  theme
) => {
  if (!node || node.x === undefined || node.y === undefined) return;
  const isSelected = node.id === selectedNode?.id;
  drawNode(node, ctx, globalScale, isSelected, images?.[node.image]);
  drawTitle(node, ctx, isSelected, theme);
};

const useNodeCanvasObject = (selectedNode, links, images, theme) =>
  useCallback(
    (node, ctx, globalScale) =>
      drawNodeCanvasObject(
        node,
        ctx,
        globalScale,
        selectedNode,
        links,
        images,
        theme
      ),
    [selectedNode, links, images, theme]
  );

const COMET_SPEED = 0.0033;
const COMET_LENGTH = 3;

const drawLine = (link, ctx, scale, isSelected, theme) => {
  if (isString(link.source) || isString(link.target)) return;
  if (
    link.source.x != null &&
    link.source.y != null &&
    link.target.x != null &&
    link.target.y != null
  ) {
    ctx.lineWidth = 0.5 / scale;
    ctx.strokeStyle =
      theme === "dark"
        ? isSelected
          ? "#e4e4e7"
          : "#27272a"
        : isSelected
        ? "#52525b"
        : "#e4e4e7";
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
  }
};

const calculateAndDrawComet = (
  ctx,
  targetX,
  sourceX,
  targetY,
  sourceY,
  commetProgress,
  color,
  theme
) => {
  const diffX = targetX - sourceX;
  const diffY = targetY - sourceY;
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);

  const endProgress = commetProgress - COMET_LENGTH / distance;
  const cometEndProgress = endProgress > 0 ? endProgress : 0;
  const cometStartX = sourceX + diffX * commetProgress || 0;
  const cometStartY = sourceY + diffY * commetProgress || 0;
  const cometEndX = sourceX + diffX * cometEndProgress || 0;
  const cometEndY = sourceY + diffY * cometEndProgress || 0;

  const gradient = ctx.createLinearGradient(
    cometStartX,
    cometStartY,
    cometEndX,
    cometEndY
  );
  gradient.addColorStop(
    0,
    `${color || (theme === "dark" ? "#f4f4f5" : "#18181b")}ff`
  );
  gradient.addColorStop(
    1,
    `${color || (theme === "dark" ? "#f4f4f5" : "#18181b")}00`
  );

  ctx.strokeStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(cometStartX, cometStartY);
  ctx.lineTo(cometEndX, cometEndY);
  ctx.stroke();
};

const drawCommet = (link, ctx, theme) => {
  if (typeof link.source === "string" || typeof link.target === "string")
    return;
  const { x: sourceX, y: sourceY } = link.source;
  const { x: targetX, y: targetY } = link.target;
  if (
    sourceX === undefined ||
    sourceY === undefined ||
    targetX === undefined ||
    targetY === undefined
  )
    return;

  const comet = link.__comet || { __progress: 0 };
  comet.__progress += COMET_SPEED;
  if (comet.__progress >= 1) {
    link.__comet = undefined;
    return;
  }

  calculateAndDrawComet(
    ctx,
    targetX,
    sourceX,
    targetY,
    sourceY,
    comet.__progress,
    link.color,
    theme
  );
  link.__comet = comet;
};

const drawLinkCanvasObject = (link, ctx, scale, selectedNode, theme) => {
  if (!link) return;
  drawLine(
    link,
    ctx,
    scale,
    [link.source?.id, link.target?.id].includes(selectedNode?.id),
    theme
  );
  drawCommet(link, ctx, theme);
};

const useLinkCanvasObject = (selectedNode, theme) =>
  useCallback(
    (value, ctx, globalScale) =>
      drawLinkCanvasObject(value, ctx, globalScale, selectedNode, theme),
    [selectedNode, theme]
  );

const TIERS = [
  { id: 1, n_sd: 0.25 },
  { id: 2, n_sd: -0.25 },
  { id: 3, n_sd: null },
];

const MEAN = (data, field = "num_txs") =>
  _.mean(toArray(data).map((d) => toNumber(d[field])));

const SD = (data, field = "num_txs") => {
  data = toArray(data);
  if (data.length === 0) return 0;
  return Math.sqrt(
    _.sum(
      data.map((d) => Math.pow(toNumber(d[field]) - MEAN(data, field), 2))
    ) / data.length
  );
};

const THRESHOLD = (data, n_sd, field = "num_txs") =>
  !isNumber(n_sd) ? 0 : MEAN(data, field) + n_sd * SD(data, field);

export default function NetworkGraph({ data, setChainFocus }) {
  const graphRef = useRef();
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [page, setPage] = useState(1);
  const { resolvedTheme } = useTheme();
  const chains = chainData;


  useEffect(() => {
    const fg = graphRef.current;
    fg?.d3Force("link", null);
    fg?.d3Force("charge")?.strength(20);
    fg?.d3Force("center")?.strength(0);
  }, []);

  useEffect(() => {
 
    if (data && chains) {

      const AXELAR = "axelarnet";

      const _data = _.orderBy(
        Object.entries(
          _.groupBy(
            data.flatMap((d) => {
              if ([d.sourceChain, d.destinationChain].includes(AXELAR))
                return d;
              return [
                [d.sourceChain, AXELAR],
                [AXELAR, d.destinationChain],
              ].map((ids, i) => ({
                ...d,
                id: ids.join("_"),
                [i === 0 ? "destinationChain" : "sourceChain"]: AXELAR,
              }));
            }),
            "id"
          )
        ).map(([k, v]) => ({
          id: k,
          ..._.head(v),
          num_txs: _.sumBy(v, "num_txs"),
          volume: _.sumBy(v, "volume"),
        })),
        ["num_txs"],
        ["desc"]
      );

      chains
        .filter((d) => (!d.maintainer_id || !d.no_inflation) && d.id !== AXELAR)
        .forEach((d) => {
          [
            [d.id, AXELAR],
            [AXELAR, d.id],
          ]
            .map((ids) => ids.join("_"))
            .forEach((id, i) => {
              if (_data.findIndex((d) => equalsIgnoreCase(d.id, id)) < 0) {
                _data.push({
                  id,
                  sourceChain: i === 0 ? d.id : AXELAR,
                  destinationChain: i === 0 ? AXELAR : d.id,
                  num_txs: 0,
                });
              }
            });
        });

      let nodes = [];
      const edges = [];

      toArray(_data).forEach((d) => {
        ["source", "destination"].forEach((s) => {
          const id = d[`${s}Chain`];

          if (id && nodes.findIndex((n) => equalsIgnoreCase(n.id, id)) < 0) {
            const { name, image, color } = { ...getChainData(id, chains) };
      
            if (name)
              nodes.push({
                id,
                image,
                label: name,
                color,
                num_txs: _.sumBy(
                  _data.filter((d) =>
                    [d.sourceChain, d.destinationChain].includes(id)
                  ),
                  "num_txs"
                ),
              });
          }
        });

        if (
          ["source", "destination"].findIndex(
            (s) =>
              nodes.findIndex((n) => equalsIgnoreCase(n.id, d[`${s}Chain`])) < 0
          ) < 0
        ) {
          const { color } = { ...getChainData(d.sourceChain, chains) };

          edges.push({
            data: d,
            id: d.id,
            source: d.sourceChain,
            target: d.destinationChain,
            color,
          });
        }
      });

      const tiers = TIERS.map((d) => ({
        ...d,
        threshold: THRESHOLD(
          nodes.filter((d) => d.id !== AXELAR),
          d.n_sd
        ),
      }));
      nodes = _.orderBy(
        nodes.map((d) => ({
          ...d,
          tier:
            d.id === AXELAR
              ? 0
              : tiers.find((t) => t.threshold <= d.num_txs)?.id,
        })),
        ["num_txs"],
        ["desc"]
      );

      setGraphData({ nodes, edges });
    }
  }, [data, resolvedTheme, chains, setGraphData]);

  useEffect(() => {
    if (!page) setPage(1);
  }, [page, setPage]);

  const { nodes, edges } = { ...graphData };
  const imagesUrl = useMemo(() => toArray(nodes).map((d) => d.image), [nodes]);
  const images = useImagePreloader(toArray(imagesUrl));
  const imagesLoaded =
    chains && Object.keys({ ...images }).length / chains.length >= 0.75;
  const nodeCanvasObject = useNodeCanvasObject(
    selectedNode,
    edges,
    images,
    resolvedTheme
  );
  const linkCanvasObject = useLinkCanvasObject(selectedNode, resolvedTheme);
  const filteredData = toArray(data).filter(
    (d) =>
      !selectedNode?.id ||
      [d.sourceChain, d.destinationChain].includes(selectedNode.id)
  );
  const size = 10;

  const handleNodeClick = useCallback(
    (node) => {
      setSelectedNode(node);
      setPage(undefined);
      if (setChainFocus) setChainFocus(node.id);

      // Center and zoom on the clicked node
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(8, 2000);
    },
    [setChainFocus]
  );

  const handleBackGroundClick = useCallback(() => {
    setSelectedNode(null);
    setPage(undefined);
    if (setChainFocus) setChainFocus(null);

    // Reset the graph to its initial position
    graphRef.current.centerAt(0, 0, 1000);
    graphRef.current.zoom(1, 2000);
  }, [setChainFocus]);

  const handleCenterNodeClick = useCallback(
    (node) => {
      setSelectedNode(node);
      setPage(undefined);
      if (setChainFocus) setChainFocus(node.id);

      // Center the graph and zoom out
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(1, 2000);
    },
    [setChainFocus]
  );



  return !data || !(graphData && imagesLoaded) ? (
    <Spinner />
  ) : (
    <div className="grid lg:gap-x-4 xl:gap-x-16">
      <div className="ml-4 -mt-4 xl:-mt-2">
        <ForceGraph2D
          ref={graphRef}
          graphData={{ nodes, links: edges }}
          width={648}
          height={632}
          backgroundColor={resolvedTheme === "dark" ? "#18181b" : "#ffffff"}
          showNavInfo={false}
          nodeCanvasObject={nodeCanvasObject}
          onNodeDrag={handleNodeClick}
          linkCanvasObject={linkCanvasObject}
          onNodeClick={(node) => {
            if (node.id === "axelarnet") {
              // Assuming 'axelarnet' is the ID of your center node
              handleCenterNodeClick(node);
            } else {
              handleNodeClick(node);
            }
          }}
          onLinkClick={handleBackGroundClick}
          onBackgroundClick={handleBackGroundClick}
          maxZoom={8}
          minZoom={5}
          cooldownTime={Infinity}
          enableZoomInteraction={true}
          enableNodeDrag={true}
        />
      </div>
    </div>
  );
}
