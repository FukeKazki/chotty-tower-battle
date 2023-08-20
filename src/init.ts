import "@/styles/reset.css";
import "@/styles/style.css";
import "@/lib/pathseg.js";
// @ts-expect-error
import decomp from "poly-decomp";
import { Common } from "matter-js";
Common.setDecomp(decomp);
